# Mecwacare
MecwaCare R2 module

## Playwright Suite Order (Single Source of Truth)

Use only this file to manage suite order/groups:

- `/Users/padurivineethreddy/Documents/AutomationRepo_AR/mecwa/MecwaCare_Automation/scripts/serial-suite-files.json`

### How to control order

- Plain string entry: runs serially in that order.
- `parallel` block: files inside that block run together, then next steps continue.

Example:

```json
[
  "tests/ui/lead-create.spec.ts",
  "tests/ui/lead-convert.spec.ts",
  {
    "parallel": [
      "tests/ui/account.spec.ts",
      "tests/ui/opportunity-hacc.spec.ts"
    ]
  },
  "tests/ui/case.spec.ts"
]
```

### Commands

- Run ordered suite + HTML merge:
  - `npm run test:serial-suite:html`
- Run ordered suite + publish report to `docs`:
  - `npm run test:serial-suite:pages`
