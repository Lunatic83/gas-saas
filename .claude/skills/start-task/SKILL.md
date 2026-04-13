---
name: start-task
description: Start working on a task with workflow enforcement. Use when user says "let's work on next task" or "start task #N". Validates the correct workflow is being followed based on task nature, checks branch naming, and verifies chain integrity before any implementation begins.
---

# Start Task

Begin implementation on a task with workflow enforcement — validates chain integrity, correct branch naming, and nature-based workflow selection before any code is written.

## Usage

```
/start-task [task-id]
```

- **With task-id**: Start the specified task (e.g., `/start-task 42` or `/start-task E9-3`)
- **Without task-id**: Automatically select the next available task by epic order

## Step 0 — Load Project Memory

Before starting, load memory files to ensure feedback rules and conventions are available:
```bash
cat .claude/memory/workflow_ai_sdlc.md
cat .claude/memory/feedback_*.md
```

## Process

### 1. Resolve Task

**If task ID provided:**
```bash
gh issue view {task-id} --json number,title,body,labels,milestone,state
```

**If no task ID — find next task by epic order:**
```bash
# Read epic-plan-v2.md to find current epic (lowest numbered epic with status "next" or "🚧")
# List all open type:task issues ordered by creation date
gh issue list --state open --label type:task --json number,title,labels,milestone --jq '.[] | "\(.number) \(.title)"'

# Filter to tasks belonging to the current epic (matching epic marker in title or milestone)
# Exclude tasks that are blocked by other open tasks
# Select the first unblocked task
```

Stop if no unblocked tasks found. Report: "All tasks complete for this epic. Nothing to start."

### 2. Validate Task Nature

```bash
gh issue view {task-id} --json labels --jq '.labels[] | .name' | grep "^nature:"
```

If no `nature:` label found:
1. Assess the task content
2. Propose a `nature:` label to the user: `code`, `config`, or `manual`
3. Ask user to confirm or correct before proceeding

### 3. Validate Chain Integrity

Based on `nature:`, verify prerequisites exist:

| Nature | Prerequisites |
|--------|--------------|
| `code` (Workflow A) | Parent PRD issue must exist (label: `type:story`). Tasks cannot exist without a PRD. |
| `config` (Workflow B) | Task issue exists. May or may not have a parent Story. |
| `manual` (Workflow C) | Task issue exists. No code prerequisites. |

**If `nature:code` and no parent PRD found:**
```
ERROR: Task #{task-id} has nature:code but no parent PRD found.
Workflow A (Full Chain) requires: grill-me → write-a-prd → prd-to-issues first.
Did you skip the PRD phase?
```

Stop. Do not proceed until PRD exists.

**Check for blocked tasks:**
```bash
# If task is blocked by another open task, report blocker
gh issue view {task-id} --json body --jq '.body' | grep -i "blocked by"
```

If blocked by an open task, report: "Task #{N} is blocked by #{blocker-id}. Resolve that first."

### 4. Create Worktree + Branch

**IMPORTANT — Branch naming uses PRD task number, NOT GitHub issue number:**

Extract the **PRD task number** from the issue title. The title format is `E{epic#}-{task#}: {description}`:
- Issue title: "E6-1: Auth Schema + Better-Auth Config" → Task number: **E6-1** (not 109)
- Issue title: "E9-3: Add shadcn Button" → Task number: **E9-3** (not 75)

Branch format: `task/{E{epic#}-{task#}}-{short-desc}`
Worktree path: `.claude/worktrees/task/E{epic#}-{task#}/{short-desc}`

```bash
# Extract epic and task numbers from issue title (e.g., "E6-1" from "E6-1: Auth Schema...")
# Extract short description from title (slugify, max 30 chars)
TASK_NUM="E{epic#}-{task#}"
SHORT_DESC="{slugified-desc}"
BRANCH="task/${TASK_NUM}-${SHORT_DESC}"
WORKTREE_DIR=".claude/worktrees/${TASK_NUM}"

# Create worktree directory if needed
mkdir -p "$WORKTREE_DIR"

# Check if worktree already exists
if [ -d ".git/worktrees/${TASK_NUM}" ] || git worktree list | grep -q "${WORKTREE_DIR}"; then
  # Worktree already exists — just checkout the branch
  git worktree list | grep "${WORKTREE_DIR}" | awk '{print $1}' | xargs git -C {} checkout "$BRANCH" 2>/dev/null || git -C "$WORKTREE_DIR" checkout "$BRANCH"
else
  # Create new worktree from main with new branch
  git worktree add -b "$BRANCH" "$WORKTREE_DIR" main
fi
```

Always proceed automatically — never ask the user to confirm worktree/branch creation.

### 5. Verify Previous Task PR Merged (Chain Integrity)

For Workflow A tasks, verify the previous task in the chain was merged:

```bash
# Get all type:task issues for the same parent PRD, ordered by creation
gh issue list --state open --label type:task --search "parent:PRD-{number}" --json number,title

# For the current task, check if any task with lower number is still open
# If previous task's PR is not merged, warn:
# "Task #{N-1} must be merged before starting Task #{N}."
```

If previous task is not merged, warn but allow proceeding (some tasks are parallelizable).

### 6. Report Task Context

```
## Starting Task #{number}

**Title:** {title}
**Nature:** {nature}
**Workflow:** {A|B|C}
**Parent PRD:** #{prd-id} (if nature:code)
**Milestone:** {milestone-name}

**Branch:** {current-branch}
**Worktree:** .claude/worktrees/{epic#}/{short-desc}

**Acceptance Criteria:**
- [ ] criterion 1
- [ ] criterion 2
```

### 7. Auto-Invoke Next Step (REQUIRED)

For **nature:code (Workflow A)**:
- **Automatically invoke `/tdd`** — do not prompt the user, proceed directly to TDD execution
- The TDD skill handles test writing, implementation, and refactoring autonomously

For **nature:config (Workflow B)** and **nature:manual (Workflow C)**:
- Report the task context and wait for user confirmation to proceed with implementation

### 8. Verify Local Tests Pass (Post-Implementation Gate)

After implementation is complete, before invoking `create-pr`:

```bash
pnpm test:unit && pnpm test:integration && pnpm test:e2e
```

If any test suite fails, do NOT push or create PR. Fix the failures locally first.

---

## Error Handling

| Error | Action |
|-------|--------|
| Task not found | Stop. Ask for valid task ID. |
| No `nature:` label | Propose label, get user confirmation. |
| `nature:code` without PRD | Stop. PRD is required for Workflow A. |
| Task blocked | Report blocker, stop. |
| Local tests fail | Block push, fix first. |

> **Note:** Wrong branch/worktree is handled automatically — the skill creates the correct worktree with branch and switches.

---

## Output

**On success:**
```
✅ Task #{id} ready: {title}
Nature: {nature} | Workflow: {A|B|C}
Branch: {branch}
Worktree: .claude/worktrees/{epic#}/{short-desc}
```

**On error/validation failure:**
```
❌ Cannot start task #{id}
Reason: {specific error}
```
