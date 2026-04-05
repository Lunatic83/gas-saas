# Project Memory Index

This file is the memory index for the gas-saas project. All project-specific memories are stored in `./memory/` and version-controlled with the repo.

**Solo project**: All memories must live in `.claude/memory/` (version-controlled). No user-level auto-memory.

## Memories

**⚠️ MASTER WORKFLOW — Read [workflow_ai_sdlc.md](memory/workflow_ai_sdlc.md) first before ANY task.** It references all other memories and is the source of truth for the development process.

- [AI SDLC Workflow](memory/workflow_ai_sdlc.md) — **MASTER** Matt Pocock workflow: classify nature → grill-me → write-a-prd → prd-to-issues → tdd
- [Branch protection critical](memory/feedback_branch_protection.md) — always enable branch protection on main BEFORE merging
- [Rate limiting design](memory/feedback_rate_limiting_design.md) — E5 uses IP-only; E6+ must add user ID for per-user limits
- **Docs**: Use Context7 (`npx ctx7@latest docs /shadcn-ui/ui "..."`) for shadcn/ui and Tailwind v4 docs. Don't install skill marketplace skills for UI libraries — docs are always fresh via Context7.
