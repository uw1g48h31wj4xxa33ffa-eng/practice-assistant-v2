# Practice Assistant V2
# AI Collaboration Policy and Operating History

**Document role:** Project-wide source of truth for AI collaboration<br>
**Status:** Active<br>
**Version:** 1.0<br>
**Applies to:** ChatGPT, GitHub Copilot, Gemini, Claude, Perplexity, and the human project owner<br>
**Final decision authority:** Human project owner<br>

---

## 1. Purpose

This document defines how AI systems collaborate in Practice Assistant V2.

Its goals are to:

- prevent instruction drift;
- reduce duplicated and overlong AI instructions;
- preserve implementation quality;
- preserve governance and review evidence;
- make the development process reproducible;
- make AI-to-AI handoffs understandable without relying on long chat histories;
- ensure that the human project owner remains the final decision-maker.

This document must be read before creating, shortening, reviewing, or executing future AI instructions for this project.

---

## 2. Background and operating history

Practice Assistant V2 has been developed through staged milestones with AI-assisted design, implementation, review, verification, and governance.

The original instruction style emphasized self-contained and highly detailed documents. This was effective for:

- preventing defects;
- reducing implementation ambiguity;
- preserving compatibility;
- defining stop conditions;
- controlling Git operations;
- requiring verification evidence;
- preventing AI from making unauthorized decisions.

However, repeated use of self-contained instructions produced several operational problems:

- the same governance rules were repeated in many files;
- instruction documents became progressively longer;
- AI readers had to process large amounts of unchanged text;
- differences between tasks became harder to identify;
- maintenance cost increased;
- changing one common rule required updating multiple documents;
- chat history became less suitable as the primary source of truth.

The project therefore adopted a Markdown-first development model.

The current operating model is:

```text
Human decision
      ↓
ChatGPT architecture and governance
      ↓
Markdown source of truth
      ↓
Copilot instruction optimization and review
      ↓
Human approval of material changes
      ↓
Gemini implementation, tests, verification, and Git operations
      ↓
Copilot technical review
      ↓
Human final approval
      ↓
Merge and final verification
```

The project is now moving from long, repeated instructions to a modular AI instruction architecture.

---

## 3. Core principles

The project does not optimize for the shortest possible prompt.

The project optimizes for:

1. correctness;
2. safety;
3. compatibility;
4. maintainability;
5. reproducibility;
6. traceability;
7. governance;
8. efficient AI-to-AI handoff;
9. minimal unnecessary user interaction;
10. explicit human control.

Instruction length may be reduced only when these principles remain intact.

---

## 4. Source-of-truth hierarchy

Use the following hierarchy.

```text
Level 1: Project-wide policy
Level 2: Stable master instructions
Level 3: Phase-specific design and constraints
Level 4: Task-specific diff
Level 5: Implementation report and evidence
```

### Level 1 — Project-wide policy

Defines:

- AI roles;
- human authority;
- Markdown-first workflow;
- public disclosure rules;
- governance;
- general prohibitions;
- instruction modularity.

This document belongs to Level 1.

### Level 2 — Stable master instructions

Defines reusable implementation rules such as:

- Git workflow;
- verification requirements;
- reporting format;
- evidence requirements;
- prohibition of unauthorized changes;
- stop conditions common to all tasks.

These rules should not be repeated in every task instruction.

### Level 3 — Phase-specific design and constraints

Defines:

- phase objectives;
- architecture;
- scope;
- out-of-scope items;
- phase-specific stop conditions;
- completion criteria.

### Level 4 — Task-specific diff

Defines only what is unique to the current task:

- exact files;
- exact changes;
- exact tests;
- accepted and deferred review findings;
- task-specific risks;
- task-specific completion requirements.

### Level 5 — Reports and evidence

Contains:

- implementation report;
- verification result;
- review result;
- human approval;
- merge result;
- final commit state.

---

## 5. Markdown-first rule

Markdown is the primary communication medium for project state.

