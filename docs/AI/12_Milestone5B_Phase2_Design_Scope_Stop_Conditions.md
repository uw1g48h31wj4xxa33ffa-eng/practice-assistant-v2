# Milestone 5-B Phase 2
# Design, Scope, and Stop Conditions

**Status:** Design definition<br>
**Implementation Status:** Not started<br>
**Prerequisite:** Milestone 5-B Phase 1 completed<br>
**Target:** Profile Loader, Profile Resolver, cross-profile reference validation, and execution context foundation<br>

---

## 1. Purpose

Milestone 5-B Phase 2 connects the Profile Registry foundation created in Phase 1 to practical application flow.

Phase 2 does not yet complete full document generation or production migration.

The purpose is to establish a controlled mechanism that:

1. loads Profile definitions;
2. validates and registers them;
3. resolves the correct active versions;
4. validates references between Profiles;
5. creates a stable execution context for downstream engines.

---

## 2. Current starting point

Phase 1 already provides:

- seven Profile domain types;
- JSON Schema Draft 2020-12 validation;
- Ajv2020 strict validation;
- Profile Registry;
- Version Registry;
- exact-version retrieval;
- active-version resolution;
- `[effectiveFrom, effectiveTo)` interval semantics;
- active-period overlap rejection;
- synthetic fixtures;
- verification and governance evidence.

Phase 2 must reuse these components.

Do not replace or redesign Phase 1 without an explicitly approved architectural reason.

---

## 3. Target architecture

```text
Profile JSON files
        ↓
Profile Loader
        ↓
Profile Validator
        ↓
Profile Registry
        ↓
Cross-Profile Reference Validator
        ↓
Profile Resolver
        ↓
Execution Context Builder
        ↓
Downstream consumer
```

---

## 4. In scope

### 4.1 Profile Loader

Responsibilities:

- read Profile JSON files from an explicitly configured source;
- parse JSON safely;
- preserve source-file information for diagnostics;
- pass parsed values to `ProfileValidator`;
- register validated Profiles through `ProfileRegistry`;
- reject malformed or duplicate Profile definitions;
- return a structured load report;
- process files deterministically;
- never silently skip an error.

### 4.2 Cross-Profile Reference Validator

Responsibilities:

- confirm referenced Profile IDs exist;
- confirm expected Profile types match;
- confirm an applicable version can be resolved for the effective date;
- detect missing, invalid, and circular references where relevant;
- return structured diagnostics.

Initial reference examples:

- Workflow Profile → Form Profile
- Workflow Profile → Law Profile
- Workflow Profile → Mapping Profile
- Workflow Profile → Verification Rule Profile
- Form Profile → Document Version Profile

### 4.3 Profile Resolver

Responsibilities:

- receive a typed resolution request;
- resolve applicable active Profile versions;
- use an explicit effective date;
- fail if a required Profile cannot be resolved;
- return a typed result;
- never mutate Registry state.

### 4.4 Execution Context Builder

Responsibilities:

- transform resolved Profiles into a stable downstream context;
- retain source Profile IDs and versions;
- retain the effective date;
- retain validation and resolution evidence;
- expose only downstream-required data;
- avoid leaking mutable Registry internals.

---

## 5. Initial integration target

Select exactly one controlled integration target.

Recommended order:

1. `Career-Up Form`
2. `Hatarakikata R8 Form`

Recommended Phase 2 target:

```text
Career-Up Form
```

Do not connect both targets in the first implementation unless the first target is completed and independently verified.

---

## 6. Required decisions before implementation

Implementation must not begin until the following are fixed in Markdown:

1. loader source directory and file-discovery rule;
2. loader failure policy;
3. duplicate-file and duplicate-version policy;
4. cross-reference field definitions;
5. reference validation timing;
6. effective-date source;
7. resolver input and output interfaces;
8. execution-context interface;
9. first integration target;
10. legacy-path compatibility strategy;
11. feature-flag or explicit activation mechanism;
12. verification commands;
13. evidence file updates;
14. Git branch and PR strategy.

---

## 7. Out of scope

- database persistence;
- remote Profile service;
- cloud storage;
- admin UI for Profile editing;
- automatic legal-content updates;
- production client data;
- OCR integration;
- full migration of all documents;
- dynamic plugin loading;
- arbitrary user-defined code execution;
- schema code generation;
- broad error-class hierarchy;
- property-based testing;
- distributed cache;
- multi-tenant Profile isolation;
- automatic public documentation generation.

Deferred items must be recorded, not silently implemented.

---

## 8. Compatibility requirements

