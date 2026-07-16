# 20_Practice_Assistant_V2_Milestone_5A_Request_v1.0
## 証跡・AI協働基盤 実装Request

### Target
Practice Assistant V2

### Phase
Milestone 5-A

### Status
Implementation Request

---

## 0. Required Reading Order

作業開始前に、以下を順番に読み込んでください。

1. `00_AI_Development_Master_v4.0.md`
2. `01_AI_Package.md`
3. `10_Practice_Assistant_V2_Next_Architecture_v1.0.md`
4. この `20_Practice_Assistant_V2_Milestone_5A_Request_v1.0.md`

必要な場合のみ、`01_AI_Package.md`が指定する追加ファイルを読んでください。

チャット履歴ではなく、リポジトリ、機械証跡、承認済みMarkdownを正本として扱ってください。

身勝手な推測や独断は絶対にしないでください。  
指示書を忠実に守ってください。

---

## 1. Objective

Word Document Engine Level 4の正式完了状態を維持したまま、次のAIや人間が、AIの自己申告ではなく機械証跡に基づいて作業を継続できる基盤を構築してください。

今回の主目的は以下です。

```text
AI_Packageのスキーマ化
+
Verification Resultの機械生成
+
PackageとEvidenceの整合性検証
+
追記専用Audit Log
+
ローカルGate自動検証
```

---

## 2. Scope

今回実装するもの：

1. Numbering済みAI文書構成
2. `01_AI_Package.md`の標準化
3. AI Packageスキーマ定義
4. `06_Verification_Result.json`生成処理
5. Verification Resultスキーマ定義
6. AI PackageとVerification Resultの整合性検証
7. `05_Audit_Log.jsonl`追記処理
8. Audit Logスキーマまたはバリデーション
9. ローカル検証コマンド
10. pre-commit相当の軽量Gate検証
11. テスト
12. build
13. lint
14. Git差分監査
15. AI Package更新
16. 人間確認準備

---

## 3. Non-Scope

今回実装しないもの：

- OCR
- RAG
- 電子申請
- 本番DB移行
- Firebase等への本番移行
- 本番認証
- 完全なRBAC / ABAC
- 国外移転管理の本実装
- 保存期限・削除自動化
- 本番監査ログ基盤
- 複数AI同時編集ロックの本実装
- 本番GitHub Actions強制
- branch protection
- 実顧客データ
- Word Engineの新機能
- 既存業務画面の全面改修
- Level 4機能の仕様変更

GitHub Actionsは、必要な構成案または最小雛形までに留め、本番強制は次工程としてください。

---

## 4. Fixed Rules

- Level 4の既存機能を壊さない
- Word生成経路を変更しない
- 既存テストを弱体化しない
- skip追加禁止
- 期待値の不当変更禁止
- AIの文章上の成功報告を証跡として扱わない
- 機械証跡がないPASSは未検証扱い
- 実顧客情報禁止
- リポジトリ内docx禁止
- `git add .`禁止
- `git add -A`禁止
- 指示のないcommit・push禁止
- 今回変更由来lint error / warning 0
- 不具合時は途中成果を成功扱いしない

---

## 5. Gate 1 — Baseline and Current Structure Audit

最初に実コードと現在のMarkdown構造を確認してください。

最低限確認するもの：

```text
docs/AI/
既存AI_Package
既存Master
既存Request
既存Architecture
既存Decisions
既存Git状態
package.json
test runner
lint構成
verify scripts
Word Document Engine verify経路
OutputVerifier
DomSerializationVerifier
```

実行例：

```bash
pwd
git branch --show-current
git status --short
git diff --stat
git diff --name-only
git rev-parse HEAD
git rev-parse origin/main
find docs/AI -maxdepth 3 -type f | sort
find . -type f -name "*.docx" -not -path "./node_modules/*"
```

ここで、現在の構成と指示書が大きく異なる場合は、勝手に構造を決めず停止してください。

---

## 6. Numbered Documentation Migration

以下の構成へ最小変更で整理してください。

```text
docs/AI/
├── 00_AI_Development_Master_v4.0.md
├── 01_AI_Package.md
├── 02_Current_Request.md
├── 03_Architecture.md
├── 04_Decisions.md
├── 05_Audit_Log.jsonl
├── 06_Verification_Result.json
├── 07_Security_Governance.md
├── 08_Profiles/
├── 09_Human_Summary.md
├── 10_Practice_Assistant_V2_Next_Architecture_v1.0.md
├── 20_Practice_Assistant_V2_Milestone_5A_Request_v1.0.md
├── 90_Templates/
└── 99_Archive/
```

既存ファイルを無条件に削除しないでください。

旧ファイルがある場合：

