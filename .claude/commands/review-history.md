---
description: Record that exported contact and participation history has been reconciled.
---

# review-history

Record that exported contact and participation history has been reconciled.

```bash
npm run panel -- review-history --person=P10 --evidence="Source study history reconciled" --on=2026-10-30 --actor="Operator name"
```

Options: --person --evidence --on --actor. Every command accepts --json.

Read before changing records. Resolve ambiguous references by listing matches. Report actual rows and empty results honestly. Add --json when another process needs the output. Every write requires the real operator name and supplied evidence. Replace example values and dates with the agreed facts. The actor label is attribution, not authentication. Never infer consent, history or attendance. First record prior contact dates with log-contact and reconstruct required participation records. Never mark history checked just because the panel import succeeded.
