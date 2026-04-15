# PR Validate

Check the current feature branch PR CI status, auto-fix common failures, and report results.

## Prerequisites

1. Current branch has an open PR
2. CI has run at least once

## Step 0 — Load Project Memory

Before starting, load memory files to ensure feedback rules and conventions are available:
```bash
cat .pi/memory/workflow_ai_sdlc.md
cat .pi/memory/feedback_*.md
```

## Step 1 — Detect Repo Owner

```bash
REPO_OWNER=$(gh repo view --json owner --jq '.owner.login')
REPO_NAME=$(gh repo view --json name --jq '.name')
```

## Process

### 2. Detect PR

```bash
BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null)
gh pr list --head "$BRANCH" --json number,title,state --jq '.[] | "\(.number)|\(.title)|\(.state)"'
```

Stop if no PR found.

### 3. Fetch CI Status

```bash
gh api repos/$REPO_OWNER/$REPO_NAME/commits/{ref}/status --jq '.state, .statuses[] | select(.context | startswith("ci/")) | "\(.context): \(.state)"'
```

Or use the Checks API for more detail:
```bash
gh api repos/$REPO_OWNER/$REPO_NAME/commits/{ref}/check-runs --jq '.check_runs[] | "\(.name): \(.conclusion // .status)"'
```

### 4. Determine Outcome

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
gh api repos/$REPO_OWNER/$REPO_NAME/commits/{ref}/check-runs --jq '.check_runs[] | select(.conclusion == "failure") | {name, id, run_id}'

# Get the job logs URL
gh api repos/$REPO_OWNER/$REPO_NAME/actions/jobs/{job_id}/logs --paginate
```

### 5. Diagnose and Auto-Fix

Common failure patterns and fixes:

| Failure Pattern | Detection | Fix |
|-----------------|-----------|-----|
| Prettier formatting | `Code style issues found` in log | `pnpm format && git add -A && git commit --amend --no-edit && git push --force` |
| ESLint errors | `Error:` in lint output | `pnpm lint:fix && git add -A && git commit --amend --no-edit && git push --force` |
| TypeScript errors | `TS[0-9]` errors | `pnpm exec tsc --noEmit` locally to see errors |
| Missing dependencies | `pnpm install` error | `pnpm install && git add -A && git commit -m "chore: install missing deps" && git push` |
| Build failure | `next build` fails | Read the build error, fix the specific issue |

### 6. Auto-Fix Loop

- **Round 1**: Attempt fix based on diagnosis
- **Round 2**: If still failing, fetch new logs, try alternative fix
- **Escalate**: If still failing after 2 rounds, report the failure details and let the user decide how to proceed (do not ask — just report status).

### 7. Push Fix

If a fix was applied:
```bash
git push --force-with-lease origin "$BRANCH"
```

Wait 20 seconds for CI to re-run, then check again.

### 8. AI Review Evaluation Loop

After CI is green (or alongside auto-fix if CI was failing), evaluate AI review comments.

#### 8.1 Fetch Latest AI Review Comments

Always fetch fresh from GitHub — do not use cached or previously-seen comments:

```bash
gh api repos/$REPO_OWNER/$REPO_NAME/issues/{number}/comments --jq '.[] | select(.user.type == "Bot") | {id, body, created_at}'
gh api repos/$REPO_OWNER/$REPO_NAME/pulls/{number}/comments --jq '.[] | select(.user.type == "Bot") | {id, body, created_at}'
```

Filter to only comments from bots (the AI review action). If no new bot comments found, skip to Output.

#### 8.2 Evaluate Each Comment

For EACH comment, use reasoning to determine:

**LEGITIMATE ISSUE** (suggestion is valid and should be fixed):
- The suggestion addresses a real problem
- Applying it would improve the code
- It's not a false positive or out of scope

**FALSE POSITIVE** (should be dismissed):
- The suggestion is incorrect (would break the code)
- The suggestion is out of scope for this PR
- The issue was already fixed in a previous commit
- The suggestion contradicts project conventions not documented in Context7

**Verdict-Aware Evaluation:**
- If the comment contains "VERDICT: NOT READY TO MERGE", treat each listed violation as a legitimate issue requiring fixes. Do not dismiss without deep evaluation of the violated rule and its remediation.
- If the comment contains "VERDICT: PASS", no action needed — skip to the next bot comment.
- When evaluating constitutional violations (Quality Gates, TDD, Schema-First, Rate Limiting), validate against the project's `.pi/memory/feedback_*.md` rules before dismissing.

#### 8.3 Act on Each Comment

**If LEGITIMATE:**
1. Apply the fix
2. Amend commit: `git add -A && git commit --amend --no-edit && git push --force-with-lease origin "$BRANCH"`
3. Wait 20s for CI, then re-check CI status
4. Repeat from step 8.1 (fetch fresh comments — do not re-evaluate previous)

**If FALSE POSITIVE:**
1. Post a PR comment documenting the dismissal:
   ```
   **AI Review Evaluation:**
   - Comment: {original comment text}
   - Decision: Dismissed
   - Reason: {clear explanation}
   ```
2. Continue to next comment

#### 8.4 Loop Until No Legitimate Issues Remain

Repeat the full loop (fetch → evaluate → act → push → wait → re-fetch) until:
- CI is green AND
- All AI comments are either fixed or dismissed with documented reasons

### 9. Final Report

When loop completes (no legitimate issues remain):

```
## Validation Complete ✅

CI Status: {pass/fail}
AI Review: {N} comments evaluated
  - {N} fixed
  - {M} dismissed (false positives)
PR: {url}

All legitimate issues resolved. Ready for final review.
```

## Error Handling

| Error | Action |
|-------|--------|
| No PR found for branch | Stop and report. |
| CI not yet run | Wait 20s, re-check. Max 3 retries. |
| Auto-fix exhausted | Report failure + diagnosis, do not ask — just report status. |
| Network/API error | Retry once, then report error. |

## Output

**Success:**
```
CI Status: All checks passed ✅
PR: https://github.com/$REPO_OWNER/$REPO_NAME/pull/{number}
Branch: {branch}
```

**Auto-fixed:**
```
CI Status: Auto-fixed and re-running 🔧
Attempted fix: {description}
PR: https://github.com/$REPO_OWNER/$REPO_NAME/pull/{number}
Waiting for CI re-run...
```

**Escalated:**
```
CI Status: Failed after 2 auto-fix attempts 🔴
PR: https://github.com/$REPO_OWNER/$REPO_NAME/pull/{number}

Failed: {job_name}
Error: {error_summary}

Attempts:
1. {what_i_tried}
2. {what_i_tried}

Please advise on how to proceed.
```
