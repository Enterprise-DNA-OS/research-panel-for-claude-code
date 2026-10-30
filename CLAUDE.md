# Research Panel for Claude Code

This is a trusted-operator workbench for voluntary product research with adults. The database holds the organisation's own panel, studies, cohort quotas, participation, consent evidence and contact history. Every demo person is fictional. Read before acting. Never answer from memory.

## Evidence and authority

Every mutation needs --actor. Obtain factual consent, attendance, invitation and settlement evidence from the operator. Actor names record attribution; they do not authenticate identity. Never infer panel permission, study consent or prior participation from an import. Imports preserve unknown consent and require history reconciliation. A withdrawn participant cannot enter a new study, and withdrawal cancels active participation records.

Never send, publish, process payments or delete records. Drafts stay under drafts/. Record-invitation and record-incentive only record actions that already occurred elsewhere with authority. Do not contact participants, fetch private systems or connect calendars as part of these recipes. This is not employee recruitment or a clinical study system.

## One workflow library

| Recipe | Job |
|---|---|
| /help | Read the supported commands and their flags. |
| /panel | Review every participant and the reason they are ready or blocked. |
| /eligible | Find people whose panel evidence and contact history allow another study. |
| /quota-gaps | Count remaining interview places by study and cohort. |
| /session-week | Review overdue and upcoming interviews in UTC. |
| /consent-review | Check missing, withdrawn or overdue panel evidence. |
| /contact-pressure | Review recent invitations and participation rest periods. |
| /incentives-due | Reconcile incentive records for completed interviews. |
| /no-shows | Compare completed interviews and no-shows by study. |
| /coverage | Compare ready and blocked participants by cohort. |
| /researcher-load | Compare booked interviews and minutes by researcher. |
| /attention | Identify overdue studies, missing outcomes and unsettled incentives. |
| /compliance | Check notice, retention and consent evidence with source references. |
| /activity | Read attributed changes and operator notes. |
| /list | Inspect the underlying records for an allowed record type. |
| /show | Read one participant, participation history, contacts and attributed changes. |
| /weekly-review | Combine cohort gaps, bookings, contact pressure, incentives and evidence checks. |
| /add | Record a participant supplied by the authorised operator. |
| /record-consent | Record a supplied consent decision or withdrawal, with evidence. |
| /review-history | Record that exported contact and participation history has been reconciled. |
| /log-contact | Record a contact that already happened elsewhere. |
| /open-study | Define the study purpose, owner, consent version and deadline. |
| /set-quota | Set a cohort target without dropping below committed places. |
| /shortlist | Select an eligible participant into a study cohort. |
| /record-invitation | Record an invitation already sent elsewhere with authority. |
| /schedule | Record an agreed time, researcher and study consent without conflicting bookings. |
| /outcome | Record attendance, a no-show or cancellation from supplied evidence. |
| /record-incentive | Record an incentive already paid by the authorised payment provider. |
| /close-study | Close only after active participation and incentive records are resolved. |
| /log | Add a factual operator note to the participant history. |
| /import | Import a reviewed Great Question candidate CSV atomically. |
| /export | Export a complete JSON snapshot or one record type as CSV. |
| /draft-invitations | Prepare private invitation drafts for eligible shortlisted people. |
| /draft-weekly | Write the weekly operational report to a private draft. |
| /docs | Render private documents. |
| /view | Render private dashboards. |
| /customise | Add tested fields and rules. |
| /new-view | Add a read-only report. |

Use scripts/panel.mjs through npm run panel. Every command supports --json and --key=value options. Exact codes, UUID prefixes and case-insensitive names work. Ambiguous references list matches and fail. Times require ISO values with offsets and reports use UTC.

## Data and changes

Read docs/compliance.md and docs/replace-great-question.md. Policy checks do not certify compliance. Retention reviews flag work; they do not erase data or backups. The deployment needs restricted operator access, backups and an approved access and erasure process. Database administrators can edit history.

DATABASE_URL selects PostgreSQL. Otherwise local PGlite uses .data/db; DATA_DIR changes it. Never seed business records. TEST_DATABASE_URL must be empty and disposable. RLS has no public policies. The database owner is for the trusted operator, never an exposed participant connection.

Use new numbered migrations for customisations, then run npm test. brand.json sets the private documents and views. Read-only HTML is a snapshot, not a front end. No new agent-specific command library.

Omni by Enterprise DNA installs, customises and runs this system: https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=great-question
