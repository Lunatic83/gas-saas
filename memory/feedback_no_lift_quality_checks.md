---
name: never lift quality checks
description: Never disable ESLint, Prettier, TypeScript, or lint-staged to make checks pass. Fix the underlying code or config issues instead.
type: feedback
---

## Rule: Never Lift Code Quality Constraints

**Rule:** When lint-staged, ESLint, Prettier, TypeScript, or any code quality check fails, **fix the underlying issue** — do not disable or bypass the check.

**Why:** Disabling checks creates technical debt and allows bad code to enter the codebase. The check exists to catch real problems.

**How to apply:**

- If ESLint fails: Fix the ESLint errors or config issue (not the code being linted unless it's actually wrong)
- If Prettier fails: Run `prettier --write` to fix formatting
- If TypeScript fails: Fix the type errors
- If `next lint` fails: `next lint` was removed in Next.js 16 — update to `eslint .` or `npx eslint .`
- If lint-staged passes individual files to `tsc --noEmit` and it fails: Don't pass files to `tsc` — run `tsc --noEmit` without arguments
- If a config is broken: Fix the config, don't disable the check

**Anti-pattern (never do this):**

```json
// ❌ Never comment out or disable lint-staged rules
"lint-staged": {
  // '*.{ts,tsx}': ['tsc --noEmit']  ← This was wrong approach
}
```

**Correct approach:**

1. Run the failing command locally to see the exact error
2. Fix the root cause (config issue OR code issue)
3. Verify locally that it passes
4. Then commit
