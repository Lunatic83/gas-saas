# AI-Assisted SDLC Workflow — Mermaid Chart

> Visual overview of the AI-assisted software development lifecycle workflow.
> Source: `.claude/memory/workflow_ai_sdlc.md`

## Full Workflow Diagram

```mermaid
flowchart TD
    %% Start
    START([Start]) --> CLASSIFY

    %% Classification
    CLASSIFY{Classify by\nnature: label?}
    CLASSIFY -->|code| WORKFLOW_A
    CLASSIFY -->|config| WORKFLOW_B
    CLASSIFY -->|manual| WORKFLOW_C

    %% Workflow A — Full Chain
    subgraph WORKFLOW_A["Workflow A — Full Chain (nature:code)"]
        direction LR
        A1[grill-me\nscope & decisions]
        A2[write-a-prd\nGitHub Issue]
        A3[prd-to-issues\nvertical slices]
        A4{Cross-cutting\nconcern?}
        A5[request-refactor-plan\nsafe steps]
        A6[tdd\nRed → Green → Refactor]
        A7["Create branch\ntask/E{epic#}-{task#}-{desc}"]
        A8["Open PR\ncloses #{task_number}"]
        A9[pr-validate loop\nAI review and CI]
        A10[Final Review\ndecision log]
        A11{User\napproves?}

        A1 --> A2 --> A3 --> A4
        A4 -->|no| A6
        A4 -->|yes| A5 --> A6
        A6 --> A7 --> A8 --> A9 --> A10 --> A11
        A11 -->|yes| USER_MERGE
        A11 -->|rollback| A6
    end

    %% Workflow B — Config/Infra
    subgraph WORKFLOW_B["Workflow B — Config/Infra (nature:config)"]
        direction LR
        B1[Task Breakdown\nindependent tasks]
        B2["Create branch\ntask/E{epic#}-{task#}-{desc}"]
        B3[Implement\nconfig/script/tooling]
        B4[pr-validate loop\nAI review and CI]
        B5[Final Review\ndecision log]
        B6{User\napproves?}

        B1 --> B2 --> B3 --> B4 --> B5 --> B6
        B6 -->|yes| USER_MERGE
        B6 -->|rollback| B3
    end

    %% Workflow C — Manual Checklist
    subgraph WORKFLOW_C["Workflow C — Manual (nature:manual)"]
        direction LR
        C1[Create Issue\nnature:manual]
        C2[LLM Produces\nChecklist]
        C3[Human Executes\nstep by step]
        C4[Automated Validation\nPlaywright/scripts]
        C5[Human Confirms\nand closes issue]

        C1 --> C2 --> C3 --> C4 --> C5
    end

    %% Cross-cutting concerns path
    subgraph CROSS_CUTTING["Cross-Cutting Concerns\n(nature:code)"]
        direction TB
        CC1[write-a-prd\ndefine target pattern]
        CC2[request-refactor-plan\nsafe incremental steps]
        CC3[tdd per step\nsmall PRs]

        CC1 --> CC2 --> CC3
    end

    %% Merge gate
    USER_MERGE{User merges PR\nsquash merge\nCI must be green}
    USER_MERGE -->|done| ASK_CLOSE

    ASK_CLOSE{Ask before\nclosing issue?}
    ASK_CLOSE -->|user confirms| CLOSE_ISSUE
    ASK_CLOSE -->|skip| END

    CLOSE_ISSUE["Close issue #\{issue_number\}"]
    CLOSE_ISSUE --> END([End])

    %% Styles
    classDef workflowA fill:#2d6a4f,color:#fff
    classDef workflowB fill:#1d3557,color:#fff
    classDef workflowC fill:#b5651d,color:#fff
    classDef crossCut fill:#9b2335,color:#fff
    classDef mergeGate fill:#333,color:#fff

    class WORKFLOW_A workflowA
    class WORKFLOW_B workflowB
    class WORKFLOW_C workflowC
    class CROSS_CUTTING crossCut
    class USER_MERGE mergeGate
```

---

## Issue Lifecycle

