# Components

Reusable UI components and feature-specific components.

## Structure

- `ui/` — shadcn/ui base components (buttons, inputs, dialogs, etc.)
- `{feature}/` — feature-specific components (e.g. `auth/`, `billing/`)

## Guidelines

- All UI components use shadcn/ui primitives with Tailwind CSS.
- Feature components are co-located with their feature when they are tightly coupled, or placed here when shared across multiple features.
- Components here should be "dumb" — they receive data via props and emit events. Business logic lives in `server/`.
