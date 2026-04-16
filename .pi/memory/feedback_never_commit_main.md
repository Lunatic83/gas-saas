---
name: never commit on main for tracked changes
description: When making tracked changes (branch, PR, issue), always create a worktree and feature branch first. Exploratory work can be done on main without worktree.
type: feedback
---

## Rule: Tracked Changes Require a Feature Branch

**When making changes that will be committed and PR'd:**

1. Check current branch: `git branch --show-current`
2. If on `main`: **STOP** — do NOT make changes
3. Create a worktree + branch first (via `/start-task`)
4. Only then make changes

**Why this matters:**
- Direct commits to `main` bypass PR review
- CI cannot validate changes without a PR
- Commits on `main` can't be linked to issues
- Worktree contamination (unrelated changes get mixed)

**When it's OK to work on main:**
- Exploratory/debugging work (not committed)
- Reading files, running commands
- Temporary experiments that will be discarded

**Wrong (for tracked changes):**
```
main branch
↓ edit file
↓ commit
main now has unreviewed code
```

**Correct (for tracked changes):**
```
main branch
↓ /start-task E6-5
worktree created at .claude/worktrees/E6-5
↓ switch to task/E6-5-sign-in-page
↓ edit file
↓ commit
↓ open PR → review → merge
```

**Detection:** If `git branch --show-current` returns `main` and you attempt to `git commit`, warn immediately.
