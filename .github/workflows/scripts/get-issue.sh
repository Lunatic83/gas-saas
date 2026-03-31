#!/bin/bash
set -e

issue_body=$(gh issue view "${{ steps.context.outputs.issue_number }}" --json body --jq '.body // empty' 2>/dev/null | head -c 5000)
echo "issue_body=$issue_body" >> $GITHUB_OUTPUT
