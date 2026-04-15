---
name: improve-codebase-architecture
description: Explore a codebase to find opportunities for architectural improvement, focusing on making the codebase more testable by deepening shallow modules. Use when user wants to improve architecture, find refactoring opportunities, consolidate tightly-coupled modules, or make a codebase more AI-navigable.
---

# Improve Codebase Architecture

Explore a codebase, surface architectural friction, discover opportunities for improving testability, and propose module-deepening refactors as GitHub issue RFCs.

A **deep module** (John Ousterhout, "A Philosophy of Software Design") has a small interface hiding a large implementation. Deep modules are more testable, more AI-navigable, and let you test at the boundary instead of inside.

## Process

### 1. Explore the codebase

Use `bash` and `read` tools to navigate the codebase naturally. Do NOT follow rigid heuristics — explore organically and note where you experience friction:

- Where does understanding one concept require bouncing between many small files?
- Where are modules so shallow that the interface is nearly as complex as the implementation?
- Where have pure functions been extracted just for testability, but the real bugs hide in how they're called?
- Where do tightly-coupled modules create integration risk in the seams between them?
- Which parts of the codebase are untested, or hard to test?

The friction you encounter IS the signal.

Explore using:
- `rg "<keyword>" --type ts` to find relevant patterns
- `read` source files to understand modules
- `ls -la src/` to understand structure
- `rg "export|import" --type ts` to trace dependencies

### 2. Present candidates

Present a numbered list of deepening opportunities. For each candidate, show:

- **Cluster**: Which modules/concepts are involved
- **Why they're coupled**: Shared types, call patterns, co-ownership of a concept
- **Dependency category**: See [REFERENCE.md](REFERENCE.md) for the four categories
- **Test impact**: What existing tests would be replaced by boundary tests

Do NOT propose interfaces yet. Ask the user: "Which of these would you like to explore?"

### 3. User picks a candidate

### 4. Frame the problem space

Write a user-facing explanation of the problem space for the chosen candidate:

- The constraints any new interface would need to satisfy
- The dependencies it would need to rely on
- A rough illustrative code sketch to make the constraints concrete — this is not a proposal, just a way to ground the constraints

Show this to the user, then ask them to think about it while you proceed.

### 5. Design multiple interfaces

Explore the target modules in depth, then design **3+ different interfaces** sequentially. Each design should be **radically different** from the others:

**Design 1: "Minimize the interface"**
- Aim for 1-3 entry points max
- Push complexity into internals
- Prefer implicit over explicit

**Design 2: "Maximize flexibility"**
- Support many use cases and extension
- Plugin architecture
- Open/Closed principle

**Design 3: "Optimize for the common case"**
- Make the default case trivial
- Special cases require extra effort
- Sensible defaults

**Design 4 (if applicable): "Ports & adapters"**
- Isolate cross-boundary dependencies
- Core domain has no infrastructure imports
- Adapters are injected at boundaries

For each design, output:
1. Interface signature (types, methods, params)
2. Usage example showing how callers use it
3. What complexity it hides internally
4. Dependency strategy (how deps are handled — see [REFERENCE.md](REFERENCE.md))
5. Trade-offs

### 6. Compare and recommend

Present designs sequentially, then compare them in prose.

After comparing, give your own recommendation: which design you think is strongest and why. If elements from different designs would combine well, propose a hybrid. Be opinionated — the user wants a strong read, not just a menu.

### 7. Create GitHub issue

Create a refactor RFC as a GitHub issue using `gh issue create`. Use the template in [REFERENCE.md](REFERENCE.md). Do NOT ask the user to review before creating — just create it and share the URL.