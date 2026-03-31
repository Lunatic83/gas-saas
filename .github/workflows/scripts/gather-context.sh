#!/bin/bash
set -e

pr_data=$(gh pr view "$PR_NUMBER" --json title,body --jq '{title: .title, body: .body}')
echo "pr_title=$(echo "$pr_data" | jq -r '.title' | head -c 2000)" >> $GITHUB_OUTPUT
echo "pr_body=$(echo "$pr_data" | jq -r '.body // empty' | head -c 10000)" >> $GITHUB_OUTPUT

branch_name="${{ github.head_ref }}"
issue_num=$(echo "$branch_name" | grep -oE '[0-9]+' | tail -1)
echo "issue_number=${issue_num:-}" >> $GITHUB_OUTPUT
