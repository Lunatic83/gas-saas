#!/usr/bin/env python3
"""
Posts the AI review comment to the PR
"""
import os
import subprocess

pr_num = os.environ.get('PR_NUMBER', '')
review_file = os.environ.get('REVIEW_FILE', '/tmp/review_text.txt')
truncated = os.environ.get('TRUNCATED', 'false')
total_lines = os.environ.get('TOTAL_LINES', '0')

with open(review_file, 'r') as f:
    review_text = f.read()

truncation_note = ""
if truncated == "true":
    truncation_note = "\n\n---\n**Warning:** Diff truncated (showing 2000 of {} lines)".format(total_lines)

comment = "## AI Review (MiniMax)\n\n{}".format(review_text)
if truncation_note:
    comment += "\n" + truncation_note

result = subprocess.run(
    ['gh', 'pr', 'comment', pr_num, '--body', comment],
    capture_output=True,
    text=True
)

if result.returncode != 0:
    print("Failed to post comment:", result.stderr)
    exit(1)

print("Comment posted successfully")
