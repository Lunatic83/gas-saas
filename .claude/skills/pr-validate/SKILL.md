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

Use the GitHub Actions workflow jobs API (not check-runs) — this gives per-job status reliably.

```bash
# Get the PR head branch and number
gh pr list --head "$BRANCH" --json number,headRefName --jq '.[] | "\(.number)|\(.headRefName)"'
```

Then find the latest workflow run for this branch:

```bash
# Find the latest completed or in_progress run for the branch
gh api "repos/{owner}/{repo}/actions/runs?branch={branch}&per_page=5" --jq '.workflow_runs | map(select(.status == "completed" or .status == "in_progress" or .status == "queued" or .status == "waiting")) | .[0] | {id, status, conclusion, head_sha, run_number, event}'
```

Get all jobs for that run:

```bash
gh api "repos/{owner}/{repo}/actions/runs/{run_id}/jobs" --jq '.jobs[] | "\(.name): \(.conclusion // .status)"'
```

Report all jobs and their status — do not stop at the first job.

### 3. Determine Outcome

Check every job's `conclusion` field (not `status`). A job is failed if `conclusion == "failure"`. Jobs still `in_progress`, `queued`, or `waiting` are not yet complete.

#### All Green ✅

All completed jobs have `conclusion: success` (or `skipped`). No job has `conclusion: failure`.

Report:
```
CI Status: All checks passed ✅
PR: #{number} — {title}

Jobs:
  - Job Name: success
  - Job Name: success
  ...
```

#### Failing 🔴

One or more jobs have `conclusion: failure`. Report immediately — do not wait for other jobs.

**Danger — PR mergeable while CI failing:**

If any job is failed AND the PR is mergeable:
```
⚠️  DANGER: PR is mergeable but CI is failing 🔴
```

Report per-job status and stop. Do NOT attempt auto-fix before reporting the danger.

#### In Progress ⏳

Jobs are still running. Report current status and wait.

```
CI Status: In progress ⏳
PR: #{number}
Jobs:
  - Build: in_progress
  - E2E Smoke: queued
  ...
```

### 3.5. Fetch PR Comments

After confirming all checks passed, automatically fetch AI review comments:

```bash
gh api repos/{owner}/{repo}/issues/{number}/comments
gh api repos/{owner}/{repo}/pulls/{number}/comments
```

Parse and format them as:

```
## AI Review Comments

- @author file.ts#line:
  > comment text
```

If no comments found, skip this step silently.

#### Failing 🔴 — Fetch Job Logs

If a job failed, fetch its logs for diagnosis:

```bash
# Get the job ID of the failing job
gh api "repos/{owner}/{repo}/actions/runs/{run_id}/jobs" --jq '.jobs[] | select(.conclusion == "failure") | {name, id}'

# Get the job logs
gh api "repos/{owner}/{repo}/actions/jobs/{job_id}/logs" --paginate
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

Wait 45 seconds for CI to re-run, then check again (Step 2). If still in progress, wait 30s more.

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

Jobs:
  - Code Quality: success
  - TypeScript: success
  - Unit Tests: success
  - Integration Tests: success
  - Build: success
  - E2E Smoke: success
```

**In Progress:**
```
CI Status: In progress ⏳
PR: https://github.com/{owner}/{repo}/pull/{number}

Jobs:
  - Code Quality: success
  - TypeScript: success
  - Build: in_progress
  - E2E Smoke: queued
```

**Danger (mergeable + failing):**
```
⚠️  DANGER: PR is mergeable but CI is failing 🔴
PR: https://github.com/{owner}/{repo}/pull/{number}

Jobs:
  - Code Quality: success
  - TypeScript: failure ←

Enable branch protection on main to block merges when CI fails.
Failed job: TypeScript
Error: TS[2304] 'something' doesn't exist
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
