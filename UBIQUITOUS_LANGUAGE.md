# Ubiquitous Language

## Account Model

| Term                  | Definition                                                                                                              | Aliases to avoid                                      |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Account**           | The product-facing concept for a user's space — their data, subscription, and settings. In B2C v1 maps 1:1 with a User. | Tenant, organisation, workspace, company (in UI/PRDs) |
| **tenant_id**         | The internal database isolation key. Implementation detail — never exposed in UI or PRDs.                               | account_id (in DB schema)                             |
| **AccountMembership** | The link between a User and an Account, carrying their Role. In B2C v1 each Account has one membership.                 | user_tenant, member                                   |
| **User**              | An authenticated identity. Belongs to one or more Accounts via AccountMemberships.                                      | Member, account, login                                |
| **SuperAdmin**        | A platform-level operator with cross-account access. Not a member of any Account.                                       | Admin, owner, operator                                |
| **Admin**             | A User with management rights within their own Account.                                                                 | Owner, manager                                        |
| **Role**              | A named permission level assigned to a User within an Account (`admin` or `user`).                                      | Permission, access level                              |

## Billing

| Term                     | Definition                                                             | Aliases to avoid              |
| ------------------------ | ---------------------------------------------------------------------- | ----------------------------- |
| **SubscriptionTier**     | The billing plan level assigned to an Account (Free / Pro / Advanced). | Plan, tier, package, level    |
| **SubscriptionOverride** | A manual tier assignment by SuperAdmin independent of Stripe.          | Manual plan, billing override |

## Session & Auth

| Term        | Definition                                          | Aliases to avoid  |
| ----------- | --------------------------------------------------- | ----------------- |
| **Session** | A database-backed authenticated context for a User. | Token, auth state |

## Audit & Compliance

| Term         | Definition                                          | Aliases to avoid                 |
| ------------ | --------------------------------------------------- | -------------------------------- |
| **AuditLog** | An immutable record of a significant system action. | Activity log, event log, history |

## Feature Management

| Term            | Definition                                            | Aliases to avoid             |
| --------------- | ----------------------------------------------------- | ---------------------------- |
| **FeatureFlag** | A named toggle controlling feature access or rollout. | Feature switch, toggle, gate |

## Notifications

| Term             | Definition                           | Aliases to avoid      |
| ---------------- | ------------------------------------ | --------------------- |
| **Notification** | An in-app alert delivered to a User. | Alert, message, event |

## Background Jobs

| Term    | Definition                                            | Aliases to avoid                  |
| ------- | ----------------------------------------------------- | --------------------------------- |
| **Job** | An async unit of work processed by the BullMQ worker. | Task, queue item, background task |

## Flagged Ambiguities

- "account" was used to mean both **Account** and **User** — these are distinct concepts: an **Account** is the product space, while a **User** is an authentication identity. In the UI and PRDs, use "Account" for the product space and "User" for the person logging in.
- "tenant" and "account" are used interchangeably in some SaaS contexts — here they are distinct: **tenant_id** is the internal DB isolation key, **Account** is the product-facing concept exposed to users.
- "admin" could refer to **SuperAdmin** (platform-level) or **Admin** (account-level) — always qualify which scope is meant.

## Example Dialogue

> **Dev:** "When a new **User** signs up, do we create the **Account** immediately?"
> **Domain expert:** "Yes — signup is atomic. The **User**, **Account**, and **AccountMembership** are all created in a single transaction. The **User** lands directly in their **Account** after email verification."
> **Dev:** "What role does the new **User** get in the **Account**?"
> **Domain expert:** "They become the **Admin** of that **Account**. They're the sole member in B2C v1, but the role is `admin` because when we add team support in v2, you'll be able to invite others as `user`."
> **Dev:** "If a **SuperAdmin** needs to take over, can they?"
> **Domain expert:** "Only through **Impersonation**, which creates a shadow **Session** flagged as impersonated. The real **User** identity is preserved and auditable in the **AuditLog**."
