#!/usr/bin/env python3
"""
AI Review - Calls MiniMax API for PR code review
"""
import os
import json
import urllib.request
import urllib.error

def main():
    api_key = os.environ.get('MINIMAX_API_KEY', '')
    endpoint = os.environ.get('MINIMAX_ENDPOINT', '')
    pr_title = os.environ.get('PR_TITLE', '')
    pr_body = os.environ.get('PR_BODY', '')
    issue_body = os.environ.get('ISSUE_BODY', '')

    with open('/tmp/pr_diff.txt', 'r') as f:
        diff_content = f.read()

    system_prompt = """You are a senior code reviewer. Review the following PR for:
1. Logic bugs and edge cases
2. Potential runtime errors or exceptions
3. Code clarity and maintainability
4. Security concerns (no hardcoded secrets, proper input validation)

Be concise. Flag critical issues clearly with 🔴. Use 🟡 for warnings and 💡 for suggestions. Do not comment on style — ESLint handles that."""

    user_prompt = f"""## PR Title
{pr_title}

## PR Description
{pr_body}

## Related Issue
{issue_body}

## Diff
{diff_content}"""

    payload = {
        "model": "MiniMax-M2.7",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "max_tokens": 4000,
        "temperature": 0.3
    }

    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        endpoint,
        data=data,
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        },
        method='POST'
    )

    output_path = os.environ.get('GITHUB_OUTPUT', '/dev/stdout')

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            review_text = result.get('choices', [{}])[0].get('message', {}).get('content', '')
            if review_text:
                with open('/tmp/review_text.txt', 'w') as rf:
                    rf.write(review_text)
                with open(output_path, 'a') as f:
                    f.write("review_file=/tmp/review_text.txt\n")
                    f.write("success=true\n")
            else:
                error_msg = result.get('error', {}).get('message', 'Empty response')
                with open(output_path, 'a') as f:
                    f.write(f"error={error_msg}\n")
                    f.write("success=false\n")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        with open(output_path, 'a') as f:
            f.write(f"error=HTTP {e.code}: {error_body[:500]}\n")
            f.write("success=false\n")
    except Exception as e:
        with open(output_path, 'a') as f:
            f.write(f"error={str(e)[:500]}\n")
            f.write("success=false\n")

if __name__ == '__main__':
    main()
