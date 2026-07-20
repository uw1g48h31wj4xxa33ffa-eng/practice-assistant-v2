# External Disclosure and Public Documentation Rule

**Status:** Mandatory project-wide rule

## Rule

Internal development materials must not be shown externally as-is.

When presenting this project, repository, AI-driven development workflow, implementation process, review process, or governance process to external parties, create a separate public-facing Markdown document after removing or abstracting confidential, personal, client-specific, security-sensitive, and operationally sensitive information.

## Mandatory handling

- Internal AI instructions remain internal.
- Internal review records remain internal unless explicitly sanitized.
- Client names, real organization names, personal data, credentials, URLs, environment details, infrastructure details, secrets, tokens, access methods, unpublished specifications, and private business logic must not appear in public materials.
- Public materials must be created as separate files.
- Do not overwrite internal source documents to create a public version.
- Public documents must clearly state that they are sanitized summaries.
- Before external sharing, perform a human confidentiality review.
- AI must never independently decide that a document is safe for publication.

## Public document examples

```text
docs/public/
├─ AI_Driven_Development_Overview.md
├─ Architecture_Overview_Public.md
├─ Governance_Workflow_Public.md
└─ Portfolio_Case_Study_Public.md
```

## Required review before publication

1. Confidentiality review
2. Personal-data review
3. Client-identification review
4. Security-information review
5. License and copyright review
6. Human approval

## Mandatory instruction

外部向けに見せる場合のみ、機密情報を除いた公開用Markdownを別途作成すること。<br>
内部資料をそのまま公開用へ転用しないこと。<br>
公開可否は必ず人間が最終判断すること。
