# 23 Milestone 5-A Final Correction Implementation Plan

## Objective
Milestone 5-Aの実装結果について、機械証跡・Markdown資産・Git状態・人間確認状態の不整合を最小変更で是正し、commit・push直前まで完了する。

## Files to Change
- `scripts/ai-governance/verify-project-state.mjs` (Gate判定ロジックの分離、DomSerializationVerifier抽出)
- `docs/AI/04_Decisions.md` (Gate方針の追記)
- `docs/AI/01_AI_Package.md` (整合性の修正)
- `docs/AI/05_Audit_Log.jsonl` (自己承認訂正イベントの追記)
- `docs/AI/06_Verification_Result.json` (再生成により自動更新)

## Mechanical Evidence Changes
- `06_Verification_Result.json` の構造を整理し、`requiredGates`, `informationalGates`, `preExistingIssues`, `overallResult` などを分離。
- `domSerializationVerifier` のステータスを正常に抽出。
- `05_Audit_Log.jsonl` に `approvalStatus: pending_human_review` となる `CORRECTION` イベントを追記。

## Gate Logic
- **Required Gates**: Word Engine tests, AI governance tests, 2 formal verify scripts, build, changed-files lint, OutputVerifier, DomSerializationVerifier, source hash, AI Package consistency, Audit Log validity, repository DOCX absence.
- **Informational Gates**: full repository lint.
- `overallResult` は Required Gates のみが全件成功した場合に `Passed` とする。

## Tests
- `npm run ai:verify`
- `npm run ai:precommit`
- `node --test scripts/ai-governance/tests/*.test.mjs`
- `node --test scripts/document-verification/tests/*.test.mjs`
- `node scripts/document-verification/verify-career-up-form1.mjs`
- `node scripts/document-verification/verify-hatarakikata-r8-form1.mjs`
- `npm run build`
- `npx eslint scripts/ai-governance/`

## Human Review Points
- `06_Verification_Result.json` のRequired/Informational分離と `overallResult` の Passed。
- `05_Audit_Log.jsonl` への `pending_human_review` 追加。
- `01_AI_Package.md` の正確性。

## Stop Conditions
- Required Gates Passed
- staged 0
- commit/push未実施
- 実顧客情報/docxなし
