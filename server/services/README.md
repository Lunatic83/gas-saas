# Server Services

Business logic layer. These functions are called by Route Handlers and Server Actions.

## Naming

Files are named by domain: `auth.ts`, `billing.ts`, `accounts.ts`, etc.

## Guidelines

- Services are transaction-aware — mutations wrap multiple DB writes in a transaction.
- Services do NOT return React components or UI state — they return plain data objects.
- Errors are thrown as typed errors (`Error` subclasses), not returned as values.
