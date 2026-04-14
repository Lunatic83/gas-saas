---
name: workflow_ai_sdlc
description: "**MASTER WORKFLOW** — Matt Pocock SDLC workflow. MUST READ before any task. References all other workflow memories."
type: workflow
---

# AI-Assisted SDLC Workflow

## Classification First

Before starting ANY task, determine its `nature:` label:

| Nature | Workflow | TDD? |
|--------|----------|------|
| `code` — application logic, business rules | **A: Full Chain** | Yes |
| `config` — tooling, scripts, CI/CD | **B: Simplified** | No |
| `manual` — infra setup, external services | **C: Checklist** | No |

---

## Workflow A — Full Skill Chain (for `nature:code`)

### Phase 1 — Scope: `grill-me`

1. Invoke the `grill-me` skill
2. Walk down every branch of the decision tree
3. Do NOT create an issue until shared understanding is reached
4. Output: complete scope definition

**Rule:** No issue created until shared understanding is reached.

### Phase 2 — PRD: `write-a-prd`

1. Invoke the `write-a-prd` skill
2. Author PRD as a GitHub Issue (label: `type:story`)
3. PRD contains:
   - Problem statement
   - Solution
   - User stories (numbered, concrete)
   - Implementation decisions
   - Testing decisions
   - Out of scope (explicit)
4. Output: GitHub Issue with full PRD

**Rule:** PRD uses canonical terms from `UBIQUITOUS_LANGUAGE.md`. No implementation details, no file paths.

### Phase 3 — Breakdown: `prd-to-issues`

1. Invoke the `prd-to-issues` skill
2. Break PRD into small, atomic, testable tasks — each is a minimal vertical slice
3. Number of tasks is defined during `grill-me` — not bounded by time
4. Create child Issues (label: `type:task`) linked to parent PRD
5. Create Milestone for the Story
6. Tasks are parallel-able by default; order by dependency only when known
7. Output: Issues + Milestone

**Rule:** Vertical slices only — each task delivers a working feature end-to-end, not a layer at a time.

**Cross-cutting concerns** (e.g., adding instrumentation across all endpoints, updating patterns app-wide): classified as `nature:code`, use `write-a-prd` + `request-refactor-plan` in sequence — PRD defines the target pattern, refactor plan defines safe incremental steps.

### Phase 4 — Implement: `tdd`

Per task (one at a time):

1. Create branch: `task/{E(epic#)-(task#)-(short-desc)}` — e.g., `task/E9-1-design-system-setup`
2. **Red:** Write failing test
3. **Green:** Write minimal code to pass
4. **Refactor:** Improve code quality
5. **Micro-Commit (REQUIRED):** After each discrete working state, commit before moving to the next step. Treat commits as rollback points, not delivery milestones.

   **Commit points per TDD cycle:**
   - After step 2 (Red → first failing test): `test(scope): add {description}`
   - After step 3 (Green → code passes): `feat(scope): implement {description}`
   - After step 4 (Refactor): `refactor(scope): extract {description}`
   - After step 6 (all 3 test suites green): `chore(scope): full test gate passing`

   **Commit message format:**
   ```
   type(scope): brief description

   - Detail 1
   - Detail 2
   ```
6. **Local Test Gate (REQUIRED):** Run `pnpm test:unit && pnpm test:integration && pnpm test:e2e`. ALL three must pass before proceeding. If any fail, fix locally and re-run. Do NOT push until all three are green.
7. Open PR: `closes #{task_number}`
8. **Block on CI:** Terminal waits — poll CI every 30s until all checks pass or fail. If CI fails, proceed to validation loop.
9. **Validation loop:**
   ```
   WHILE issues remain:
     Run /pr-validate
     → Auto-fix CI/lint issues
     → Fetch AI review comment
     → For EACH issue (critical to minor):
        - Validate against Context7 (primary) → WebSearch (fallback)
        - Fix legitimate issues autonomously
        - Dismiss non-legitimate concerns with clear reasoning
        - Document EVERY decision in a PR comment: what was found, action taken (fixed/dismissed), reasoning
     → If fixes made: commit with `fix(scope): resolve {issue}` → push → CI re-runs → repeat
     → If only dismissals: proceed
   ```
