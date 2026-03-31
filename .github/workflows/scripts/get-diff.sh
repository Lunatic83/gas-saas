#!/bin/bash
set -e

diff_output=$(gh pr diff "$PR_NUMBER" 2>/dev/null)
total_lines=$(echo "$diff_output" | wc -l)

if [ "$total_lines" -gt 2000 ]; then
  echo "$diff_output" | head -n 2000 > /tmp/pr_diff.txt
  echo "truncated=true" >> $GITHUB_OUTPUT
  echo "total_lines=$total_lines" >> $GITHUB_OUTPUT
else
  echo "$diff_output" > /tmp/pr_diff.txt
  echo "truncated=false" >> $GITHUB_OUTPUT
  echo "total_lines=$total_lines" >> $GITHUB_OUTPUT
fi
