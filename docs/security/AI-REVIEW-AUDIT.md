# Security Audit: MiniMax AI Code Review Action

**Action:** `tarmojussila/minimax-code-review`
**Pinned SHA:** `6b8aeefaf69cba00f4d36ee01a362971916f211c`
**Audit Date:** 2026-04-01
**Decision:** Approved with SHA pinning

---

## Overview

We use the `tarmojussila/minimax-code-review` GitHub Action to post automated AI code reviews on pull requests. This document records the security audit findings and the decision to use SHA pinning.

## Action Description

The action fetches the PR diff via GitHub API and sends it to the MiniMax API for code review. The AI response is posted as a PR comment.

**Repository:** https://github.com/tarmojussila/minimax-code-review
**Version used:** Pinned to commit SHA `6b8aeefaf69cba00f4d36ee01a362971916f211c`

---

## Token Management

| Token | How Used | Assessment |
|-------|----------|------------|
| `MINIMAX_API_KEY` | Sent to `api.minimaxi.chat/v1/chat/completions` | **Safe** — marked as secret, redacted from logs, only sent to intended endpoint |
| `GITHUB_TOKEN` | Used by Octokit for GitHub API calls (list files, post comments) | **Safe** — marked as secret, only used for GitHub API |

The action does **not** log, store, or exfiltrate either token.

---

## Data Access

| Data | How Accessed | Assessment |
|------|--------------|------------|
| PR diff | Fetched via `pulls.listFiles` API (no checkout) | **PR diff is sent to MiniMax API** — inherent privacy trade-off |
| Repository filesystem | None — no `actions/checkout` | **Safe** |
| GitHub metadata | Via Octokit GitHub API | **Minimal scope** |

---

## Security Assessment

### No malicious behavior detected

The code is straightforward and does not:
- Clone the repository
- Access the filesystem
- Contact any endpoint other than `api.minimaxi.chat` and GitHub's API
- Log or exfiltrate secrets

### Dependencies

Only official GitHub-maintained libraries:
- `@actions/core` ^1.10.1
- `@actions/github` ^6.0.0

### Author reputation

- GitHub member since 2011 (13+ years)
- Finnish developer (tarmojussila)
- Commit is GPG signed

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| PR diff sent to MiniMax servers | Medium | Acceptable trade-off for AI review capability |
| System prompt injection | Low | Mitigated by SHA pinning (action code is locked) |
| Action compromised after SHA pinning | Very Low | Would require GitHub compromise; SHA pinning prevents tag moving |

---

## Why SHA Pinning Over Forking

Forking the action would provide no additional security benefit because:
1. SHA pinning already locks to a specific commit
2. A fork would not receive automatic security updates
3. We would have to maintain the fork ourselves

SHA pinning is the standard practice for third-party actions with write access.

---

## Permissions Required

Our workflow declares:

```yaml
permissions:
  pull-requests: write
  contents: read
```

- `pull-requests: write` — required to post review comments
- `contents: read` — required to access PR file changes via GitHub API

---

## Action Version Policy

- **Do not update the SHA** unless there is a security fix that requires it
- If updating, re-audit the new commit before updating
- Monitor the upstream repository for security advisories

---

## Related

- Issue #48: PRD for AI Code Review
- PR #49: E3-07 AI review workflow implementation