Chat is an orchestration interface, not the permanent source of truth.

Important decisions, architecture, implementation instructions, review findings, approval records, and final reports must be stored in Markdown or structured evidence files in the repository.

AI systems should read repository Markdown before relying on old chat context.

Detailed AI-to-AI communication should occur through shared Markdown.

The human user should receive concise summaries by default.

---

## 6. AI role definitions

## 6.1 ChatGPT

Primary responsibilities:

- architecture;
- system design;
- milestone planning;
- requirements structuring;
- governance;
- risk analysis;
- stop conditions;
- acceptance criteria;
- compatibility requirements;
- quality gates;
- cross-AI consistency;
- preparation of canonical Markdown instructions.

ChatGPT defines what should happen and why.

ChatGPT must avoid repeating stable rules when they can be referenced from an existing master document.

ChatGPT should create:

- project policies;
- phase design documents;
- task diffs;
- review disposition documents;
- concise human decision summaries.

ChatGPT must not treat its own output as final approval.

---

## 6.2 GitHub Copilot

Primary responsibilities:

- simplify and normalize AI instruction documents;
- remove duplication;
- identify contradictions;
- improve implementation readability;
- separate reusable rules from task-specific differences;
- review code and implementation evidence;
- flag unclear or risky instructions;
- preserve meaning while reducing length.

Copilot improves how instructions are expressed.

Copilot must not independently:

- change architecture;
- change scope;
- weaken governance;
- delete required stop conditions;
- remove verification requirements;
- reinterpret user decisions;
- authorize implementation;
- authorize merge;
- declare public disclosure safe.

When optimizing an instruction, Copilot must classify proposed changes as:

- wording-only;
- structural;
- semantic;
- scope-affecting;
- governance-affecting.

Semantic, scope-affecting, or governance-affecting changes require human approval before adoption.

---

## 6.3 Gemini

Primary responsibilities:

- repository investigation;
- implementation;
- tests;
- verification;
- evidence generation;
- Markdown reporting;
- controlled Git operations;
- branch, commit, push, and pull request work when explicitly authorized.

Gemini executes approved instructions.

Gemini must not:

- invent requirements;
- change architecture without approval;
- expand scope;
- suppress errors;
- skip required verification;
- merge without explicit human approval;
- substitute chat summaries for required Markdown reports.

Mandatory instruction:

> 身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

---

## 6.4 Claude

Claude is optional and should be used mainly for:

- major architecture audit;
- complex abstraction review;
- high-risk design alternatives;
- independent reasoning where a second architectural opinion is useful.

Claude is not required for routine implementation tasks.

---

## 6.5 Perplexity

Perplexity is used mainly for:

- external research;
- current standards;
- product or technology comparison;
- legal or technical source collection;
- factual verification requiring web evidence.

Perplexity is not the project authority for internal architecture.

---

## 6.6 Human project owner

The human project owner has final authority over:

- scope;
- architecture;
- milestone approval;
- risk acceptance;
- review disposition;
- publication;
- merge;
- completion declaration.

No AI approval replaces human approval.

Copilot approval is advisory.

Gemini completion is operational evidence.

ChatGPT recommendations are proposals.

---

## 7. Standard instruction workflow

The standard workflow is:

```text
1. ChatGPT defines architecture, scope, constraints, and stop conditions.
2. The result is stored in Markdown.
3. Copilot reviews the instruction for duplication, clarity, and contradictions.
4. Copilot returns a shortened or normalized proposal without changing meaning.
5. The human approves or rejects any material change.
6. Gemini implements the approved instruction.
7. Gemini records detailed results in Markdown.
8. Copilot reviews implementation and evidence.
9. Findings are dispositioned in Markdown.
10. Gemini corrects approved findings.
11. Copilot re-reviews if needed.
12. The human authorizes merge.
13. Gemini merges and performs final verification.
14. Final state is recorded in Markdown and Git history.
```

---

## 8. Instruction creation standard

Future instructions should normally use three layers:

