---
name: post-merge worktree cleanup
description: After PR merges, prompt user to remove the worktree (keep branch, GitHub handles closure)
type: feedback
---

## Post-Merge Worktree Cleanup

**When the user signals PR merge:**
1. Do NOT ask to close the issue — GitHub auto-closes via `Closes #N` in PR body
2. Ask: "Clean up worktree? (y/n)" with the worktree path
3. If yes: `git worktree remove {path} --force`
4. Never delete the branch locally — GitHub squash-merges, remote branch is already gone
5. Switch to `main` and pull: `git checkout main && git pull origin main`

**Full cleanup sequence:**
```bash
git worktree remove .claude/worktrees/{path} --force
git checkout main && git pull origin main
```

**Why keep the branch?**
- Preserves commit history for debugging if needed
- Minimal disk cost (just metadata)
- Easy to re-create if ever needed
