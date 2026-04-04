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
2. Break PRD into vertical slices (max 4h each)
3. Create child Issues (label: `type:task`) linked to parent PRD
4. Create Milestone for the Story
5. Order tasks by dependency
6. Output: Issues + Milestone

**Rule:** Vertical slices only — each task delivers a working feature end-to-end, not a layer at a time.

### Phase 4 — Implement: `tdd`

Per task (one at a time):

1. Create branch: `task/{E(epic#)-(task#)-(short-desc)}` — e.g., `task/E9-1-design-system-setup`
2. **Red:** Write failing test
3. **Green:** Write minimal code to pass
4. **Refactor:** Improve code quality
5. Open PR: `closes #{task_number}`
6. CI runs + AI review
7. **Validation loop:**
   ```
   WHILE issues remain:
     Run /pr-validate
     → Auto-fix CI/lint issues
     → Fetch AI review comment
     → For EACH issue (critical to minor):
        - Validate against Context7 documentation
        - Dismiss non-legitimate concerns with clear reasoning
        - Fix legitimate issues found
     → If fixes made: push → CI re-runs → repeat
     → If only dismissals: proceed
   ```
8. **Document validation:** Leave a PR comment summarizing all decisions:
   - Each issue: what was found, decision (fixed/dismissed), reasoning
   - This becomes part of the PR record for developer review
9. Developer reviews and merges
10. Issue closes automatically

**Rule:** TDD is strict — no implementation without failing test first.

**Quality gates:** See [feedback_no_lift_quality_checks.md](feedback_no_lift_quality_checks.md) — never disable ESLint, TypeScript, or Prettier to make tests pass. Fix the underlying issue.

**⚠️ Before merge:** Step 7 (validation loop) MUST complete. Loop until all CI and AI review issues are resolved (fixed or dismissed). Step 8 documents all decisions.

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
3. If applicable, write basic sanity tests (e.g., Docker Compose syntax validation, script dry-run)
4. Open PR: `closes #{task_number}`
5. CI runs (lint, type-check, build if applicable)
6. **Validation loop:**
   ```
   WHILE issues remain:
     Run /pr-validate
     → Auto-fix CI/lint issues
     → Fetch AI review comment
     → For EACH issue (critical to minor):
        - Validate against Context7 documentation
        - Dismiss non-legitimate concerns with clear reasoning
        - Fix legitimate issues found
     → If fixes made: push → CI re-runs → repeat
     → If only dismissals: proceed
   ```
7. **Document validation:** Leave a PR comment summarizing all decisions:
   - Each issue: what was found, decision (fixed/dismissed), reasoning
   - This becomes part of the PR record for developer review
8. Developer reviews and merges

**Rule:** Even though no TDD, always run CI quality gates (ESLint, Prettier, type-check).

**⚠️ Before merge:** Step 6 MUST run after CI is green. Loop until all issues are resolved (fixed or dismissed).

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
4. If changes ARE needed in the codebase (e.g., .env.example updates), follow Workflow B

### Phase 4 — Confirm and Close

1. Human confirms all steps completed
2. Human closes the issue
3. If the manual work unblocks code tasks, those tasks can now begin

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

**Important:** See [feedback_pr_workflow.md](feedback_pr_workflow.md) — ALWAYS ask before closing issues after merge.

---

## Labels

```
type:epic / type:story / type:task
domain:auth / domain:billing / domain:tenancy / domain:ui / domain:infra / domain:observability / domain:dx
status:ready / status:in-progress / status:blocked
priority:critical / priority:high / priority:normal
nature:code / nature:config / nature:manual
```

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
- [feedback_branch_naming.md](feedback_branch_naming.md) — additional branch naming preferences and user rules
- [feedback_pr_workflow.md](feedback_pr_workflow.md) — always ask before closing issues
- [feedback_no_lift_quality_checks.md](feedback_no_lift_quality_checks.md) — never disable quality gates

- **Branch naming:** `task/{E(epic#)-(task#)-(short-desc)}` — e.g., `task/E9-1-design-system-setup`
  - The task number is the sequential number within the epic, NOT the GitHub issue number
- **NEVER merge PRs** — user merges manually after CI green
- **NEVER force push** to `main`
- **NEVER auto-close** issues — after user merges, always ASK before closing the associated issue
- **ALWAYS run** `/pr-validate` after CI green, before merge — it handles both CI fixes and AI review validation in the loop
- Never commit secrets or credentials
- All changes go through PR → review → merge