```mermaid
flowchart LR
    Epic -->|type:epic| Story -->|type:story| Task -->|type:task| PR -->|closes #| Task
    Task -->|completes| Story -->|completes| Epic
```

---

## Validation Loop Detail

```mermaid
flowchart TD
    LOOP_START{Validation Loop}
    LOOP_START --> PRV[pr-validate]

    PRV --> CI{CI green?}
    CI -->|no| FIX_CI[Auto-fix CI/lint]
    FIX_CI --> PRV
    CI -->|yes| AI_REVIEW

    AI_REVIEW[Fetch AI review\ncomment]
    AI_REVIEW --> ISSUES{Issues\nremaining?}

    ISSUES -->|yes| FOR_EACH[For EACH issue]
    FOR_EACH --> VALIDATE[Validate:\nContext7 → WebSearch]
    VALIDATE --> DECISION{Legitimate?}

    DECISION -->|yes| FIX[Fix\nautonomously]
    DECISION -->|no| DISMISS[Dismiss with\nreasoning]

    FIX --> DOC[Document in\nPR comment]
    DISMISS --> DOC

    DOC --> PUSH{Push changes\nCI re-runs?}
    PUSH -->|yes| PRV
    PUSH -->|no| NEXT_ISSUE

    NEXT_ISSUE[Next issue] --> ISSUES
    ISSUES -->|no| FINAL_REVIEW

    FINAL_REVIEW[User reviews\ndecision log]
    FINAL_REVIEW --> APPROVED{User\napproves?}

    APPROVED -->|yes| MERGE[Proceed to\nmerge]
    APPROVED -->|no| ROLLBACK[AI rollback\nand redo]

    ROLLBACK --> LOOP_START
```

---

## Label Rules

```mermaid
flowchart TD
    NEW_ISSUE{New issue\nsubmitted?} --> NATURE{Has\nnature:?}

    NATURE -->|yes| APPLY[Apply workflow\nby nature]
    NATURE -->|no| PROPOSE[AI proposes\nnature label]
    PROPOSE --> CONFIRM{User\nconfirms?}

    CONFIRM -->|yes| APPLY
    CONFIRM -->|no| ADJUST[Adjust label\nthen apply]

    style NEW_ISSUE fill:#f0f0f0,stroke:#333
    style APPLY fill:#2d6a4f,color:#fff
    style PROPOSE fill:#b5651d,color:#fff
```

---

## Branch Naming Convention

```mermaid
flowchart LR
    subgraph FORMAT["Format: task/E{epic#}-{task#}-{short-desc}"]
        TASK[task/]
        E[E]
        EPIC[epic#]
        DASH1[-]
        TASKNUM[task#]
        DASH2[-]
        DESC[short-desc]

        TASK --> E --> EPIC --> DASH1 --> TASKNUM --> DASH2 --> DESC
    end

    subgraph EXAMPLE["Example: task/E9-1-design-system-setup"]
        E9[E9]
        D1[-]
        N1[1]
        D2[-]
        DESC1[design-system-setup]

        E9 --> D1 --> N1 --> D2 --> DESC1
    end

    style FORMAT fill:#1d3557,color:#fff
    style EXAMPLE fill:#2d6a4f,color:#fff

    note1[["Epic# from epic-plan-v2.md"]]
    note2[["Task# from grill-me session\nstable identifier - gaps NOT renumbered"]]
```

---

## Key Rules Summary

| Rule | Value |
|------|-------|
| Branch format | `task/E{epic#}-{task#}-{short-desc}` |
| Merge strategy | Squash merge only |
| CI requirement | Must be green before merge — no override |
| Force push | Never to `main` |
| Issue close | Ask before closing — never auto-close |
| Validation | AI dismisses autonomously, documents every decision |
| Doc fallback | Context7 → WebSearch |
| Quality gates | Never disable ESLint/TypeScript/Prettier |
| Task sizing | Atomic, testable, minimal vertical slices (not time-based) |
| Parallelism | Tasks parallel-by-default unless explicit dependency |
| Cross-cutting | `write-a-prd` + `request-refactor-plan` in sequence |
| Trivial changes | <5 lines from manual work → batch into manual PR |
| Manual validation | Playwright/scripts → PR comment as artifact |