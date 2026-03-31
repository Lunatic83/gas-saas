# PR Validate

Check the current feature branch PR CI status, auto-fix common failures, and report results.

## Prerequisites

1. Current branch has an open PR
2. CI has run at least once

## Process

### 1. Detect PR

```bash
BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null)
gh pr list --head "$BRANCH" --json number,title,state --jq '.[] | "\(.number)|\(.title)|\(.state)"'
```

Stop if no PR found.

### 2. Fetch CI Status

```bash
gh api repos/{owner}/{repo}/commits/{ref}/status --jq '.state, .statuses[] | select(.context | startswith("ci/")) | "\(.context): \(.state)"'
```

Or use the Checks API for more detail:
```bash
gh api repos/{owner}/{repo}/commits/{ref}/check-runs --jq '.check_runs[] | "\(.name): \(.conclusion // .status)"'
```

### 3. Determine Outcome

#### All Green ✅

Report:
```
CI Status: All checks passed ✅
PR: #{number} — {title}
```

#### Failing 🔴

Fetch the failing job log:
```bash
# Get the run ID and job ID of the failing job
gh api repos/{owner}/{repo}/commits/{ref}/check-runs --jq '.check_runs[] | select(.conclusion == "failure") | {name, id, run_id}'

# Get the job logs URL
gh api repos/{owner}/{repo}/actions/jobs/{job_id}/logs --paginate
```

### 4. Diagnose and Auto-Fix

Common failure patterns and fixes:

| Failure Pattern | Detection | Fix |
|-----------------|-----------|-----|
| Prettier formatting | `Code style issues found` in log | `pnpm format && git add -A && git commit --amend --no-edit && git push --force` |
| ESLint errors | `Error:` in lint output | `pnpm lint:fix && git add -A && git commit --amend --no-edit && git push --force` |
| TypeScript errors | `TS[0-9]` errors | `pnpm exec tsc --noEmit` locally to see errors |
| Missing dependencies | `pnpm install` error | `pnpm install && git add -A && git commit -m "chore: install missing deps" && git push` |
| Build failure | `next build` fails | Read the build error, fix the specific issue |

### 5. Auto-Fix Loop

- **Round 1**: Attempt fix based on diagnosis
- **Round 2**: If still failing, fetch new logs, try alternative fix
- **Escalate**: If still failing after 2 rounds, report the failure details and let the user decide how to proceed (do not ask — just report status).

### 6. Push Fix

If a fix was applied:
```bash
git push --force-with-lease origin "$BRANCH"
```

Wait 45 seconds for CI to re-run, then check again. If still in progress, wait 30s more.

## Error Handling

| Error | Action |
|-------|--------|
| No PR found for branch | Stop and report. |
| CI not yet run | Wait 30s, re-check. Max 3 retries. |
| Auto-fix exhausted | Report failure + diagnosis, do not ask — just report status. |
| Network/API error | Retry once, then report error. |

## Output

**Success:**
```
CI Status: All checks passed ✅
PR: https://github.com/{owner}/{repo}/pull/{number}
Branch: {branch}
```

**Auto-fixed:**
```
CI Status: Auto-fixed and re-running 🔧
Attempted fix: {description}
PR: https://github.com/{owner}/{repo}/pull/{number}
Waiting for CI re-run...
```

**Escalated:**
```
CI Status: Failed after 2 auto-fix attempts 🔴
PR: https://github.com/{owner}/{repo}/pull/{number}

Failed: {job_name}
Error: {error_summary}

Attempts:
1. {what_i_tried}
2. {what_i_tried}

Please advise on how to proceed.
```
