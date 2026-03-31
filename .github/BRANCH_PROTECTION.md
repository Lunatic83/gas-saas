# Branch Protection — `main`

> **Status**: ⚠️ Blocked by GitHub Free plan — branch protection rules require a **GitHub Team** organization account (paid). This document serves as the target configuration checklist. Apply manually when upgrading to Team.

## Target State

Apply the following rules to the `main` branch via **GitHub → Settings → Branches → Add rule**:

### Require pull request before merging

- [x] **Require a pull request before merging** — all changes must come through a PR

### Status checks

- [x] **Require status checks to pass before merging**
  - Required checks:
    - `ci` — Code Quality (ESLint, Prettier, TypeScript, gitleaks)
    - `ci` — Test (unit + integration stubs)
    - `ci` — Build (Next.js production build)
    - `e2e-smoke` — E2E smoke suite (Playwright)

### Branch settings

- [ ] **Require branches to be up to date before merge** — disabled (optional)
- [ ] **Do NOT require native GitHub secret scanning** — cost decision, gitleaks runs in CI instead
- [x] **Allow force pushes** — disabled
- [x] **Allow deletions** — disabled

### Admin exemption

- [x] **Do not bypass settings above for admins** — enabled (`enforce_admins: true`)

---

## How to Apply

1. Go to **GitHub → repository → Settings → Branches**
2. Click **Add rule**
3. Set branch name pattern: `main`
4. Enable the options as checked above
5. Save

## CI/CD Pipeline Reference

| Workflow  | Job          | Required              |
| --------- | ------------ | --------------------- |
| `ci.yml`  | Code Quality | ✅                    |
| `ci.yml`  | Test         | ✅                    |
| `ci.yml`  | Build        | ✅                    |
| `e2e.yml` | Smoke — PR   | ✅ (on PR)            |
| `e2e.yml` | Full — Main  | ✅ (on merge to main) |

## Why Deferred Until Now

Branch protection was intentionally deferred until the CI/CD pipeline ran green on `main` at least once. Adding protection before validation would block deployments without value — there would be nothing meaningful to protect.
