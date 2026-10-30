CREATE FUNCTION touch_updated() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END $$;
CREATE TABLE policy (
 id integer PRIMARY KEY CHECK(id=1), cooldown_days integer NOT NULL DEFAULT 30 CHECK(cooldown_days>=0),
 max_contacts integer NOT NULL DEFAULT 2 CHECK(max_contacts>0), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO policy(id) VALUES(1);
CREATE TABLE participants (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL CHECK(length(trim(code))>0),
 name text NOT NULL CHECK(length(trim(name))>0), email text NOT NULL CHECK(email=lower(email) AND email ~ '^[^ @]+@[^ @]+\.[^ @]+$'),
 segment text NOT NULL DEFAULT 'General', consent text NOT NULL DEFAULT 'unknown' CHECK(consent IN ('unknown','granted','withdrawn')),
 consent_version text, consent_evidence text, notice_evidence text, consent_on date,
 history_reviewed_on date, history_evidence text, retention_review_on date,
 source_id text UNIQUE, source_data jsonb NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(consent<>'granted' OR (length(trim(consent_version))>0 AND length(trim(consent_evidence))>0 AND length(trim(notice_evidence))>0 AND consent_on IS NOT NULL)),
 CHECK(history_reviewed_on IS NULL OR length(trim(history_evidence))>0)
);
CREATE UNIQUE INDEX participant_email ON participants(lower(email));
CREATE TABLE studies (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL, title text NOT NULL, owner text NOT NULL,
 purpose text NOT NULL, consent_version text NOT NULL, due_on date NOT NULL,
 status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','closed')),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE quotas (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), study_id uuid NOT NULL REFERENCES studies(id), segment text NOT NULL,
 target integer NOT NULL CHECK(target>0), UNIQUE(study_id,segment),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE participations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL, study_id uuid NOT NULL REFERENCES studies(id), participant_id uuid NOT NULL REFERENCES participants(id),
 segment text NOT NULL, status text NOT NULL DEFAULT 'shortlisted' CHECK(status IN ('shortlisted','invited','scheduled','completed','no-show','cancelled')),
 researcher text, starts_at timestamptz, ends_at timestamptz, study_consent_evidence text,
 outcome_evidence text, incentive_cents integer NOT NULL DEFAULT 0 CHECK(incentive_cents>=0), currency text NOT NULL DEFAULT 'NZD' CHECK(currency ~ '^[A-Z]{3}$'),
 settled_on date, settlement_evidence text,
 UNIQUE(study_id,participant_id),
 CHECK(ends_at IS NULL OR ends_at>starts_at),
 CHECK(status NOT IN ('scheduled','completed','no-show') OR (starts_at IS NOT NULL AND ends_at IS NOT NULL AND length(trim(researcher))>0 AND length(trim(study_consent_evidence))>0)),
 CHECK(status NOT IN ('completed','no-show','cancelled') OR length(trim(outcome_evidence))>0),
 CHECK(settled_on IS NULL OR (status='completed' AND length(trim(settlement_evidence))>0)),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE contacts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), participant_id uuid NOT NULL REFERENCES participants(id), participation_id uuid REFERENCES participations(id),
 contacted_on date NOT NULL, evidence text NOT NULL CHECK(length(trim(evidence))>0),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE activity (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor text NOT NULL, action text NOT NULL, entity text NOT NULL, entity_id uuid,
 before_data jsonb, after_data jsonb, note text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['policy','participants','studies','quotas','participations','contacts','activity'] LOOP
 EXECUTE format('CREATE TRIGGER touch BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION touch_updated()',t);
 EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE format('REVOKE ALL ON %I FROM public',t);
 END LOOP; END $$;
CREATE VIEW v_panel AS
SELECT p.id,p.code,p.name,p.segment,p.consent,p.consent_version,p.retention_review_on,
 (SELECT max(contacted_on) FROM contacts c WHERE c.participant_id=p.id) last_contact,
 (SELECT count(*)::int FROM contacts c WHERE c.participant_id=p.id AND contacted_on>current_date-30) contacts_30d,
 coalesce((SELECT max(ends_at)::date FROM participations e WHERE e.participant_id=p.id AND e.status='completed'),'1900-01-01'::date) last_completed,
 CASE WHEN p.consent<>'granted' THEN 'consent-'||p.consent
 WHEN p.history_reviewed_on IS NULL THEN 'history-unchecked'
 WHEN p.retention_review_on IS NULL OR p.retention_review_on<current_date THEN 'retention-review'
 WHEN EXISTS(SELECT 1 FROM participations e WHERE e.participant_id=p.id AND e.status='completed' AND e.ends_at::date>current_date-(SELECT cooldown_days FROM policy WHERE id=1)) THEN 'cooldown'
 WHEN (SELECT count(*) FROM contacts c WHERE c.participant_id=p.id AND contacted_on>current_date-30)>=(SELECT max_contacts FROM policy WHERE id=1) THEN 'contact-limit'
 ELSE 'ready' END eligibility
FROM participants p;
CREATE VIEW v_quotas AS
SELECT s.code study,s.title,s.owner,s.due_on,q.segment,q.target,
 count(e.id) FILTER(WHERE e.status IN ('scheduled','completed'))::int filled,
 count(e.id) FILTER(WHERE e.status='completed')::int completed,
 greatest(0,q.target-count(e.id) FILTER(WHERE e.status IN ('scheduled','completed')))::int gap
FROM quotas q JOIN studies s ON s.id=q.study_id LEFT JOIN participations e ON e.study_id=q.study_id AND e.segment=q.segment
WHERE s.status='open' GROUP BY s.code,s.title,s.owner,s.due_on,q.segment,q.target;
CREATE VIEW v_sessions AS
SELECT e.code,s.code study,p.code participant,e.segment,e.researcher,e.starts_at,e.ends_at,e.status,
 p.consent,p.consent_version=s.consent_version consent_current
FROM participations e JOIN studies s ON s.id=e.study_id JOIN participants p ON p.id=e.participant_id;
CREATE VIEW v_attention AS
SELECT 'overdue-study' issue,s.code reference,s.owner owner,'Research deadline passed' detail FROM studies s WHERE s.status='open' AND s.due_on<current_date
UNION ALL SELECT 'outcome-missing',e.code,e.researcher,'Session ended without an outcome' FROM participations e WHERE status='scheduled' AND ends_at<now()
UNION ALL SELECT 'consent-block',e.code,s.owner,'Active session has withdrawn, unknown or superseded consent' FROM participations e JOIN participants p ON p.id=e.participant_id JOIN studies s ON s.id=e.study_id WHERE e.status IN ('shortlisted','invited','scheduled') AND (p.consent<>'granted' OR p.consent_version IS DISTINCT FROM s.consent_version)
UNION ALL SELECT 'incentive-unrecorded',e.code,s.owner,'Completed participation has an unsettled incentive record' FROM participations e JOIN studies s ON s.id=e.study_id WHERE e.status='completed' AND incentive_cents>0 AND settled_on IS NULL;
CREATE VIEW v_compliance AS
SELECT code reference,'NZ-IPP3' rule,'Collection notice evidence missing' finding FROM participants WHERE coalesce(trim(notice_evidence),'')=''
UNION ALL SELECT code,'NZ-IPP9','Retention purpose review due or missing' FROM participants WHERE retention_review_on IS NULL OR retention_review_on<current_date
UNION ALL SELECT code,'POLICY-CONSENT','Consent evidence incomplete' FROM participants WHERE consent='granted' AND (coalesce(consent_evidence,'')='' OR coalesce(consent_version,'')='')
UNION ALL SELECT code,'POLICY-HISTORY','Participation history has not been reconciled' FROM participants WHERE history_reviewed_on IS NULL
UNION ALL SELECT e.code,'POLICY-CONSENT','Active study consent no longer current' FROM participations e JOIN participants p ON p.id=e.participant_id JOIN studies s ON s.id=e.study_id WHERE e.status IN ('invited','scheduled') AND (p.consent<>'granted' OR p.consent_version IS DISTINCT FROM s.consent_version);
REVOKE ALL ON v_panel,v_quotas,v_sessions,v_attention,v_compliance FROM public;
