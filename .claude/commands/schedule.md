---
description: Record an agreed time, researcher and study consent without conflicting bookings.
---

# schedule

Record an agreed time, researcher and study consent without conflicting bookings.

```bash
npm run panel -- schedule --ref=EN10 --researcher="Researcher name" --start=2026-11-02T10:00:00+13:00 --end=2026-11-02T11:00:00+13:00 --consent-evidence="Signed study consent reference" --actor="Operator name"
```

Options: --ref --researcher --start --end --consent-evidence --actor. Every command accepts --json.

Read before changing records. Resolve ambiguous references by listing matches. Report actual rows and empty results honestly. Add --json when another process needs the output. Every write requires the real operator name and supplied evidence. Replace example values and dates with the agreed facts. The actor label is attribution, not authentication. Never infer consent, history or attendance. Use an explicit UTC offset. Backdated bookings are allowed for evidenced history reconciliation. Check both participant and researcher calendars separately; no calendar connection is included.
