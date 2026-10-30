# Research Panel for Claude Code

Your research participants, consent evidence, interview places and follow-up work in a database you own.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free, MIT. Install the demo and use your own database. | Your cohort fields, consent rules, history mapping and documents. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |

[Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=great-question&utm_source=github&utm_medium=readme) · [Instead of Great Question](https://enterprisedna.co/omni/instead-of/great-question)

## Quick start

Node 20 or later.

```bash
git clone https://github.com/Enterprise-DNA-OS/research-panel-for-claude-code.git
cd research-panel-for-claude-code
npm install
npm run demo
npm run panel -- weekly-review
npm run docs
npm run view
```

Open the folder in Claude Code, Codex, OpenCode or Cursor. AGENTS.md directs every runtime to the same CLAUDE.md and command recipes. Local PGlite needs no database server. DATABASE_URL selects PostgreSQL. DATA_DIR changes the local data directory. Never seed business records.

## Why this build

Vendr reports median Great Question spend of USD 23,420 per year across 40 purchases. That is third-party purchase evidence, not a vendor quote or a verified ANZ invoice. Great Question's own enterprise price is custom. Its public self-serve plan is USD 129 per seat per month or USD 1,290 per seat per year. [Sources and candidate scores](docs/research.md).

The fit is a research team that already has its own participants and wants ownership of the operating records and rules. Great Question already provides reporting, eligibility rules and conversational access. This is a smaller base for your own process, not a claim to reproduce every vendor feature. External participant networks, video research, survey hosting and payment processing are outside this build.

## The weekly rituals

Open a study and define its owner, purpose, consent version and cohort targets. Find eligible participants, shortlist them, prepare private invitations and record approved contacts made elsewhere. Schedule agreed times with evidenced study consent. Record attendance or a no-show. Reconcile incentives paid elsewhere and close completed studies. Monday's weekly-review combines quota gaps, bookings, contact pressure, evidence and follow-up.

34 CLI commands and 38 slash-command recipes. Every CLI command supports --json. Use --key=value syntax, exact codes, partial UUIDs or case-insensitive names. Ambiguous references list the matches and exit 1. Times require explicit offsets and reports use UTC.

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

## Guardrails that follow the record

Unknown or withdrawn consent blocks shortlisting. Current panel consent must match the study version, and scheduling needs study-specific evidence. Withdrawal cancels active shortlists, invitations and sessions atomically. Imported people remain blocked until history is reconciled. Missing retention-purpose reviews, two recent contacts or a recent completed session also block new invitations under the supplied business policies.

Bookings cannot overlap for the same participant or researcher, and cohort targets cannot be exceeded. Terminal outcomes require evidence and cannot be silently rewritten. Incentive records require a completed session and proof of payment elsewhere. Every mutation records actor and before/after values. The database serialises writes to protect quotas and overlap checks.

This is a trusted-operator tool. Names do not prove identity, an administrator can change history, and the audit is not tamper-proof. Retention reviews identify work; an approved deployment process must handle access, erasure and all exported copies. [Compliance sources and limits](docs/compliance.md).

## Ten questions the demo answers

1. Which studies still need owners or operators to fill their interview places? Run quota-gaps.
2. Who is ready for another research invitation today? Run eligible.
3. Who has been contacted too often or completed a study too recently? Run contact-pressure.
4. Which panel records need consent or retention evidence reviewed? Run consent-review.
5. Which booked interviews have already passed without an outcome? Run attention.
6. Which completed interviews still have an unsettled incentive record? Run incentives-due.
7. Which cohorts have plenty of names but few eligible people? Run coverage.
8. Which studies have recorded no-shows? Run no-shows.
9. How many interviews and minutes is each researcher carrying? Run researcher-load.
10. Who changed a participant record and what evidence did they record? Run show --person=P01.

These are executable questions, not unsupported claims that Great Question cannot answer them. [Captured demo runs](docs/demo-captures.json).

## Switch your panel in a day

Export the full Candidates list with visible name, email and cohort fields. Candidate IDs are included. Run:

```bash
npm run panel -- import great-question --file=imports/panel.csv --map=fixtures/field-map.json --actor="Operator name" --dry-run
npm run panel -- import great-question --file=imports/panel.csv --map=fixtures/field-map.json --actor="Operator name"
```

The prepared panel imports in one command. Permission requests and historical reconciliation can take longer. Source tags and saved segments are not exported as columns, and panel exports omit study participation history. Every original column is preserved; a malformed batch rolls back. Changed source records need --update, and repeated rows do nothing. Consent is never inferred. [Full export and mapping guide](docs/replace-great-question.md).

## Documents and read-only views

Change brand.json once. npm run docs produces a study brief, consent evidence record and incentive reconciliation from real records. npm run view produces the week, panel readiness and interview run sheet. Open private HTML and print to PDF after checking. /new-view adds another report. No server or interactive front end is included. [What a screen adds](docs/why-no-front-end.md).

## Your first hour: ten things to ask for

1. Put our name and colours on every brief.
2. Add our research owner and first study.
3. Set the owner and operator cohort targets.
4. Map our panel export and check a dry run.
5. Reconcile previous invitations and study participation.
6. Record our consent notice and evidence references.
7. Change the contact-rest policy to our agreed rule.
8. Add a product-region field through a migration.
9. Prepare next week's invitation drafts.
10. Show quota gaps and overdue outcomes together.

/customise writes and tests a new migration for changed fields or policy. Nothing sends, publishes, deletes or pays automatically.

## Verification

npm test uses a temporary database, applies migrations twice, seeds twice, exercises all 34 CLI commands and checks consent, histories, quotas, overlapping bookings, outcomes, payments recorded elsewhere, atomic imports, exports, drafts and escaped HTML. CI includes Windows and Linux on Node 20/22 plus PostgreSQL 17. [Actual validation results](docs/validation.md).

## Built and run for you

Enterprise DNA maps your records, builds your consent and study process, and adds a web front end, calendar connections or a different stack when agreed. Omni by Enterprise DNA installs and runs it for one setup fee, then a retainer. [Book 30 minutes with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=great-question&utm_source=github&utm_medium=readme).

MIT. Not affiliated with Great Question or Anthropic. Hosting and agent use have their own costs.
