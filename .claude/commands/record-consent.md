---
description: Record a supplied consent decision or withdrawal, with evidence.
---

# record-consent

Record a supplied consent decision or withdrawal, with evidence.

```bash
npm run panel -- record-consent --person=P10 --state=granted --version=v1 --evidence="Signed form reference" --notice="Collection notice reference" --on=2026-10-30 --review-on=2027-10-30 --actor="Operator name"
```

Options: --person --state --version --evidence --notice --on --review-on --actor. Every command accepts --json.

Read before changing records. Resolve ambiguous references by listing matches. Report actual rows and empty results honestly. Add --json when another process needs the output. Every write requires the real operator name and supplied evidence. Replace example values and dates with the agreed facts. The actor label is attribution, not authentication. Never infer consent, history or attendance. For withdrawal use --state=withdrawn with --person, --evidence, --on and --actor. Active shortlists and bookings are cancelled atomically. A changed consent version makes older study permissions stale.
