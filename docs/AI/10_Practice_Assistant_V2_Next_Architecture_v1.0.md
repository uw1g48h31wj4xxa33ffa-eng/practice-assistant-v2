# 10_Practice_Assistant_V2_Next_Architecture_v1.0
## AI協働型士業業務OS 次期設計書

### Status
Post-Level-4 strategic architecture

### Current Baseline
Word Document Engine Level 4: formally completed

---

## 1. Objective

Transform Practice Assistant V2 from a document-enabled case workflow into a durable AI-collaborative professional-services operating system.

The system must preserve:

- professional human judgment;
- evidence;
- applicable law/form version;
- document reproducibility;
- confidentiality;
- correction history;
- AI-provider replaceability.

---

## 2. Design Principles

1. Verified data only proceeds to formal outputs.
2. AI, machine, and human verification statuses remain separate.
3. Laws, forms, mappings, rules, and AI providers are versioned profiles.
4. Outputs are reproducible from recorded inputs and profile versions.
5. Delivered documents are immutable; corrections create new versions.
6. AI self-reporting is not evidence.
7. Human final approval is mandatory.
8. Production governance is a first-class layer, not an afterthought.
9. Markdown is for AI/human coordination; protected structured storage holds operational data.
10. No AI provider becomes a hard dependency.

---

## 3. Target Architecture

```text
Presentation Layer
├── Case UI
├── Verification UI
├── Professional Review UI
├── Document Delivery UI
└── Audit / Correction UI

Application Layer
├── Case Application Service
├── Verification Application Service
├── Regulation Resolution Service
├── Document Generation Service
├── Review / Approval Service
├── Delivery Service
└── Correction / Reissue Service

Domain / Profile Layer
├── Case Data
├── Verification State
├── Law Profile
├── Form Profile
├── Mapping Profile
├── Verification Rule Profile
├── Document Version Profile
└── AI Capability Profile

Engine / Adapter Layer
├── AI Provider Adapters
├── Document Input Adapter
├── Word Document Engine
├── OutputVerifier
├── Structural Verifier
└── Evidence Generator

Governance Layer
├── Access Control
├── Audit Trail
├── Data Classification
├── Retention / Deletion
├── Provider Transmission Policy
├── Incident Management
└── Human Approval Policy
```

---

## 4. Versioned Profiles

### 4.1 Law Profile

Required metadata:

```text
id
schemaVersion
lawVersion
effectiveFrom
effectiveTo
transitionRules
jurisdiction
sourceReferences
sourceHashes
requiredFacts
validationRules
supersedes
```

### 4.2 Form Profile

```text
id
schemaVersion
formVersion
effectiveFrom
effectiveTo
templateReference
templateHash
mappingId
verifierConfigId
supersedes
```

### 4.3 Mapping Profile

```text
id
schemaVersion
formProfileId
fieldDefinitions
inputModes
locators
manualCheckRules
humanReviewRules
compatibility
```

### 4.4 Document Version Profile

```text
documentId
caseId
version
status
generatedAt
lawProfileId
formProfileId
mappingProfileId
verificationResultHash
outputHash
approvedBy
approvedAt
supersedes
correctionReason
```

### 4.5 AI Capability Profile

```text
provider
model
approvedTasks
prohibitedTasks
toolCapabilities
dataTransmissionPolicy
retentionPolicy
jurisdiction
requiredGateStrength
requiredHumanReview
evaluationVersion
fallbackPolicy
```

---

## 5. Evidence Architecture

AI output is not authoritative evidence.

Required evidence chain:

```text
Task
→ Commands / official application path
→ Machine verification
→ 06_Verification_Result.json
→ hash
→ Audit event
→ AI Package reference
→ Human approval
```

Evidence records must be machine-readable, timestamped, and linked to Git/application versions.

---

## 6. Audit Architecture

Use append-only audit events.

Minimum event schema:

```text
eventId
timestamp
actorType
actorId
AIProvider
AIModel
action
caseId
documentId
beforeHash
afterHash
evidenceHash
approvalStatus
reason
```

Do not place protected personal data in audit messages.

---

## 7. Access Control

Future production model should separate:

- operator;
- professional reviewer;
- approver;
- administrator;
- auditor;
- AI service identity.

Minimum rules:

- case-level access;
- field-level restrictions where needed;
- AI service minimum privilege;
- reviewer and approver separation;
- immutable delivery records;
- audit access restrictions.

---

## 8. Data Governance

Before real client use, define:

- data classes;
- permitted providers;
- fields permitted for external AI;
- anonymization;
- domestic/foreign transfer;
- retention duration;
- deletion workflow;
- disclosure/correction/suspension handling;
- incident notification;
- backups;
- recovery;
- subcontractor/provider controls.

Development and demonstration environments must use synthetic or anonymized data.

---

## 9. Correction and Reissue Workflow

```text
Delivered document
→ Error/change detected
→ Correction case opened
→ Applicable profile versions resolved
→ Difference generated
→ Professional review
→ New document version
→ Previous version marked superseded
→ Redelivery
→ Audit event retained
```

Never overwrite the delivered original.

---

## 10. AI Collaboration Assets

Use numbered assets:

```text
00 Master
01 AI Package
02 Request
03 Architecture
04 Decisions
05 Audit Log
06 Verification Result
07 Security Governance
08 Profiles
09 Human Summary
10+ Project design documents
90 Templates
99 Archive
```

The AI Package remains compact and points to evidence rather than embedding all evidence.

---

## 11. Concurrency Strategy

### Development

- one active package writer;
- branch/worktree per parallel task;
- stale-package detection;
- explicit conflict resolution.

### Future application

- optimistic concurrency;
- record versions;
- compare-and-swap updates;
- conflict UI;
- immutable approval and delivery events.

---

## 12. Next Milestone

### Milestone 5-A — Evidence and AI Collaboration Foundation

Scope:

1. Number and normalize AI documentation assets.
2. Define `AI_Package` schema.
3. Generate `Verification_Result.json`.
4. Validate package/evidence consistency.
5. Add append-only audit log.
6. Add pre-commit or local Gate validation.
7. Prepare CI integration without changing business features.

Non-scope:

- OCR;
- RAG;
- production database migration;
- full RBAC/ABAC;
- external submission;
- real client data.

Completion condition:

```text
Another AI can resume from numbered assets;
verification evidence is machine-generated;
unsupported success claims are rejected;
Level 4 behavior remains unchanged.
```

---

## 13. Subsequent Milestones

### 5-B
Profile schema and version registry foundation.

### 5-C
Correction/reissue and document version lifecycle.

### 6
OCR/RAG and external integrations with approved governance.

### 7
Production access control, persistence, privacy, audit, incident, and operational governance.

---

## 14. Known Production Risks

Explicitly acknowledged as not yet complete:

- confidentiality and provider transmission controls;
- retention/deletion automation;
- RBAC/ABAC;
- foreign transfer management;
- production-grade audit immutability;
- concurrent writer locking;
- law/profile migration tooling;
- historical-case regression suite;
- incident response;
- correction/reissue UI.

These are mandatory before full production deployment with real client data.
