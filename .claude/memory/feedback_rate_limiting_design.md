---
name: feedback_rate_limiting_design
description: Rate limiting uses IP-only in E5, must include user in E6+ for per-user limits
type: feedback
---

**Rule:** When implementing user-based features (E6 Better-Auth), update rate limiting to include user ID alongside IP. The current implementation uses only `keys.rateLimit.auth(ip)` which limits by IP only.

**Why:** E5 PRD explicitly states "Rate limiting is IP-only in E5. Per-user limits require `withAuth` to be real (E6)." The rate limiter should evolve to use a composite key like `rate-limit:auth:{ip}:{userId}` once user authentication is available.

**How to apply:** When E6 (Better-Auth) is implemented and `withAuth` becomes real:
1. Update `lib/redis/keys.ts` to support composite rate limit keys
2. Update `withRateLimit.ts` to accept user ID from auth context
3. Consider keeping IP as fallback for unauthenticated requests
