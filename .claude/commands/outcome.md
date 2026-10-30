---
description: Record attendance, a no-show or cancellation from supplied evidence.
---

# outcome

Record attendance, a no-show or cancellation from supplied evidence.

```bash
npm run panel -- outcome --ref=EN10 --state=completed --evidence="Attendance and notes reference" --actor="Operator name"
```

Options: --ref --state --evidence --actor. Every command accepts --json.

Read before changing records. Resolve ambiguous references by listing matches. Report actual rows and empty results honestly. Add --json when another process needs the output. Every write requires the real operator name and supplied evidence. Replace example values and dates with the agreed facts. The actor label is attribution, not authentication. Never infer consent, history or attendance.