1. 内容を確認
2. 正式ファイルへ必要情報を移行
3. 重複を解消
4. 必要なら`99_Archive/`へ移動
5. 参照切れを修正

---

## 7. AI Package Schema

`01_AI_Package.md`を自由文だけにせず、先頭に機械可読なYAML frontmatterを導入してください。

最低限：

```yaml
schema_version:
package_version:
project:
phase:
status:
updated_at:
updated_by:
repository:
branch:
head:
origin_head:
working_tree:
request_id:
verification_result_path:
verification_result_hash:
audit_log_path:
next_action:
blocking_issues:
human_review_status:
```

本文は人間・AI向け要約として残してください。

スキーマ検証では最低限、以下を確認してください。

- 必須キー
- 型
- 空値禁止項目
- ISO 8601日時
- statusの許容値
- next_actionが1件のみ
- verification result参照の存在
- Git状態との整合性
- placeholder禁止
- 未追跡状態をcleanと書かない

---

## 8. Verification Result

正式ファイル：

```text
docs/AI/06_Verification_Result.json
```

機械生成してください。

最低限の構造：

```json
{
  "schemaVersion": "",
  "generatedAt": "",
  "repository": "",
  "branch": "",
  "head": "",
  "originHead": "",
  "workingTree": "",
  "commands": [],
  "tests": {},
  "verify": {},
  "build": {},
  "lint": {},
  "outputVerifier": {},
  "domSerializationVerifier": {},
  "sourceHashes": {},
  "artifactPaths": [],
  "stdoutDigests": {},
  "resultHash": "",
  "overallResult": ""
}
```

各commandには最低限：

```text
command
exitCode
passCount
failCount
warningCount
startedAt
finishedAt
stdoutDigest
result
```

を持たせてください。

AIが値を推測して生成してはいけません。  
実行結果から取得してください。

---

## 9. Verification Automation

既存スクリプトを壊さず、統合検証用の新しい正式コマンドを追加してください。

候補：

```text
scripts/ai-governance/verify-project-state.mjs
scripts/ai-governance/validate-ai-package.mjs
scripts/ai-governance/generate-verification-result.mjs
scripts/ai-governance/append-audit-event.mjs
```

実際のリポジトリ構造に合わせて最小構成を選定してください。

統合コマンド例：

```bash
npm run ai:verify
```

このコマンドで、最低限以下を実行してください。

- AI Packageスキーマ検証
- 必須AI文書存在確認
- Git状態取得
- repository docx確認
- 既存自動テスト
- 既存2様式verify
- build
- changed-file lintまたは適切なlint
- Verification Result生成
- 結果ハッシュ生成
- AI Package参照整合性確認

長時間・不安定になる場合は、合理的に分割して構いませんが、正式な入口コマンドは1つ用意してください。

---

## 10. Audit Log

正式ファイル：

```text
docs/AI/05_Audit_Log.jsonl
```

append-onlyで扱ってください。

最低限のイベント構造：

```json
{
  "eventId": "",
  "timestamp": "",
  "actorType": "",
  "actorId": "",
  "provider": "",
  "model": "",
  "action": "",
  "target": "",
  "requestId": "",
  "beforeHash": "",
  "afterHash": "",
  "evidenceHash": "",
  "approvalStatus": "",
  "result": "",
  "reason": ""
}
```

禁止：

- 既存行の書換え
- 全置換
- 実顧客情報
- 不要なstdout全文
- 未検証成功記録

---

## 11. Freshness and Consistency Checks

最低限、以下の不整合を検知してください。

- AI PackageのHEADと実Git HEAD不一致
- originHead不一致
- working tree表記不一致
- Verification Resultが古い
- Verification Resultのhash不一致
- Request ID不一致
- placeholder残存
- 未追跡ファイルがあるのにclean表記
- 必須ファイル欠落
- Level 4正式完了状態の消失
- unresolved issueとblocking statusの矛盾

軽微な情報差で破壊的停止を起こさないようにしつつ、Git・証跡・承認の矛盾は停止条件にしてください。

---

## 12. Pre-Commit Gate

本番pre-commit導入は今回の必須範囲ではありませんが、少なくとも次のローカルGateを作成してください。

```bash
npm run ai:precommit
```

最低限：

- AI Package schema
- Verification Result schema
- package/evidence整合性
- Audit Log JSONL妥当性
- repository docx禁止
- placeholder禁止
- current-change lint
- Git staged範囲確認支援

既存開発フローへ過度な副作用を与えないでください。

---

## 13. Security and Governance Placeholder

`07_Security_Governance.md`を作成または更新し、未実装事項を明記してください。

最低限：

