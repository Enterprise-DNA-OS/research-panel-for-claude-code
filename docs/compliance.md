# Evidence checks, not certification

Checked 30 October 2026. This workbench is for voluntary business and product research with adults. It is not a clinical-trial, medical-record or employee recruitment system. The operator decides which law and research policy apply.

| Rule | Check | Source and boundary |
|---|---|---|
| NZ-IPP3 | Missing collection-notice evidence appears in compliance. Granting panel consent requires a notice reference. | [New Zealand Privacy Commissioner, principle 3](https://www.privacy.org.nz/privacy-principles/3/). People must receive the relevant collection information. A reference does not prove the notice was adequate. |
| NZ-IPP9 | Missing or overdue retention-purpose reviews block new shortlisting and appear in compliance. | [New Zealand Privacy Commissioner, principle 9](https://www.privacy.org.nz/privacy-principles/9/). Retain personal information only while needed for a lawful purpose. No universal retention period is invented here. |
| POLICY-CONSENT | Scheduling requires recorded panel consent, matching study version and study-specific consent evidence. Withdrawal cancels active participations. | Business policy inspired by [Great Question consent forms](https://greatquestion.co/support/modular-study-add-ons/custom-consent-forms). This software neither obtains consent nor signs forms. |
| POLICY-HISTORY | Imported participants cannot be shortlisted until history is reviewed. | [Great Question export documentation](https://greatquestion.co/support/candidates/exporting-candidates). Candidate exports omit participation history. |
| POLICY-CONTACT | Two recorded contacts in a rolling 30-day window block further shortlisting and invitations. A completed session triggers a 30-day rest period. | Configurable local business policies. [Great Question eligibility documentation](https://greatquestion.co/support/candidates/candidate-eligibility-settings) describes adjustable vendor rules; these defaults are not a promise to reproduce all of them. |
| POLICY-QUOTA | Scheduling cannot exceed the cohort target or overlap a participant or researcher. | Local booking policy, not legislation. |

The audit records actor labels and before/after values. It does not authenticate a person or prevent a database administrator from changing history. Use an authorised operator, restricted filesystem and database access, backups, and a deployment-specific retention procedure. RLS has no public policies. Do not expose the database owner account to participants.

Retention review is a work queue, not erasure. The free version does not delete personal information, attachments, exported files or backups. An operator must complete approved erasure and access requests across every copy using the organisation's procedure. Withdrawal stops future active work but preserves previous evidence until that procedure is applied. Do not claim that a passing check makes a deployment legally compliant.

Australian deployments must set their own applicable privacy rules and notices. No Australian legal conclusion or statutory retention period is encoded. Public demos use fictional people only. Never send drafts or pay incentives from this tool.
