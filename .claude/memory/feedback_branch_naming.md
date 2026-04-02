---
name: branch naming and creation
description: Always create a new branch before editing, using task/E{epic}-{task#}-{short-desc} format
type: feedback
---

## Branch naming and creation rules

**Rule:** Before ANY editing work, ALWAYS create a new `task/` branch. Never edit directly on main or an existing feature branch.

**Format:** `task/{E(epic-number)-(epic-task number#)-(short-description)}`

**Why:** The epic task number is the sequential number within the epic (E4-1, E4-2, etc.), not the GitHub issue number. Example: E4-5 = 5th task in Epic 4.

**How to apply:**
- When user assigns a task, use the epic task number (e.g., E4-5 → use "5")
- Branch name: `task/E4-5-migration-precommit-hook`
- Always `git checkout -b` or `git switch -c` before making any changes
- If accidentally on wrong branch, create correct branch immediately and switch

## User's preferences on this project

- NEVER merge PRs — user merges manually after CI green
- ALWAYS call `/pr-validate` and `/pr-comments` after CI green, before merge
- When evaluating AI comments, match the reviewer's exact issue framing
- db:saas_test (not test_db)
