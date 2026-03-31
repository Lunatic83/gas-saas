#!/usr/bin/env python3
"""
Posts an error message to the PR
"""
import os
import subprocess

pr_num = os.environ.get('PR_NUMBER', '')
error = os.environ.get('ERROR', 'Unknown error')

comment = "## AI Review (MiniMax)\n\n**Error:** Failed to generate review: {}".format(error)

result = subprocess.run(
    ['gh', 'pr', 'comment', pr_num, '--body', comment],
    capture_output=True,
    text=True
)

if result.returncode != 0:
    print("Failed to post error comment:", result.stderr)
    exit(1)

print("Error comment posted")
