#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv,pick} from './lib/csv.mjs';
import {table} from './lib/format.mjs';

export const reports={
 'panel':'select code,name,segment,eligibility,contacts_30d,last_contact from v_panel order by code',
 'eligible':'select code,name,segment from v_panel where eligibility=\'ready\' order by code',
 'quota-gaps':'select study,segment,target,filled,completed,gap,due_on from v_quotas order by study,segment',
 'session-week':"select code,study,participant,researcher,starts_at,status from v_sessions where status='scheduled' and starts_at<current_date+7 order by starts_at,code",
 'consent-review':"select code,name,consent,consent_version,retention_review_on from participants where consent<>'granted' or retention_review_on is null or retention_review_on<current_date order by code",
 'contact-pressure':"select code,name,segment,contacts_30d,last_contact,eligibility from v_panel where contacts_30d>0 or eligibility='cooldown' order by contacts_30d desc,code",
 'incentives-due':"select e.code,s.code study,p.code participant,e.incentive_cents,e.currency from participations e join studies s on s.id=e.study_id join participants p on p.id=e.participant_id where e.status='completed' and e.incentive_cents>0 and e.settled_on is null order by e.code",
 'no-shows':"select s.code study,count(*) filter(where e.status='completed')::int completed,count(*) filter(where e.status='no-show')::int no_shows from studies s left join participations e on e.study_id=s.id group by s.code order by s.code",
 'coverage':"select segment,count(*)::int panel_size,count(*) filter(where eligibility='ready')::int ready,count(*) filter(where eligibility<>'ready')::int blocked from v_panel group by segment order by segment",
 'researcher-load':"select researcher,count(*)::int sessions,round(sum(extract(epoch from (ends_at-starts_at))/60))::int minutes from participations where status='scheduled' group by researcher order by sessions desc,researcher",
 'attention':'select * from v_attention order by issue,reference',
 'compliance':'select * from v_compliance order by rule,reference',
 'activity':'select actor,action,entity,entity_id,note,created_at from activity order by created_at,id'
};
const spec={
 help:[],...Object.fromEntries(Object.keys(reports).map(k=>[k,[]])),
 list:['kind'],show:['person'], 'weekly-review':[],
 add:['code','name','email','segment','actor'],
 'record-consent':['person','state','version','evidence','notice','on','review-on','actor'],
 'review-history':['person','evidence','on','actor'],
 'log-contact':['person','on','evidence','actor'],
 'open-study':['code','title','owner','purpose','version','due-on','actor'],
 'set-quota':['study','segment','target','actor'],
 shortlist:['code','study','person','incentive-cents','currency','actor'],
 'record-invitation':['ref','on','evidence','actor'],
 schedule:['ref','researcher','start','end','consent-evidence','actor'],
 outcome:['ref','state','evidence','actor'],
 'record-incentive':['ref','on','evidence','actor'],
 'close-study':['study','evidence','actor'],
 log:['person','note','actor'],
 import:['file','map','dry-run','update','actor'],
 export:['file','kind'],
 'draft-invitations':['study'], 'draft-weekly':[]
};
export const commands=Object.keys(spec);
const kinds=['participants','studies','quotas','participations','contacts','activity','policy'];
const writes=new Set(['add','record-consent','review-history','log-contact','open-study','set-quota','shortlist','record-invitation','schedule','outcome','record-incentive','close-study','log','import']);
const need=(o,k)=>{if(typeof o[k]!=='string'||!o[k].trim())throw Error(`Required --${k}=value`);return o[k].trim();};
function day(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)throw Error('Date must be a real YYYY-MM-DD');return v;}
function instant(v){if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})$/.test(v))throw Error('Time needs ISO date, time and explicit offset');day(v.slice(0,10));const d=new Date(v);if(!Number.isFinite(d.getTime()))throw Error('Invalid time');return d.toISOString();}
function integer(v,min=0){if(!/^\d+$/.test(String(v))||!Number.isSafeInteger(Number(v))||Number(v)<min||Number(v)>2147483647)throw Error('Expected nonnegative integer within storage range');return Number(v);}
function email(v){v=v.toLowerCase().trim();if(!/^[^ @*]+@[^ @*]+\.[^ @*]+$/.test(v))throw Error('Email missing, masked or invalid: export with PII permission');return v;}
async function dateNow(db){return (await db.query('select current_date today'))[0].today;}
async function pastDay(db,v){v=day(v);if(v>await dateNow(db))throw Error('Evidence date cannot be in the future');return v;}
async function resolve(db,kind,ref,label='name'){
 const exact=await db.query(`select * from ${kind} where lower(code)=lower($1) or id::text=$1`,[ref]);if(exact.length===1)return exact[0];
 const rows=await db.query(`select * from ${kind} where id::text like $1 or position(lower($2) in lower(${label}))>0 order by code`,[ref+'%',ref]);
 if(rows.length!==1)throw Error(rows.length?`Ambiguous ${kind}: ${rows.map(x=>x.code+' '+x[label]).join(', ')}`:`No ${kind} match: ${ref}`);return rows[0];
}
const person=(db,o)=>resolve(db,'participants',need(o,'person'));
const study=(db,o)=>resolve(db,'studies',need(o,'study'),'title');
const participation=(db,o)=>resolve(db,'participations',need(o,'ref'),'code');
async function audit(db,actor,action,entity,before,after,note=null){await db.query('insert into activity(actor,action,entity,entity_id,before_data,after_data,note) values($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7)',[actor,action,entity,after?.id||before?.id||null,JSON.stringify(before),JSON.stringify(after),note]);}
async function insert(db,kind,data,o,action){const ks=Object.keys(data);const row=(await db.query(`insert into ${kind}(${ks.join(',')}) values(${ks.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,ks.map(k=>data[k])))[0];await audit(db,o.actor,action,kind,null,row);return row;}
async function update(db,kind,before,data,o,action){const ks=Object.keys(data);const row=(await db.query(`update ${kind} set ${ks.map((k,i)=>k+'=$'+(i+1)).join(',')} where id=$${ks.length+1} returning *`,[...ks.map(k=>data[k]),before.id]))[0];await audit(db,o.actor,action,kind,before,row);return row;}
async function eligible(db,p,s,{allowPressure=false}={}){
 const v=(await db.query('select * from v_panel where id=$1',[p.id]))[0];
 if(v.eligibility!=='ready'&&!(allowPressure&&v.eligibility==='contact-limit'))throw Error(`Participant blocked: ${v.eligibility}`);
 if(s.status!=='open')throw Error('Study is closed');
 if(p.consent_version!==s.consent_version)throw Error('Consent version does not match study');
}
function privateFile(file,content){fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});fs.writeFileSync(file,content,{mode:0o600});fs.chmodSync(file,0o600);return file;}
function csv(rows){if(!rows.length)return '';const keys=Object.keys(rows[0]);const cell=v=>{let s=typeof v==='object'&&v!==null?JSON.stringify(v):String(v??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};return [keys,...rows.map(r=>keys.map(k=>r[k]))].map(r=>r.map(cell).join(',')).join('\r\n')+'\r\n';}

export async function run(db,cmd,o={},pos=[]){
 if(!spec[cmd])throw Error(`Unknown command: ${cmd}`);
 for(const k of Object.keys(o))if(k!=='json'&&!spec[cmd].includes(k))throw Error(`Unknown option --${k} for ${cmd}`);
 for(const k of ['json','dry-run','update'])if(k in o&&o[k]!==true)throw Error(`Boolean flag --${k} takes no value`);
 if(cmd!=='import'&&pos.length)throw Error('Unexpected positional argument');
 if(writes.has(cmd)){
  need(o,'actor');await db.exec('BEGIN');
  try{
   await db.exec('LOCK TABLE participants,studies,quotas,participations,contacts IN SHARE ROW EXCLUSIVE MODE');
   const result=await execute(db,cmd,o,pos);await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');return result;
  }catch(e){await db.exec('ROLLBACK');throw e;}
 }
 return execute(db,cmd,o,pos);
}
async function execute(db,cmd,o,pos){
 if(reports[cmd])return db.query(reports[cmd]);
 if(cmd==='help')return commands.map(command=>({command,options:spec[command].map(x=>'--'+x).join(' ')}));
 if(cmd==='list'){const kind=o.kind||'studies';if(!kinds.includes(kind))throw Error('Unknown kind');return db.query(`select * from ${kind} order by ${kind==='policy'?'id':'created_at,id'}`);}
 if(cmd==='show'){const p=await person(db,o);return {participant:p,participations:await db.query('select * from participations where participant_id=$1 order by created_at,id',[p.id]),contacts:await db.query('select * from contacts where participant_id=$1 order by contacted_on,id',[p.id]),activity:await db.query("select * from activity where (entity='participants' and entity_id=$1) or (entity='participations' and entity_id in (select id from participations where participant_id=$1)) order by created_at,id",[p.id])};}
 if(cmd==='weekly-review'){const out={};for(const c of ['quota-gaps','session-week','contact-pressure','incentives-due','attention','compliance'])out[c]=await db.query(reports[c]);return out;}
 if(cmd==='add')return [await insert(db,'participants',{code:need(o,'code'),name:need(o,'name'),email:email(need(o,'email')),segment:o.segment||'General'},o,cmd)];
 if(cmd==='record-consent'){
  const p=await person(db,o),state=need(o,'state');if(!['granted','withdrawn'].includes(state))throw Error('State must be granted or withdrawn');
  const data={consent:state,consent_evidence:need(o,'evidence'),consent_on:await pastDay(db,need(o,'on'))};
  if(state==='granted'){Object.assign(data,{consent_version:need(o,'version'),notice_evidence:need(o,'notice'),retention_review_on:day(need(o,'review-on'))});if(data.retention_review_on<await dateNow(db))throw Error('Retention review must not be past');}
  const row=await update(db,'participants',p,data,o,cmd);
  if(state==='withdrawn')for(const e of await db.query("select * from participations where participant_id=$1 and status in ('shortlisted','invited','scheduled')",[p.id]))await update(db,'participations',e,{status:'cancelled',outcome_evidence:'Panel withdrawal: '+data.consent_evidence},o,'withdrawal-cancel');
  return [row];
 }
 if(cmd==='review-history'){const p=await person(db,o);return [await update(db,'participants',p,{history_reviewed_on:await pastDay(db,need(o,'on')),history_evidence:need(o,'evidence')},o,cmd)];}
 if(cmd==='log-contact'){const p=await person(db,o);return [await insert(db,'contacts',{participant_id:p.id,contacted_on:await pastDay(db,need(o,'on')),evidence:need(o,'evidence')},o,cmd)];}
 if(cmd==='open-study')return [await insert(db,'studies',{code:need(o,'code'),title:need(o,'title'),owner:need(o,'owner'),purpose:need(o,'purpose'),consent_version:need(o,'version'),due_on:day(need(o,'due-on'))},o,cmd)];
 if(cmd==='set-quota'){
  const s=await study(db,o);if(s.status!=='open')throw Error('Study is closed');const segment=need(o,'segment'),target=integer(need(o,'target'),1);
  const n=(await db.query("select count(*)::int n from participations where study_id=$1 and segment=$2 and status in ('scheduled','completed')",[s.id,segment]))[0].n;
  if(target<n)throw Error('Quota below already committed places');
  const q=(await db.query('select * from quotas where study_id=$1 and segment=$2',[s.id,segment]))[0];
  return [q?await update(db,'quotas',q,{target},o,cmd):await insert(db,'quotas',{study_id:s.id,segment,target},o,cmd)];
 }
 if(cmd==='shortlist'){
  const p=await person(db,o),s=await study(db,o);await eligible(db,p,s);
  if(!(await db.query('select 1 from quotas where study_id=$1 and segment=$2',[s.id,p.segment])).length)throw Error('No quota for participant segment');
  return [await insert(db,'participations',{code:need(o,'code'),study_id:s.id,participant_id:p.id,segment:p.segment,incentive_cents:integer(o['incentive-cents']||'0'),currency:o.currency||'NZD'},o,cmd)];
 }
 if(cmd==='record-invitation'){
  const e=await participation(db,o);if(e.status!=='shortlisted')throw Error('Only shortlisted participation can be invited');
  const p=(await db.query('select * from participants where id=$1',[e.participant_id]))[0],s=(await db.query('select * from studies where id=$1',[e.study_id]))[0];await eligible(db,p,s);
  await insert(db,'contacts',{participant_id:p.id,participation_id:e.id,contacted_on:await pastDay(db,need(o,'on')),evidence:need(o,'evidence')},o,cmd);
  return [await update(db,'participations',e,{status:'invited'},o,cmd)];
 }
 if(cmd==='schedule'){
  const e=await participation(db,o);if(!['invited','scheduled'].includes(e.status))throw Error('Only invited or scheduled participation can be scheduled');
  const p=(await db.query('select * from participants where id=$1',[e.participant_id]))[0],s=(await db.query('select * from studies where id=$1',[e.study_id]))[0];await eligible(db,p,s,{allowPressure:true});
  const start=instant(need(o,'start')),end=instant(need(o,'end')),researcher=need(o,'researcher');if(end<=start)throw Error('Session end must follow start');
  if((await db.query("select 1 from participations where id<>$1 and status='scheduled' and (participant_id=$2 or lower(researcher)=lower($3)) and starts_at<$5 and ends_at>$4",[e.id,p.id,researcher,start,end])).length)throw Error('Session overlaps participant or researcher booking');
  const q=(await db.query('select * from quotas where study_id=$1 and segment=$2',[s.id,e.segment]))[0];
  const count=(await db.query("select count(*)::int n from participations where id<>$1 and study_id=$2 and segment=$3 and status in ('scheduled','completed')",[e.id,s.id,e.segment]))[0].n;
  if(!q||count>=q.target)throw Error('Quota full or missing');
  return [await update(db,'participations',e,{status:'scheduled',researcher,starts_at:start,ends_at:end,study_consent_evidence:need(o,'consent-evidence')},o,cmd)];
 }
 if(cmd==='outcome'){
  const e=await participation(db,o),state=need(o,'state');if(!['completed','no-show','cancelled'].includes(state))throw Error('Outcome must be completed, no-show or cancelled');
  if(['completed','no-show','cancelled'].includes(e.status))throw Error('Participation already terminal');
  if(state!=='cancelled'){
   if(e.status!=='scheduled')throw Error('Only scheduled sessions can complete or no-show');
   const now=(await db.query('select now() n'))[0].n;if(new Date(e.starts_at)>new Date(now))throw Error('Session has not started');
   const p=(await db.query('select * from participants where id=$1',[e.participant_id]))[0],s=(await db.query('select * from studies where id=$1',[e.study_id]))[0];
   if(p.consent!=='granted'||p.consent_version!==s.consent_version)throw Error('Current consent required');
  }
  return [await update(db,'participations',e,{status:state,outcome_evidence:need(o,'evidence')},o,cmd)];
 }
 if(cmd==='record-incentive'){
  const e=await participation(db,o);if(e.status!=='completed'||e.incentive_cents<=0||e.settled_on)throw Error('Requires completed, unsettled incentive');
  return [await update(db,'participations',e,{settled_on:await pastDay(db,need(o,'on')),settlement_evidence:need(o,'evidence')},o,cmd)];
 }
 if(cmd==='close-study'){
  const s=await study(db,o);need(o,'evidence');if(s.status==='closed')throw Error('Study already closed');
  if((await db.query("select 1 from participations where study_id=$1 and (status in ('shortlisted','invited','scheduled') or (status='completed' and incentive_cents>0 and settled_on is null))",[s.id])).length)throw Error('Resolve active participations and unsettled incentives first');
  const row=await update(db,'studies',s,{status:'closed'},o,cmd);await audit(db,o.actor,'closure-evidence','studies',null,row,o.evidence);return [row];
 }
 if(cmd==='log'){const p=await person(db,o);await audit(db,o.actor,'log','participants',p,p,need(o,'note'));return [{code:p.code,note:o.note}];}
 if(cmd==='import'){
  if(pos.length!==1||pos[0]!=='great-question')throw Error('Use import great-question --file=export.csv');
  const rows=parseCsv(fs.readFileSync(need(o,'file'),'utf8')),map=o.map?JSON.parse(fs.readFileSync(o.map,'utf8')):{};
  for(const k of Object.keys(map))if(!['source_id','name','email','segment'].includes(k)||typeof map[k]!=='string')throw Error('Invalid field map');
  const stats={inserted:0,updated:0,unchanged:0,dry_run:!!o['dry-run']},seen=new Set();
  for(const raw of rows){
   const get=(key,...aliases)=>map[key]?pick(raw,map[key]):pick(raw,...aliases);
   const source_id=get('source_id','candidate_id','Candidate ID').trim(),name=get('name','name','Full Name','Name').trim(),mail=email(get('email','email','Email')),segment=get('segment','segment','Segment')||'General';
   if(!source_id||!name)throw Error('Every row needs candidate_id, name and unmasked email');
   if(seen.has(source_id)||seen.has('email:'+mail))throw Error('Duplicate candidate ID or email in import');seen.add(source_id);seen.add('email:'+mail);
   const old=(await db.query('select * from participants where source_id=$1',[source_id]))[0];
   const data={source_id,name,email:mail,segment,source_data:JSON.stringify(raw)};
   if(old){if(JSON.stringify(old.source_data)===JSON.stringify(raw)||JSON.stringify(Object.entries(old.source_data).sort())===JSON.stringify(Object.entries(raw).sort())){stats.unchanged++;continue;}
    if(!o.update)throw Error(`Changed source ${source_id} requires --update`);
    await update(db,'participants',old,data,o,'import-update');stats.updated++;
   }else{await insert(db,'participants',{code:'GQ-'+source_id,...data},o,'import');stats.inserted++;}
  }return [stats];
 }
 if(cmd==='export'){
  const file=path.resolve(need(o,'file'));let text;
  if(o.kind){if(!kinds.includes(o.kind))throw Error('Unknown kind');text=csv(await db.query(`select * from ${o.kind} order by ${o.kind==='policy'?'id':'created_at,id'}`));}
  else{const out={format:'research-panel-v1',exported_at:new Date().toISOString()};for(const k of kinds)out[k]=await db.query(`select * from ${k} order by ${k==='policy'?'id':'created_at,id'}`);text=JSON.stringify(out,null,2)+'\n';}
  privateFile(file,text);return [{file}];
 }
 if(cmd==='draft-invitations'){
  const s=await study(db,o);if(s.status!=='open')throw Error('Study is closed');
  const rows=await db.query("select p.code,p.name,p.email,e.code participation from participations e join participants p on p.id=e.participant_id join v_panel v on v.id=p.id where e.study_id=$1 and e.status='shortlisted' and v.eligibility='ready' and p.consent_version=$2 order by p.code",[s.id,s.consent_version]);
  const content='# Draft for human review\n\nNothing sent. Check availability and recheck consent immediately before sending.\n\n'+rows.map(p=>`## ${p.code}: ${p.name}\n\nTo: ${p.email}\nSubject: ${s.title}\n\nHello ${p.name},\n\nWe are preparing a research conversation about: ${s.purpose}. Participation is voluntary. The operator will add the agreed time, privacy notice and withdrawal contact before sending.\n\nRecord: ${p.participation}\n`).join('\n');
  return [{file:privateFile(path.join(process.env.OUTPUT_DIR||REPO_ROOT,'drafts',`invitations-${s.code.replace(/[^a-z0-9-]/gi,'-')}-${randomUUID()}.md`),content),participants:rows.length}];
 }
 if(cmd==='draft-weekly'){
  const result=await execute(db,'weekly-review',{},[]);return [{file:privateFile(path.join(process.env.OUTPUT_DIR||REPO_ROOT,'drafts',`weekly-${randomUUID()}.md`),'# Draft for human review\n\n'+Object.entries(result).map(([k,v])=>'## '+k+'\n\n'+format(v)).join('\n\n'))}];
 }
 throw Error('Unimplemented command '+cmd);
}
export function format(result){if(Array.isArray(result)){if(!result.length)return '  (none)';const rows=result.map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,v instanceof Date?v.toISOString():typeof v==='object'&&v!==null?JSON.stringify(v):v])));return table(rows,Object.keys(rows[0]).map(k=>({key:k,label:k,width:70})));}return Object.entries(result).map(([k,v])=>k+'\n'+(Array.isArray(v)?format(v):JSON.stringify(v,null,2))).join('\n\n');}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 let db;try{const args=process.argv.slice(2),cmd=args.shift()||'help',o={},pos=[];for(const a of args){if(a.startsWith('--')){const eq=a.indexOf('='),key=a.slice(2,eq<0?undefined:eq);if(key in o)throw Error('Duplicate option '+key);o[key]=eq<0?true:a.slice(eq+1);}else pos.push(a);}
 db=await getDb();const result=await run(db,cmd,o,pos);console.log(o.json?JSON.stringify(result,null,2):format(result));
 }catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}
}
