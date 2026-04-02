---
name: feedback_pr_workflow
description: PR merge → ask before closing issue, no auto-merge ever
type: feedback
---

**Rule:** After the user merges a PR, always **ask** before closing the associated issue — do not auto-close. The user will tell me when they've merged, and I should confirm before taking any further action (like closing the issue).

**Why:** The user wants full control over when issues are closed. `gh pr merge` must NEVER be attempted by me or any skill.

**How to apply:** In any PR/issue workflow (pr-validate, create-pr, etc.), after detecting a merge confirmation from the user, prompt before closing. Never auto-merge or auto-close.
