---
name: worktree branch discipline
description: Always start tasks from main repo on main branch. Never create worktrees from feature branches.
type: feedback
---

## Worktree Branch Discipline — Critical Rule

**Before running `/start-task`, you MUST be on `main` in the main repo.**

### Why this matters

Worktrees are created from the branch you specify. If you're on a feature branch (e.g., `pi_migration`) when you run `/start-task`, the new worktree will be based on that feature branch — polluting it with unrelated task code.

**Wrong:**
```
Current branch: pi_migration  ← work in progress
↓ /start-task E6-4
New worktree based on: pi_migration  ← contamination!
```

**Correct:**
```
Current branch: main  ← clean, up-to-date
↓ /start-task E6-4
New worktree based on: main  ← isolated
```

### How to enforce this

**Step 0 in `/start-task` is now a hard gate:**
```bash
git branch --show-current
# If not main: echo "ERROR" and stop
# Must run: git checkout main && git pull origin main
```

### Other scenarios to watch

- **After completing a task**: You remain inside the worktree. When starting the next task, exit the worktree first (`cd /Users/lunatic/workspace/gas-saas`) and switch to `main` before running `/start-task` again.
- **If you get lost**: Run `git worktree list` to see which worktrees exist and where you are. The main repo is the one without a parent directory in the list.