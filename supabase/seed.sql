INSERT INTO participants(code,name,email,segment,consent,consent_version,consent_evidence,notice_evidence,consent_on,history_reviewed_on,history_evidence,retention_review_on) VALUES
('P01','Aroha Stone','aroha@example.test','Owner','granted','v1','Demo signed panel form','Demo notice 1',current_date-90,current_date,'Demo history checked',current_date+180),
('P02','Ben Reed','ben@example.test','Operator','granted','v1','Demo panel form','Demo notice 1',current_date-90,current_date,'Demo history checked',current_date+180),
('P03','Casey Lane','casey@example.test','Owner','withdrawn',NULL,'Demo withdrawal','Demo notice 1',current_date-3,current_date,'Demo history checked',current_date+90),
('P04','Dev Shah','dev@example.test','Owner','unknown',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('P05','Ellis Park','ellis@example.test','Operator','granted','v1','Demo panel form','Demo notice 1',current_date-90,current_date,'Demo history checked',current_date-5),
('P06','Fin Morgan','fin@example.test','Owner','granted','v1','Demo panel form','Demo notice 1',current_date-90,current_date,'Demo history checked',current_date+180),
('P07','Gia Brown','gia@example.test','Owner','granted','v1','Demo panel form','Demo notice 1',current_date-90,current_date,'Demo history checked',current_date+180),
('P08','Hana Wilson','hana@example.test','Operator','granted','v1','Demo panel form','Demo notice 1',current_date-90,current_date,'Demo history checked',current_date+180)
ON CONFLICT(code) DO NOTHING;
INSERT INTO studies(code,title,owner,purpose,consent_version,due_on) VALUES
('ST01','Wholesale ordering interviews','Mira','Understand repeat order friction','v1',current_date+7),
('ST02','Dispatch handover interviews','Noah','Understand handover exceptions','v1',current_date-2)
ON CONFLICT(code) DO NOTHING;
INSERT INTO quotas(study_id,segment,target) SELECT id,'Owner',3 FROM studies WHERE code='ST01' ON CONFLICT DO NOTHING;
INSERT INTO quotas(study_id,segment,target) SELECT id,'Operator',2 FROM studies WHERE code IN ('ST01','ST02') ON CONFLICT DO NOTHING;
INSERT INTO participations(code,study_id,participant_id,segment,status,researcher,starts_at,ends_at,study_consent_evidence,outcome_evidence,incentive_cents,currency)
SELECT x.code,s.id,p.id,p.segment,x.status,'Mira',current_date+x.days*interval '1 day'+interval '10 hours',current_date+x.days*interval '1 day'+interval '11 hours','Demo study consent',x.outcome,x.cents,'NZD'
FROM (VALUES ('EN01','ST01','P02','completed',-4,'Demo completed notes',5000),('EN02','ST02','P08','scheduled',-1,NULL,4000),('EN03','ST01','P01','scheduled',2,NULL,5000)) x(code,study,person,status,days,outcome,cents)
JOIN studies s ON s.code=x.study JOIN participants p ON p.code=x.person ON CONFLICT(code) DO NOTHING;
INSERT INTO contacts(id,participant_id,contacted_on,evidence) SELECT x.id::uuid,p.id,current_date-x.days,'Demo prior invitation' FROM (VALUES
('10000000-0000-0000-0000-000000000001','P06',3),('10000000-0000-0000-0000-000000000002','P06',8))x(id,code,days) JOIN participants p ON p.code=x.code ON CONFLICT DO NOTHING;
