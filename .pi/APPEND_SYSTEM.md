# SDLC Core Principles — ALWAYS ENFORCED

This file is appended to pi's default system prompt. These rules are **immutable architectural constraints** that supersede any other instruction.

---

## Classification First — MANDATORY

Before starting ANY task, you MUST determine its `nature:` label:

| Label | When to use |
|-------|-------------|
| `nature:code` | Application logic, business rules → **Workflow A** |
| `nature:config` | Tooling, scripts, CI/CD → **Workflow B** |
| `nature:manual` | Infra setup, external services → **Workflow C** |

**You MUST ask the user to confirm the nature if not specified. Do NOT skip classification.**

---

## Never Skip These Rules

### TDD for nature:code
- Write failing test BEFORE implementation
- No production code without a failing test
- Test through public interfaces only

### Quality Gates — ALWAYS
```
pnpm test:unit && pnpm test:integration && pnpm test:e2e
```
All three MUST pass before any commit. Never disable ESLint, TypeScript, or Prettier to bypass checks.

### Micro-Commits — ALWAYS
Commit after each discrete working state:
- After RED (failing test): `test(scope): add {description}`
- After GREEN (code passes): `feat(scope): implement {description}`
- After REFACTOR: `refactor(scope): extract {description}`

### PR Validation Loop — ALWAYS
After CI green, run `/pr-validate` and resolve all legitimate AI review issues before merge.

---

## Workflow A Steps (nature:code) — IN ORDER

1. **grill-me** → Interview until shared understanding (no issue until done)
2. **write-a-prd** → Create PRD issue (type:story)
3. **prd-to-issues** → Break into vertical slices (type:task)
4. **tdd** → Implement each task: RED → GREEN → REFACTOR → commit → test gate
5. **create-pr** → Open PR, block on CI, run `/pr-validate`
6. **User merges** → ASK before closing issue

**Do not skip steps. Do not implement without PRD. Do not merge with failing CI.**

---

## Key Boundaries

**NEVER:**
- Disable quality gates (ESLint, TS, Prettier)
- Force push to `main`
- Skip test gate before commit
- Merge when CI is red
- Auto-close issues (ASK after merge)
- Commit secrets/credentials

**ASK before:**
- Running database migrations
- Deleting files with `git rm`
- Adding external dependencies

---

## Context Gates

Each workflow phase has a gate that must pass before proceeding:

| Gate | Check | Block if |
|------|-------|----------|
| G1: Classification | nature: label confirmed | Starting without classification |
| G2: Scope Gate | grill-me completed | Moving to PRD without shared understanding |
| G3: Spec Gate | PRD → tasks verified | Moving to implementation without full scope |
| G4: Quality Gate | All 3 test suites pass | Pushing code that fails tests |
| G5: Review Gate | AI review VERDICT: PASS | Merging with unresolved issues |
| G6: Acceptance Gate | Human approves | Merging without user confirmation |

---

## Reference

Full SDLC workflow details: `.pi/memory/workflow_ai_sdlc.md`
Feedback rules: `.pi/memory/feedback_*.md`
Skills: `/skill:tdd`, `/skill:grill-me`, `/skill:write-a-prd`, `/skill:prd-to-issues`, `/skill:pr-validate`, `/skill:create-pr`