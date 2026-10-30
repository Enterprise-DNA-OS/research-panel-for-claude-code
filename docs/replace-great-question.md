# Bring your Great Question panel across

The [vendor's export guide](https://greatquestion.co/support/candidates/exporting-candidates) was checked on 30 October 2026. A CSV export requires Admin or Creator access, candidate export enabled and permission to see personal information.

1. Open Candidates. Show Name, Email and the custom fields you need. The candidate_id field is always included in a Candidates export.
2. Apply the intended filters, tick the header box and choose Select all # instead. The header box alone selects only the current page.
3. Export CSV, confirm, and download from the email link within its stated validity. This repository does not request or read that email.
4. Save it privately as imports/panel.csv. Review the heading map below and run the import. Reject masked contact values and check source and destination counts.

```bash
npm run panel -- import great-question --file=imports/panel.csv --map=fixtures/field-map.json --actor="Operator name" --dry-run
npm run panel -- import great-question --file=imports/panel.csv --map=fixtures/field-map.json --actor="Operator name"
```

The second line is the one-command import. A prepared panel can be imported and reconciled in a day; obtaining permissions, exports and historical evidence can take longer. The supplied fixture is synthetic, not an export from a live customer account.

| Incoming column | Destination |
|---|---|
| candidate_id | Stable source ID and GQ-prefixed code |
| Name, name or Full Name | Participant name |
| Email or email | Lowercase unique email. Masked values rejected. |
| Segment or segment | Cohort, otherwise General |
| Every other column | Preserved verbatim in source_data |

Use a field map with source_id, name, email and segment keys if your headings differ. The exact Name and Email labels are configurable assumptions because the vendor allows visible and custom columns. Repeated identical rows do nothing. Changed rows require --update. A bad row rolls back the whole batch. Existing consent and history decisions are never inferred from source text or overwritten by import. Duplicate IDs, duplicate emails, missing names and malformed CSV fail.

Tags and saved segment membership are not exportable columns. Export separately by filter and add a reviewed Segment column, or map your existing custom cohort field. Contact access comes out as team names and is preserved as source text, not turned into access permissions. Study participation history is in the study Participants export, not the panel export. Record the relevant contact dates with log-contact. Use open-study, shortlist, schedule and outcome to reconstruct any required session history from reviewed records; document the reconciliation with review-history. A source opt-in value stays source text. Record consent with evidence, the notice, version and retention-review date before using the person.

Recordings, transcripts, findings, calendars, external marketplace accounts, payments, signed PDFs and live automations do not migrate through this panel importer. Keep source evidence in your approved restricted archive and reference it. Enterprise DNA can map additional records and connect agreed systems in your custom version. Do a small study, check cohort counts and consent, then reconcile the full panel before ending the old service.

Export everything as JSON with npm run panel -- export --file=exports/panel.json. Export one record type as spreadsheet-safe CSV with --kind=participants. JSON preserves exact values and all histories; CSV prefixes formula-like cells for safe spreadsheet viewing and is not a lossless restore format. No automatic restore or deletion is provided.
