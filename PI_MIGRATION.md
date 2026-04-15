# Pi Migration

Migration from Claude Code to pi.dev coding agent.

## What was migrated

| Claude Code | pi.dev | Status |
|-------------|--------|--------|
| `.claude/skills/` | `.pi/skills/` | ✅ 19 skills migrated |
| `.claude/memory/*.md` | `.pi/memory/` | ✅ 5 memory files |
| `.claude/settings.json` hooks | Extension (planned) | ⚠️ Hooks not available |
| `AGENTS.md`, `CLAUDE.md` | `.pi/` root | ✅ Copied |
| `UBIQUITOUS_LANGUAGE.md` | `.pi/` root | ✅ Copied |

## Key differences

### Skills
- Skills are loaded from `.pi/skills/` (project) or `~/.pi/agent/skills/` (global)
- Available via `/skill:name` command or auto-detected by pi
- See [pi skills docs](https://github.com/mariozechner/pi-coding-agent/blob/main/docs/skills.md)

### Extensions (not implemented yet)
- pi uses TypeScript extensions instead of JSON hooks
- Git guardrails would need to be rewritten as an extension
- See [pi extensions docs](https://github.com/mariozechner/pi-coding-agent/blob/main/docs/extensions.md)

### Sessions
- Sessions stored in `.pi/sessions/` (configurable via `sessionDir`)
- Can use `/tree` for navigation, `/fork` for branching
- Compaction works similarly to Claude Code's context management

## Manual setup needed

### 1. Remove old Claude Code config (optional)
```bash
# Keep for reference, or remove
rm -rf ~/.claude
```

### 2. Verify pi installation
```bash
pi --version
```

### 3. Run pi in this project
```bash
cd /Users/lunatic/workspace/gas-saas
pi
```

## Skills available

| Skill | Purpose |
|-------|---------|
| `/skill:grill-me` | Scope exploration interview |
| `/skill:write-a-prd` | Create PRD from user interview |
| `/skill:prd-to-issues` | Break PRD into vertical slices |
| `/skill:start-task` | Start implementation with workflow enforcement |
| `/skill:tdd` | Test-driven development cycle |
| `/skill:create-pr` | Create PR, poll CI, run validation |
| `/skill:pr-validate` | Validate PR CI status and AI review |
| `/skill:qa` | Interactive QA session |
| `/skill:triage-issue` | Investigate bugs with TDD fix plan |
| `/skill:improve-codebase-architecture` | Architectural refactoring proposals |
| `/skill:ubiquitous-language` | Extract domain glossary |
| `/skill:setup-pre-commit` | Set up Husky pre-commit hooks |
| `/skill:playwright-cli` | Playwright CLI integration |
| `/skill:shadcn` | shadcn/ui component library |

## Memory files

Loaded automatically at session start:
- `.pi/memory/workflow_ai_sdlc.md` - Master workflow
- `.pi/memory/feedback_*.md` - Constitutional rules

## Troubleshooting

### Skills not loading
Check `.pi/settings.json` has correct paths:
```json
{
  "skills": [".pi/skills"]
}
```

### Extension errors
Extensions require TypeScript. Run with verbose:
```bash
pi --verbose
```