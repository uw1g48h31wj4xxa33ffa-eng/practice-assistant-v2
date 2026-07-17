# Milestone 5-B Phase 1
# Copilot Review Response and Required Corrections

**Status:** Active Correction Request  
**Pull Request:** #1  
**Branch:** `feature/milestone-5b-profiles`  
**Merge Status:** Blocked  
**Human Approval:** Not granted  

---

## 1. Purpose

This document records the disposition of the GitHub Copilot Chat review for Milestone 5-B Phase 1 and defines the required corrections before merge.

Read together with:

1. `docs/AI/00_AI_Development_Master_v4.0.md`
2. `docs/AI/01_AI_Package.md`
3. `docs/AI/02_Current_Request.md`
4. `docs/AI/04_Decisions.md`
5. `docs/AI/06_Verification_Result.json`

---

## 2. Review disposition summary

| Finding | Disposition | Severity | Required action |
|---|---|---:|---|
| Active-period overlap not rejected during registration | accepted | blocking | Implement and test |
| Relative `$ref` incompatible with Ajv2020 | not-applicable as stated | non-blocking | Do not blanket-rewrite |
| `$id` / `$ref` resolution verification | accepted in part | blocking verification | Verify and test |
| Unsafe `as any` | accepted | required | Remove |
| Redundant `as Profile` cast | accepted | required | Remove where assertion validation permits |
| Persistence, migration, property-based testing, broad custom errors, comprehensive JSDoc, schema code generation | deferred | later milestone | Do not implement now |

---

## 3. Accepted blocking correction

### 3.1 Reject overlapping active periods during registration

Implement overlap rejection in `VersionRegistry.register()` before mutating Registry state.

Canonical interval semantics:

```text
[effectiveFrom, effectiveTo)
```

Rules:

- `effectiveFrom` is inclusive.
- `effectiveTo` is exclusive.
- Missing `effectiveTo` means unbounded.
- Adjacent periods are allowed.
- Overlapping `active` periods for the same Profile `id` are rejected.
- Rejection must occur before insertion.
- Registry state must remain unchanged after rejection.
- Error output must identify the Profile `id` and relevant versions.

Overlap condition:

```text
newFrom < existingTo AND existingFrom < newTo
```

Required tests:

1. overlapping unbounded active periods are rejected;
2. overlapping bounded active periods are rejected;
3. adjacent periods are accepted;
4. an unbounded active period and a later active period are rejected;
5. registry state is unchanged after rejection;
6. different Profile IDs do not conflict;
7. non-active statuses do not create false conflicts unless the Current Request requires otherwise.

---

## 4. Partially accepted schema-reference finding

Copilot statement:

```text
Relative $ref is incompatible with Ajv2020 and absolute URI is mandatory.
```

Disposition:

```text
not-applicable as stated
accepted in part
```

Reason:

A relative `$ref` may be valid when resolved against a valid absolute base `$id`. Do not rewrite all relative references merely because they are relative.

Required verification:

- every schema declares JSON Schema Draft 2020-12;
- each schema `$id` is unique and absolute;
- the base schema `$id` matches the resolved target of dependent `$ref` values;
- all schemas compile under `Ajv2020`;
- registered schemas resolve dependencies without runtime failure;
- representative valid fixtures for each Profile type pass;
- representative invalid fixtures fail for the intended reason.

Apply only the minimum correction if actual inconsistency or compile failure is confirmed.

Required tests:

1. all schemas compile under `Ajv2020`;
2. base-profile references resolve;
3. one valid fixture per Profile type passes;
4. relevant invalid fixtures are rejected;
5. unknown Profile types are rejected;
6. validation failure does not insert or cache a Profile.

---

## 5. Required type-safety corrections

Replace explicit `any` with safe narrowing such as:

```ts
const candidate = profile as Record<string, unknown>;
```

Prefer:

```ts
static validate(profile: unknown): asserts profile is Profile
```

After successful validation, remove redundant casts such as:

```ts
profile as Profile
```

Do not replace `any` with another unsafe assertion. Validation failure must throw and must never silently return an unvalidated value.

---

## 6. Deferred findings

Do not implement in this phase:

- persistent Registry storage;
- migration engine;
- property-based test infrastructure;
- broad custom error hierarchy;
- comprehensive JSDoc rollout;
- schema code generation;
- unrelated refactoring;
- Word Engine integration changes;
- Document Engine integration changes;
- UI changes.

Record them as `deferred`.

---

## 7. Required re-verification

Run all applicable Current Request verification, including:

```bash
npx tsx --test src/profiles/tests/profile-registry.test.ts
npm run lint
npm run build
npm run ai:verify
```

Also rerun required Word Engine and Document Engine regression verification.

Changed-file lint must finish with zero errors and zero warnings. Report only results produced from the final code state.

---

## 8. Git and Pull Request procedure

Do not merge Pull Request #1.

After successful correction and verification:

```bash
git status --short
git diff --stat
git diff --name-only
git diff
```

Stage explicit approved paths only.

Forbidden:

```bash
git add .
git add -A
```

Audit the staged diff:

```bash
git diff --cached --stat
git diff --cached --name-only
git diff --cached
```

Commit and push to:

```text
feature/milestone-5b-profiles
```

Update the existing Pull Request #1. Do not create a replacement PR unless the existing PR is unusable.

---

## 9. Review evidence record

Record every Copilot finding as:

- `accepted`
- `rejected`
- `not-applicable`
- `deferred`

For each non-accepted item, include a concise reason.

GitHub Copilot Chat must not be recorded as:

```text
Human reviewed
Human approved
```

Copilot review is advisory AI evidence only.

---

## 10. Completion conditions

Complete only when:

- overlap rejection is implemented;
- required overlap tests pass;
- `$id` / `$ref` resolution is verified by tests;
- unsafe `any` is removed;
- redundant assertions are removed where valid;
- changed-file lint passes;
- build passes;
- `ai:verify` passes;
- regression verification passes;
- Pull Request #1 is updated;
- Copilot Chat re-review is completed;
- all findings are dispositioned;
- final machine evidence is updated;
- explicit human approval is recorded before merge.

---

## 11. Mandatory instruction

身勝手な推測や独断は絶対にしないでください。  
指示書を忠実に守ってください。
