# Gemini Master Instruction v2.0 (Permanent)

## Purpose

This document is the permanent execution standard for all Gemini
implementation tasks. Always read this file first. Then read the
task-specific instruction. If there is a conflict, the task instruction
may override only explicitly stated items.

## Workflow

1.  Read this master.
2.  Read the task-specific instruction.
3.  Confirm scope.
4.  Execute Gate 1→Gate 5 in order.
5.  Submit evidence and checklist.
6.  Do not declare completion; wait for ChatGPT/human review.

## Core Principles

-   Prioritize correctness over speed.
-   Minimize unnecessary back-and-forth by completing all safe work in
    one pass.
-   Never guess.
-   If evidence is insufficient, stop and report.
-   Apply the smallest safe change.
-   Preserve backward compatibility.

## Gate Model

Gate 1: Structure investigation - Verify repository state. - Verify
architecture. - Verify assumptions.

Gate 2: Implementation - Only approved scope. - No unrelated
refactoring.

Gate 3: Automated verification - Tests - verify scripts - build - lint -
OutputVerifier - DomSerializationVerifier - SHA verification where
required

Gate 4: Deliverable verification - Generate output through the official
application path. - Confirm required UI behavior. - Prepare human
review.

Gate 5: Git audit - git status - git diff - Confirm only intended files
changed. - Stop before commit unless explicitly instructed.

## Evidence Rule

For every required action report: - Command - Exit code - Result -
Counts (if applicable)

Do not summarize without evidence.

## Quality Rules

-   No silent fallback.
-   No partial success treated as full success.
-   No test weakening.
-   Do not change test expectations to fit implementation.
-   Keep manualCheck/humanReview until defined release criteria are met.
-   Do not bypass Verifiers.

## Implementation Rules

-   Smallest safe modification.
-   Preserve existing behavior.
-   No hidden architectural changes.
-   No hardcoded business rules in shared Core.
-   No repository DOCX artifacts.

## Stop Conditions

Stop immediately if: - Architecture differs materially. - Data integrity
cannot be guaranteed. - Verifier cannot be executed. - Output may be
partially generated. - Existing behavior regresses. - Required evidence
cannot be collected.

## Reporting Format

1.  Facts
2.  Evidence
3.  Remaining risks
4.  Required fixes
5.  Checklist

## Completion Checklist

Completion requires all boxes checked: - Structure verified - Scope
respected - Tests passed - Verify passed - Build passed - Lint passed -
OutputVerifier passed - DomSerializationVerifier passed - Required SHA
checks passed - Output generated via official path - Human review
prepared - Git audit complete - Commit not performed unless instructed

## Maintenance Rule

This master is a living document. When ChatGPT identifies recurring
failure patterns, quality improvements, or better execution strategies,
update this master and use the latest version for all future Gemini
tasks.
