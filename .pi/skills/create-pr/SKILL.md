---
name: create-pr
description: Create a GitHub Pull Request from a completed task branch. Use when a task implementation is done and ready for review. Works for nature:code and nature:config tasks. Requires the branch to follow the task/E{epic}-{task-number}-description naming convention.
---

# Create Pull Request

Create a Draft PR from the current feature branch, pre-filled with task context and the project's PR template.

## Prerequisites

1. The current branch follows the naming convention: `task/E{epic}-{task-number}-{short-description}`
2. The task issue exists on GitHub
3. All changes for the task are committed on the current branch

## Step 0 — Load Project Memory

Before starting, load memory files:
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

### 2. Detect Branch

Extract the task number from the current branch name.

```bash
BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null)
```

Expected format: `task/E{epic}-{task-number}-{short-description}`

Example: `task/E3-33-env-e2e-example`

If the branch doesn't match this pattern, stop and ask the user to confirm they're on a feature branch.

### 2. Fetch Task Context

```bash
gh issue view {task-id} --json number,title,body,labels
```

Store the title, body, and labels for use in the PR.

### 3. Check for Existing PR

```bash
gh pr list --head {branch-name} --json number
```

If a PR already exists, skip creation and report the existing PR URL.

### 4. Build PR Title

Format: `{task-title} (closes #{task-id})`

Example: `feat: add user registration endpoint (closes #42)`

### 5. Build PR Body

1. Read `.github/PULL_REQUEST_TEMPLATE.md`
2. Prepend `Closes #{task-id}` to the Summary section
3. Fill in any context from the task issue body
4. Keep the template structure intact

If no template exists, use a minimal body:
```markdown
## Summary

Closes #{task-id}

<!-- brief description of changes -->

## Notes

<!-- anything the reviewer should know -->
```

### 6. Extract Labels

From the task issue labels, include:
- `type:task` (always)
- `nature:code` or `nature:config` (from task)
- Any `domain:*` labels present on the task

### 7. Run Local Test Gate (REQUIRED)

Before creating the PR, verify all tests pass locally:

```bash
pnpm test:unit && pnpm test:integration && pnpm test:e2e
```

If any test suite fails:
- Do NOT create the PR
- Report: "❌ Local tests failed. Fix failures before creating PR."
- Stop and block PR creation until tests pass

### 8. Create PR

```bash
gh pr create \
  --title "{title}" \
  --body "{body}" \
  --label type:task \
  --label {nature} \
  --label {domain} \
  --draft
```

### 9. Assign Milestone

If the task issue has a milestone, assign it to the PR:

```bash
# Get milestone from task issue
MILESTONE=$(gh issue view {task-id} --json milestone --jq '.milestone.title')

# Assign to PR if present
if [ -n "$MILESTONE" ]; then
  gh pr edit {pr-number} --milestone "$MILESTONE"
fi
```

### 10. Link PR to Issue

After creation, explicitly link the PR to the task issue:

```bash
gh pr edit {pr-url} --link-issue-url https://github.com/$REPO_OWNER/$REPO_NAME/issues/{task-id}
```

This creates a bidirectional link visible in both the PR and the issue sidebar.

> **Note**: `--link-issue-url` is a GitHub API feature not yet exposed in `gh pr edit`. Until it is, the `Closes #{task-id}` in the PR body is sufficient for GitHub to link the PR and issue. The issue will auto-close when the PR merges.

## Error Handling

| Error | Action |
|-------|--------|
| Branch name doesn't match `task/E{epic}-{task-number}-*` | Stop. Ask user to confirm they're on the correct branch. |
| Task issue not found | Stop. Ask user to verify the issue number. |
| No commits on branch | Stop. Ask user to commit before creating PR. |
| PR already exists | Report existing PR URL. Skip creation. |
| Local tests fail | Block PR creation. Fix tests first. |

### 11. Block on CI (REQUIRED)

After PR creation, wait for CI to complete using a while-loop polling mechanism (15-second interval):

```bash
# Get the PR number and commit SHA
PR_NUMBER=$(gh pr view --json number --jq '.number')
COMMIT_SHA=$(gh pr view --json headRefOid --jq '.headRefOid')
START_TIME=$(date +%s)
TIMEOUT=600  # 10 minute max wait

while true; do
  ELAPSED=$(($(date +%s) - START_TIME))
  if [ $ELAPSED -ge $TIMEOUT ]; then
    echo "Timeout waiting for CI (${ELAPSED}s)"
    break
  fi

  STATUS=$(gh api repos/$REPO_OWNER/$REPO_NAME/commits/$COMMIT_SHA/status --jq '.state')

  if [ "$STATUS" = "success" ] || [ "$STATUS" = "failure" ] || [ "$STATUS" = "error" ]; then
    gh api repos/$REPO_OWNER/$REPO_NAME/commits/$COMMIT_SHA/check-runs --jq '.check_runs[] | "\(.name): \(.conclusion // .status)"'
    break
  fi

  echo "[$((ELAPSED/15+1))] Status: $STATUS — polling..."
  sleep 15
done
```
Report final CI status before returning.

### 12. Auto-Invoke /pr-validate (REQUIRED)

After CI completes (both success and failure cases), **automatically invoke the pr-validate skill** without prompting the user:

- If CI passed: immediately invoke `/pr-validate` to run the AI review evaluation loop
- If CI failed: immediately invoke `/pr-validate` to diagnose and auto-fix failures

Do NOT just print a message — actually invoke the skill so the validation loop runs autonomously.

## Output

After successful creation, milestone assignment, linking, CI completion, and pr-validate loop:
- PR URL
- PR title
- Branch name
- Milestone assigned (if any)
- CI Status (pass/fail)
- pr-validate result (AI review comments evaluated, issues fixed/dismissed)

---

## Post-Merge Worktree Cleanup

When the user signals the PR has merged (e.g., "PR merged", "merged", "done"):

1. **Do NOT ask to close the issue** — GitHub auto-closes via `Closes #{task-id}` in PR body
2. **Prompt for worktree cleanup:**

```
PR merged! 🎉

Clean up worktree? (y/n)
Path: .pi/worktrees/{epic#}-{task#}/{short-desc}
Branch will be kept for commit history.
```

3. **On user confirmation:**
```bash
git worktree remove .pi/worktrees/{worktree-path} --force
git checkout main && git pull origin main
```

4. **On user decline:** Do nothing. Branch remains.

**Rule:** Always keep the branch (`git branch -d` is NOT run). The branch is squash-merged into `main` with clean history — keeping it locally is unnecessary. The GitHub remote branch is deleted by GitHub's squash-merge behavior.
