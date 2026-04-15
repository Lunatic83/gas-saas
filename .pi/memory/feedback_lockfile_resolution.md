---
name: lockfile resolution strategy
description: When lockfile conflicts occur during merge/rebase, accept theirs then regenerate to merge both dependency trees
type: feedback
---

## Lockfile Conflict Resolution

**When a PR/branch has lockfile conflicts with main:**

1. `git checkout --theirs pnpm-lock.yaml` — accept main's lockfile (it has the canonical dependency tree)
2. `pnpm install` — regenerate lockfile, merging both `package.json` deps

This is better than accepting ours or deleting+regenerating because:
- ✅ Main's transitive deps (nodemailer, resend from E6-2) are preserved
- ✅ Our new deps (`@better-fetch/fetch`) are merged in via `package.json`
- ✅ pnpm resolves the merged dep tree correctly

**Never run `pnpm import` or delete lockfiles during conflict resolution** — this breaks the audit trail and can introduce subtle version drifts.

**Pre-merge workflow for feature branches:**
```
1. Rebase on latest main (or merge main into branch)
2. If lockfile conflicts → `git checkout --theirs pnpm-lock.yaml && pnpm install`
3. Commit the resolved lockfile
4. Push
```

This ensures CI gets a clean lockfile that reflects the merged dependency state.