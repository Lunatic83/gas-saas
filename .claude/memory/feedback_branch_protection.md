---
name: branch protection critical
description: Always enable branch protection on main BEFORE merging to prevent mergeable-while-CI-failing situations
type: feedback
---

## Branch Protection — Critical Safety Rule

**Why:** When branch protection is not enabled, a PR can be mergeable even while CI is failing (red). This is dangerous — CI failures can be merged without review.

**How to apply:**
- ALWAYS check that branch protection is enabled on `main` before the first PR is merged
- Branch protection forces CI to pass before merge is allowed
- Without it, `gh api .../pulls/{number} --jq '.mergeable'` returns `true` even with failing CI

**How to enable (manual — GitHub Settings):**
1. Go to: `https://github.com/{owner}/{repo}/settings/branches`
2. Click "Add rule"
3. Branch name pattern: `main`
4. Check ✅ "Require a passing workflow before merging" — select the `ci` workflow
5. Click "Create"

**Note:** Cannot be set via API on free tier. Must be done manually in GitHub web UI.