```text
Stable Master Instruction
        ↓
Phase Instruction
        ↓
Task Diff
```

### Stable Master Instruction

Contains rules that rarely change.

Examples:

- no unauthorized assumptions;
- explicit-path staging;
- no `git add .`;
- no force push;
- stop on current-change failures;
- detailed report to Markdown;
- concise user response;
- human approval before merge.

### Phase Instruction

Contains the architecture and constraints for the current milestone or phase.

### Task Diff

Contains only the current task-specific changes.

The task diff should not restate the full master instruction.

---

## 9. Copilot optimization standard

When Copilot is asked to optimize an instruction document, it must:

1. read the project-wide policy;
2. identify duplicated sections;
3. identify content that belongs in a master instruction;
4. preserve all requirements, prohibitions, stop conditions, and completion criteria;
5. shorten repeated wording;
6. use references to canonical Markdown where appropriate;
7. produce a change summary;
8. identify any semantic change separately;
9. avoid changing technical intent;
10. return a version suitable for Gemini execution.

Copilot must provide:

- optimized instruction;
- removed duplication summary;
- unresolved ambiguity list;
- semantic-change declaration;
- recommendation on whether human approval is required.

---

## 10. Human-facing reporting standard

AI systems should not paste long operational logs into chat unless the user requests them.

User-facing reports should normally include:

- current status;
- completed items;
- blocking issues;
- decisions required;
- next step.

Detailed information belongs in Markdown.

---

## 11. GitHub and evidence model

GitHub stores both implementation and development-process evidence.

The repository may include:

- code;
- tests;
- architecture documents;
- AI instructions;
- review findings;
- review responses;
- verification evidence;
- human approval logs;
- merge records;
- final reports.

This makes the repository both:

- the software source repository;
- the auditable record of AI-driven development.

GitHub history must remain understandable without requiring full chat history.

---

## 12. Public disclosure rule

Internal AI instructions, review records, audit logs, and implementation details must not be shown externally as-is.

When external presentation is needed:

- create a separate public-facing Markdown document;
- remove or abstract confidential information;
- remove client-identifying information;
- remove security-sensitive information;
- remove credentials, URLs, access details, and unpublished infrastructure;
- preserve internal source documents unchanged;
- mark the public version as sanitized;
- require human confidentiality review;
- require human publication approval.

AI must never independently decide that a document is safe for public release.

---

## 13. Prohibited behavior

All AI systems are prohibited from:

- making unauthorized assumptions;
- changing requirements without approval;
- expanding scope;
- weakening governance;
- suppressing errors;
- declaring unverified work complete;
- treating advisory review as human approval;
- exposing internal material externally without a separate sanitized document;
- using long chat history as the only project record;
- duplicating stable rules unnecessarily;
- deleting important requirements merely to shorten an instruction.

---

## 14. Conflict resolution

When instructions conflict, use this priority order:

1. explicit current human decision;
2. project-wide mandatory policy;
3. approved stable master instruction;
4. approved phase design;
5. approved task diff;
6. AI recommendation;
7. implementation convenience.

If conflict remains, stop and request a human decision.

---

## 15. Completion and approval rule

No milestone or phase is formally complete until:

- implementation is finished;
- required verification is complete;
- evidence is recorded;
- review findings are resolved or explicitly deferred;
- human approval is recorded;
- merge is complete;
- final verification is complete;
- repository state is synchronized;
- no unresolved blocking issue remains.

---

## 16. Current standard role model

The standard role model from this point forward is:

```text
ChatGPT designs.
Copilot optimizes and reviews.
Gemini implements and verifies.
The human decides and approves.
```

This model applies unless the human explicitly changes it.

---

## 17. Mandatory preservation rule

Shortening is not the goal by itself.

The goal is:

> preserve quality, governance, reproducibility, and human control while removing repetition and unnecessary length.

Any shortened instruction that loses a requirement, stop condition, verification gate, or approval boundary is invalid.
