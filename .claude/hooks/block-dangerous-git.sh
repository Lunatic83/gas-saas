#!/bin/bash
# Git guardrails hook — blocks dangerous git commands before Claude executes them
# Blocks: push from/to main, reset --hard, clean -fd, branch -D, checkout ., restore .
# Allows: push to feature branches

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | python3 -c "import sys, json; print(json.load(sys.stdin)['tool_input']['command'])")

# Extract current branch
CURRENT_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null)

# Pattern 1: push from main branch → blocked
if [ "$CURRENT_BRANCH" = "main" ] && echo "$COMMAND" | grep -qE "^git push"; then
  echo "BLOCKED: push from 'main' is not allowed. Create a feature branch first: git checkout -b task/E{epic}-{issue-id}-description" >&2
  exit 2
fi

# Pattern 2: push to main explicitly (e.g. git push origin main) → blocked regardless of current branch
if echo "$COMMAND" | grep -qE "git push.*\bmain\b|git push.*refs/heads/main"; then
  echo "BLOCKED: pushing to 'main' is not allowed. Push to your feature branch and open a PR." >&2
  exit 2
fi

# Pattern 3: force push to main → blocked (explicit, catches variants)
if echo "$COMMAND" | grep -qE "git push.*--force|git push.*-f"; then
  if echo "$COMMAND" | grep -qE "main|refs/heads/main"; then
    echo "BLOCKED: force push to 'main' is not allowed." >&2
    exit 2
  fi
fi

# Pattern 4: other dangerous patterns
DANGEROUS_PATTERNS=(
  "git reset --hard"
  "git clean -fd"
  "git branch -D"
  "git checkout \."
  "git restore \."
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    echo "BLOCKED: '$COMMAND' matches dangerous pattern '$pattern'. The user has prevented you from doing this." >&2
    exit 2
  fi
done

exit 0