- 実顧客データ禁止
- AIプロバイダーへの送信範囲未確定
- 保存・削除未実装
- 国外移転管理未実装
- RBAC / ABAC未実装
- 本番監査ログ未実装
- 訂正・再発行は次期対象
- 本番化前必須Gate

未実装を「対応済み」と記載しないでください。

---

## 14. Tests

最低限、以下をテストしてください。

### AI Package validator

- 正常
- 必須キー欠落
- 型不正
- placeholder
- stale HEAD
- working tree矛盾
- next action複数

### Verification Result

- 正常生成
- command failure
- hash不一致
- missing result
- stale result

### Audit Log

- 正常append
- 既存行保持
- JSON不正拒否
- 必須項目欠落
- 個人情報を想定した禁止値ルールがある場合の拒否

### Regression

- Word Engine既存テスト
- 2様式verify
- build
- existing application behavior

---

## 15. Required Verification

実装後、以下を実行してください。

```bash
npm run ai:verify
npm run ai:precommit
node --test scripts/document-verification/tests/*.test.mjs
node scripts/document-verification/verify-career-up-form1.mjs
node scripts/document-verification/verify-hatarakikata-r8-form1.mjs
npm run build
npm run lint
find . -type f -name "*.docx" -not -path "./node_modules/*"
```

原本SHA確認も既存基準どおり実行してください。

各結果は`06_Verification_Result.json`に機械的に記録してください。

---

## 16. Human Review Preparation

今回の人間確認対象は、Word文書そのものではなく、主に次です。

- Numbering後のファイル発見性
- `01_AI_Package.md`の読みやすさ
- `06_Verification_Result.json`の生成
- `05_Audit_Log.jsonl`の追記
- `npm run ai:verify`の実行結果
- 既存Level 4機能が壊れていないこと

Finder表示または適切な方法で確認準備してください。

---

## 17. Git Audit

commit前に必ず実行してください。

```bash
git status --short
git diff --stat
git diff --name-only
git diff
```

確認：

- 範囲外変更なし
- 一時ファイルなし
- 実顧客情報なし
- リポジトリ内docxなし
- 既存Word Engine差分なし、または必要最小限
- テスト弱体化なし
- 未実装事項の虚偽記載なし
- Numbering移行の参照切れなし

---

## 18. Stop Point

今回は**commit・push直前で停止**してください。

理由：

- Numbering移行
- 新しい機械証跡
- Audit Log
- pre-commit Gate

を人間が確認する必要があるためです。

禁止：

- commit
- push
- release
- 本番反映

---

## 19. Stop Conditions

以下の場合は、それ以上進めず停止してください。

- 既存Level 4機能が壊れた
- tests / verify / build失敗
- current-change lint error / warning
- AI PackageとGit状態不一致
- Verification Result生成失敗
- Verification Result hash不一致
- Audit Log破壊
- 既存Markdown情報消失
- Numbering移行で参照切れ
- 実顧客情報検出
- リポジトリ内docx検出
- 範囲外変更
- 指示外のアーキテクチャ変更が必要

停止時は、`01_AI_Package.md`へ以下を記録してください。

```text
Facts
Evidence
Impact
Completed
Not Completed
Minimum Recommended Fix
Git State
Next Action
```

---

## 20. Completion Report

チャットには要点のみ報告してください。

```text
■ 結論
■ 実施
■ tests / verify / build / lint
■ AI Package schema
■ Verification Result
■ Audit Log
■ Numbering
■ Git状態
■ 人間確認事項
■ 未解決事項
```

詳細は以下へ残してください。

```text
01_AI_Package.md
05_Audit_Log.jsonl
06_Verification_Result.json
```

---

## 21. Completion Checklist

```text
[ ] Master v4.0 read
[ ] AI Package read
[ ] Next Architecture read
[ ] Request read
[ ] Baseline audited
[ ] Numbering structure established
[ ] AI Package schema implemented
[ ] AI Package validation implemented
[ ] Verification Result schema implemented
[ ] Verification Result generated mechanically
[ ] Result hash generated
[ ] Package/evidence consistency validated
[ ] Audit Log append implemented
[ ] Existing audit events preserved
[ ] ai:verify command added
[ ] ai:precommit command added
[ ] validator tests passed
[ ] evidence tests passed
[ ] audit tests passed
[ ] Word Engine regression tests passed
[ ] two formal verify scripts passed
[ ] build passed
[ ] current-change lint 0
[ ] repository DOCX absent
[ ] source hash unchanged
[ ] Level 4 behavior preserved
[ ] Git diff audited
[ ] Human review prepared
[ ] commit not performed
[ ] push not performed
```

未達が1件でもある場合は、完了と報告しないでください。
