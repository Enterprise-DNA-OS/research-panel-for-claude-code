---
description: Import a reviewed Great Question candidate CSV atomically.
---

# import

Import a reviewed Great Question candidate CSV atomically.

```bash
npm run panel -- import great-question --file=imports/panel.csv --map=fixtures/field-map.json --actor="Operator name" --dry-run
```

Options: --file --map --dry-run --update --actor. Every command accepts --json.

Read before changing records. Resolve ambiguous references by listing matches. Report actual rows and empty results honestly. Add --json when another process needs the output. Read docs/replace-great-question.md first. Match headings, select the full source list and check masked values. Review dry-run counts, then remove --dry-run to import the authorised file. Changed rows need --update; never infer consent from source text.
