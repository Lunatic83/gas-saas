---
name: e2e_local_testing
description: Always test E2E changes locally in Docker before committing to avoid CI failures.
type: feedback
---

## Rule: Test E2E Locally in Docker Before Committing

**When to apply:** Any change that affects E2E tests, rate limiting, middleware, or Docker environment.

**Why:** CI environment issues (rate limiting, timing, resource constraints) are easier to catch locally using the same Docker Compose setup that CI uses.

**How to verify:**

```bash
# 1. Start E2E environment (same as CI)
docker compose -f docker-compose.e2e.yml up -d

# 2. Wait for services to be healthy
docker compose -f docker-compose.e2e.yml ps

# 3. Run smoke tests against local Docker
BASE_URL=http://localhost:3100 pnpm exec playwright test --project=smoke

# 4. Stop environment
docker compose -f docker-compose.e2e.yml down
```

**What to check before committing:**
- E2E tests pass locally in Docker
- Rate limiting behavior is correct (or disabled in test mode)
- No 429 errors in test runs
- Test data is isolated (each test uses unique IPs/identifiers)

**If E2E tests fail in CI but pass locally:**
1. The CI environment may have different timing/resource constraints
2. Consider adding `E2E_TEST_MODE=true` env var that skips rate limiting
3. Check if Docker health checks and service startup timing differs

**Anti-pattern (never do this):**
- Push code that only passes unit/integration tests
- Assume E2E will pass without local verification
- Skip E2E testing because it takes time

**Correct approach:**
1. Make code changes
2. Run `pnpm test:unit && pnpm test:integration` locally
3. Test E2E in Docker locally: `docker compose -f docker-compose.e2e.yml up -d && BASE_URL=http://localhost:3100 pnpm test:e2e`
4. Fix any failures before committing
5. Commit only when all 3 test suites pass locally
