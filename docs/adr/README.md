# Architecture Decision Records

## Why ADRs?

Architecture decisions are easy to forget but hard to reverse. An ADR captures the _why_ behind a decision — not just _what_ was decided — so future developers (including future you) can understand the context without hunting through Slack threads or git blame.

ADRs are especially valuable when:

- The decision is expensive to reverse (data model, auth, infra)
- Multiple approaches were considered and trade-offs were weighed
- The decision affects multiple parts of the codebase
- A new developer needs to understand why the system works this way

## When to Write an ADR

Write an ADR when a decision:

- Requires choosing between multiple non-obvious approaches
- Changes the data model or API surface
- Introduces a new library or service
- Affects how other developers write code (patterns, conventions)
- Can't be easily reversed without a migration

Day-to-day implementation choices (variable names, file structure, component patterns) do not need ADRs. When in doubt: if you'd need more than a paragraph to explain _why_ the decision was made, write an ADR.

## How to Write

1. Copy `TEMPLATE.md` to a new file: `XXXX-{short-title}.md`
2. Number sequentially — `0001-`, `0002-`, etc. No skipping, no renumbering.
3. Fill in all sections. A decision without rationale is just an opinion.
4. Set status to **Accepted** when the ADR is merged. Update if later deprecated.

## Format

```
docs/adr/
├── README.md          ← this file
├── TEMPLATE.md        ← copy this for new ADRs
├── 0001-row-level-multitenancy.md
├── 0002-auth-framework-choice.md
└── ...
```

## Status Definitions

| Status         | Meaning                           |
| -------------- | --------------------------------- |
| **Proposed**   | Open for review, not yet accepted |
| **Accepted**   | Approved and implemented          |
| **Deprecated** | Superseded by a later ADR         |
| **Superseded** | Replaced by ADR #N                |

## Keeping ADRs Alive

ADRs go stale. When a system changes and an ADR no longer reflects reality:

1. Update the status to **Deprecated** or **Superseded**
2. Link to the replacement ADR in the **References** section
3. Do not delete the old ADR — future developers may need to understand the historical context

## ADRs in This Project

No ADRs written yet. The first ADR will be created when a significant architectural decision is made during the build-out of Phase B and beyond.