10. **Final review:** User reviews the full decision log (all dismissals + fixes) before approving the PR. If user disagrees with any AI decision, AI must rollback and redo.
11. Developer reviews and merges
12. Issue closes automatically

**Rule:** TDD is strict — no implementation without failing test first.

**Quality gates:** See [feedback_no_lift_quality_checks.md](feedback_no_lift_quality_checks.md) — never disable ESLint, TypeScript, or Prettier to make tests pass. Fix the underlying issue.

**⚠️ Before merge:** Step 9 (validation loop) MUST complete. Loop until all CI and AI review issues are resolved (fixed or dismissed). Step 10 documents all decisions.

**Micro-commit strategy:** Branch commits serve as rollback points during development. GitHub squash-merge at PR time produces one clean commit on `main`. No pre-merge rebase needed.

---

## Workflow B — Config/Infra Chain (for `nature:config`)

For tooling, scripts, CI/CD, Docker, infrastructure-as-code.

### Phase 1 — Task Breakdown

1. Analyze the work required
2. Break into discrete tasks (each should be independently mergeable)
3. Create GitHub Issues (label: `type:task`) — may or may not have a parent Story

### Phase 2 — Implement

Per task (one at a time):

1. Create branch: `task/{E(epic#)-(task#)-(short-desc)}`
2. Implement the config/script/tooling
3. **Micro-Commit:** After each discrete config unit:
   - After schema/config change: `chore(config): update {name} schema`
   - After script change: `chore(script): add {name} validation`
   - After CI change: `fix(ci): resolve {issue}`
4. If applicable, write basic sanity tests (e.g., Docker Compose syntax validation, script dry-run)
5. Open PR: `closes #{task_number}`
6. CI runs (lint, type-check, build if applicable)
7. **Validation loop:**
   ```
   WHILE issues remain:
     Run /pr-validate
     → Auto-fix CI/lint issues
     → Fetch AI review comment
     → For EACH issue (critical to minor):
        - Validate against Context7 (primary) → WebSearch (fallback)
        - Fix legitimate issues autonomously
        - Dismiss non-legitimate concerns with clear reasoning
        - Document EVERY decision in a PR comment: what was found, action taken (fixed/dismissed), reasoning
     → If fixes made: commit with `fix(scope): resolve {issue}` → push → CI re-runs → repeat
     → If only dismissals: proceed
   ```
8. **Final review:** User reviews the full decision log (all dismissals + fixes) before approving the PR. If user disagrees with any AI decision, AI must rollback and redo.
9. Developer reviews and merges

**Rule:** Even though no TDD, always run CI quality gates (ESLint, Prettier, type-check).

**⚠️ Before merge:** Step 7 MUST run after CI is green. Loop until all issues are resolved (fixed or dismissed).

**Micro-commit strategy:** Branch commits serve as rollback points during development. GitHub squash-merge at PR time produces one clean commit on `main`. No pre-merge rebase needed.

---

## Workflow C — Manual Checklist (for `nature:manual`)

For infrastructure setup, external service configuration, DNS, server provisioning, OAuth app creation.

### Phase 1 — Create Issue

1. Create GitHub Issue (label: `type:task`, `nature:manual`)
2. Document what needs to be done with context and constraints
3. Do NOT write code in the codebase for this task

### Phase 2 — LLM Produces Checklist

1. LLM outputs a detailed step-by-step checklist as issue body comment OR as a separate document
2. Checklist must be actionable by a human without AI assistance
3. Each step should be:
   - Atomic (one action)
   - Verifiable (can confirm it succeeded)
   - Include expected output/errors where relevant

### Phase 3 — Human Executes

1. Human follows the checklist step by step
2. Each step may involve: web UI actions, CLI commands, API calls, terminal operations
3. All changes happen OUTSIDE the codebase OR in designated infra repos
4. Trivial codebase changes (< 5 lines, no test needed) that are direct consequences of manual work can be batched into the manual work's PR — no separate branch or PRD required

