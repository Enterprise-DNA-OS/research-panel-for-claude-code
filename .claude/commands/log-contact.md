---
description: Record a contact that already happened elsewhere.
---

# log-contact

Record a contact that already happened elsewhere.

```bash
npm run panel -- log-contact --person=P10 --on=2026-10-30 --evidence="Previously sent message reference" --actor="Operator name"
```

Options: --person --on --evidence --actor. Every command accepts --json.

Read before changing records. Resolve ambiguous references by listing matches. Report actual rows and empty results honestly. Add --json when another process needs the output. Every write requires the real operator name and supplied evidence. Replace example values and dates with the agreed facts. The actor label is attribution, not authentication. Never infer consent, history or attendance.
