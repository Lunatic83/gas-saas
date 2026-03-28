---
name: create-pr
description: Create a GitHub Pull Request from a completed task branch. Use when a task implementation is done and ready for review. Works for nature:code and nature:config tasks. Requires the branch to follow the task/N-description naming convention.
---

# Create Pull Request

Create a Draft PR from the current feature branch, pre-filled with task context and the project's PR template.

## Prerequisites

1. The current branch follows the naming convention: `task/{issue-number}-{short-description}`
2. The task issue exists on GitHub
3. All changes for the task are committed on the current branch

## Process

### 1. Detect Branch

Extract the task number from the current branch name.

```bash
BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null)
```

Expected format: `task/123-short-description`

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

### 7. Create PR

```bash
gh pr create \
  --title "{title}" \
  --body "{body}" \
  --label type:task \
  --label {nature} \
  --label {domain} \
  --reviewer @me \
  --draft
```

## Error Handling

| Error | Action |
|-------|--------|
| Branch name doesn't match `task/N-*` | Stop. Ask user to confirm they're on the correct branch. |
| Task issue not found | Stop. Ask user to verify the issue number. |
| No commits on branch | Stop. Ask user to commit before creating PR. |
| PR already exists | Report existing PR URL. Skip creation. |

## Output

After successful creation, report:
- PR URL
- PR title
- Branch name
- "Convert to ready for review when CI is green and you're satisfied with the diff."
