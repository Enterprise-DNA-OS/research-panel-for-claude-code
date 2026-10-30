---
description: Export a complete JSON snapshot or one record type as CSV.
---

# export

Export a complete JSON snapshot or one record type as CSV.

```bash
npm run panel -- export --file=exports/panel.json
```

Options: --file --kind. Every command accepts --json.

Read before changing records. Resolve ambiguous references by listing matches. Report actual rows and empty results honestly. Add --json when another process needs the output. Keep exports private. Add --kind=participants for spreadsheet-safe CSV; complete JSON preserves exact values and all histories.