Phase 2 must preserve:

- existing Word Engine behavior;
- existing Document Engine behavior;
- existing fixtures;
- existing public interfaces unless explicitly approved;
- existing Phase 1 Registry semantics;
- existing JSON Schema validation behavior;
- localStorage compatibility where applicable;
- existing verification scripts;
- existing governance files.

The legacy path must remain available until the Profile-driven path is proven equivalent.

---

## 9. Security and confidentiality

- use synthetic data only;
- do not introduce real client data;
- do not include secrets, credentials, access tokens, or private URLs;
- do not log full sensitive payloads;
- external-facing materials must be created separately as sanitized public documents;
- internal AI instructions must not be copied directly into public materials.

---

## 10. Minimum tests

### Loader

- valid single file;
- valid multiple files;
- malformed JSON;
- invalid schema;
- duplicate Profile version;
- active-period overlap;
- unreadable or missing source;
- deterministic processing order;
- partial-load behavior.

### Reference validation

- all references valid;
- missing referenced Profile;
- wrong referenced Profile type;
- no active referenced version;
- boundary at `effectiveFrom`;
- boundary at `effectiveTo`;
- circular reference, if supported.

### Resolver

- resolves correct versions;
- resolves adjacent version boundary;
- rejects missing required Profiles;
- ignores non-active versions as defined;
- uses supplied effective date deterministically;
- does not mutate Registry state.

### Execution context

- contains IDs and versions;
- stable serialization;
- excludes mutable internal objects;
- rejects incomplete resolved sets;
- produces identical output for identical input.

### Regression

- Word Engine unchanged;
- Document Engine unchanged;
- Phase 1 tests remain passing;
- existing verification fixtures remain unchanged unless explicitly approved.

---

## 11. Verification gates

Required commands must include:

```bash
npx tsx --test src/profiles/tests/profile-registry.test.ts
npm run lint
npm run build
npm run ai:verify
```

Phase 2-specific test commands must be added after file names are finalized.

All verification must run against the final committed implementation state.

---

## 12. Git workflow

Recommended branch:

```text
feature/milestone-5b-phase2-profile-resolution
```

Required flow:

```text
main
  ↓
feature branch
  ↓
design confirmation
  ↓
implementation
  ↓
tests and verification
  ↓
explicit-path staging
  ↓
commit and push
  ↓
Pull Request
  ↓
Copilot review
  ↓
review disposition Markdown
  ↓
Gemini correction
  ↓
re-review
  ↓
human approval
  ↓
merge
  ↓
final verification on main
```

Prohibited:

- uncontrolled implementation on `main`;
- `git add .`;
- force push;
- bypassing review;
- merging before explicit human approval;
- unrelated changes;
- deleting governance evidence.

---

## 13. Stop conditions

Stop immediately and report in Markdown if:

1. Phase 1 interfaces require breaking changes;
2. Profile reference fields are ambiguous;
3. existing Profile schemas require broad redesign;
4. the first integration target cannot be isolated;
5. Word Engine or Document Engine regression appears;
6. the loader would silently skip invalid files;
7. the resolver can return multiple active candidates;
8. reference validation cannot determine expected Profile type;
9. real client data is required;
10. scope expands beyond Phase 2;
11. build, tests, lint, or `ai:verify` fails due to current changes;
12. local and remote branch states diverge unexpectedly;
13. required evidence cannot be produced;
14. a Critical or Major review finding remains unresolved.

Do not improvise around a stop condition.

---

## 14. Completion criteria

Milestone 5-B Phase 2 is complete only when:

- Loader is implemented and tested;
- cross-Profile reference validation is implemented and tested;
- Resolver is implemented and tested;
- Execution Context foundation is implemented and tested;
- one controlled integration target is connected or an approved adapter boundary is completed;
- legacy behavior remains available;
- all required verification passes;
- review findings are dispositioned;
- human approval is recorded;
- merge and final verification are complete;
- final Markdown report is committed;
- `HEAD == origin/main`;
- working tree is clean;
- no unresolved Blocking Issue remains.

---

## 15. AI reporting rule

Gemini must write detailed implementation and verification results to Markdown.

The user-facing response must contain only:

- current status;
- completed items;
- blocking issues;
- decision required;
- next step.

Do not paste long command logs into chat.

---

## 16. Mandatory instruction

身勝手な推測や独断は絶対にしないでください。<br>
指示書を忠実に守ってください。

推定、独自判断、勝手な仕様変更、指示範囲外の実装、エラーの握りつぶし、未確認事項の断定を禁止します。