### Phase 4 — Automated Validation + Close

1. Automated validation runs — Playwright tests, scripts, or API checks that verify the manual work succeeded
2. Validation results added as a PR comment — this becomes the verification artifact for reviewer
3. If the manual work had no codebase changes and no PR was needed, leave the validation results as an issue comment
4. Human closes the issue only after confirming all steps completed (automated validation passed OR human confirmed)

**Rule:** No branch, no PR, no TDD for pure manual tasks. The issue is the artifact.

**Example checklist structure:**
```markdown
## Setup Checklist

### Step 1: Create OAuth App in GitHub
- [ ] Go to https://github.com/settings/developers
- [ ] Click "New OAuth App"
- [ ] Fill in:
  - Application name: `gas-saas`
  - Homepage URL: `https://app.example.com`
  - Authorization callback URL: `https://app.example.com/api/auth/callback/github`
- [ ] Click "Register application"
- [ ] Copy Client ID → add to Dokploy env var `GITHUB_CLIENT_ID`
- [ ] Generate Client Secret → add to Dokploy env var `GITHUB_CLIENT_SECRET`

### Step 2: Verify
- [ ] Check OAuth appears at https://github.com/settings/developers
- [ ] Attempt a test login with the deployed app
```

---

## Issue Hierarchy

```
Epic  (label: type:epic)
  └─ Story / PRD  (label: type:story)
       └─ Task    (label: type:task)
```

**Auto-close chain:** PR `closes #task` → Task closes → Story completes → Epic completes.

**Important:** After the user merges, ALWAYS ask before closing the associated issue. The user confirms merges via free-form (e.g., "PR merged", "PR #{number} merged"). Parse the confirmation, then ask "Should I close issue #{issue_number}?" before taking action.

---

## Labels

```
type:epic / type:story / type:task
domain:auth / domain:billing / domain:tenancy / domain:ui / domain:infra / domain:observability / domain:dx
status:ready / status:in-progress / status:blocked
priority:critical / priority:high / priority:normal
nature:code / nature:config / nature:manual
```

**Label rules:**
- Every issue MUST have a `nature:` label — the workflow is strictly associated with `nature:`
- If an issue is submitted without `nature:`, AI assesses it and proposes a label before starting work (user confirms or corrects)
- A task has exactly one `nature:` — use the dominant nature to determine the workflow entry point
- `status:blocked` means the task cannot proceed until a dependency is resolved — other unblocked tasks in the same epic can still be started in parallel

---

## Context7 for Library Docs

When working on any library/framework integration:
- Use `npx ctx7@latest library {name} "{query}"` to find the library ID
- Then `npx ctx7@latest docs {libraryId} "{query}"` for up-to-date docs
- Do NOT install community skills for library documentation — Context7 is always fresh

---

## Git Safety

**See also:**
- [feedback_branch_protection.md](feedback_branch_protection.md) — enable branch protection on `main` BEFORE first merge
- [feedback_no_lift_quality_checks.md](feedback_no_lift_quality_checks.md) — never disable quality gates

- **Branch naming:** `task/{E(epic#)-(task#)-(short-desc)}` — e.g., `task/E9-1-design-system-setup`
  - The task number is the PRD task number (stable identifier), NOT the GitHub issue number
  - Epic number comes from `ai-hld/epic-plan-v2.md`
  - Task number is defined during `grill-me` and written into the PRD
  - Gaps from de-scoped tasks are documented but do NOT cause renumbering — the branch name always references the original PRD task number
- **Squash merge only** — all PRs use squash merge for clean one-commit-per-feature history
- **CI must be green** before merge — user will never approve a red CI PR, no override mechanism
- **NEVER force push** to `main`
- **NEVER auto-close** issues — after user merges, always ASK before closing the associated issue
- **ALWAYS run** `/pr-validate` after CI green, before merge — it handles both CI fixes and AI review validation in the loop
- Never commit secrets or credentials
- All changes go through PR → review → merge
- **Database:** use `saas_test` not `test_db` for test database names
