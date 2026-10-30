---
description: Record an incentive already paid by the authorised payment provider.
---

# record-incentive

Record an incentive already paid by the authorised payment provider.

```bash
npm run panel -- record-incentive --ref=EN10 --on=2026-11-02 --evidence="External payment reference" --actor="Operator name"
```

Options: --ref --on --evidence --actor. Every command accepts --json.

Read before changing records. Resolve ambiguous references by listing matches. Report actual rows and empty results honestly. Add --json when another process needs the output. Every write requires the real operator name and supplied evidence. Replace example values and dates with the agreed facts. The actor label is attribution, not authentication. Never infer consent, history or attendance. This command records evidence only. It neither authorises nor executes a payment.
