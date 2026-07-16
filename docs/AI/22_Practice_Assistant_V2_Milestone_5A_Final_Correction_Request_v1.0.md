# 22_Practice_Assistant_V2_Milestone_5A_Final_Correction_Request_v1.0

## 0. 目的

Milestone 5-Aの実装結果について、機械証跡・Markdown資産・Git状態・人間確認状態の不整合を最小変更で是正し、commit・push直前まで完了してください。

本Requestは、以下の運用原則を前提とします。

- Markdownベースの運用を維持する
- チャット履歴を正本にしない
- AIの自己申告を証拠にしない
- 機械証跡とMarkdownの一致を必須とする
- 人間が確認しやすいNumbering・要約・差分構成を維持する
- AIは自己承認しない
- 人間の確認・承認を明確に分離する
- チャットでの報告は要点のみとする
- 詳細はMarkdownおよびJSONへ記録する

身勝手な推測や独断は絶対にしないでください。  
指示書を忠実に守ってください。

---

## 1. 必須読込順序

以下を順番に読み込んでください。

1. `docs/AI/00_AI_Development_Master_v4.0.md`
2. `docs/AI/01_AI_Package.md`
3. `docs/AI/04_Decisions.md`
4. `docs/AI/05_Audit_Log.jsonl`
5. `docs/AI/06_Verification_Result.json`
6. `docs/AI/20_Practice_Assistant_V2_Milestone_5A_Request_v1.0.md`
7. `docs/AI/21_Milestone_5A_Implementation_Plan.md`
8. このRequest

チャット履歴ではなく、リポジトリ・機械証跡・承認済みMarkdownを正本として扱ってください。

---

## 2. 現在確認されている事実

現時点で確認済みの主要事実は以下です。

```text
Word Engine tests: 222 pass / 0 fail
AI governance tests: 3 pass / 0 fail
2 formal verify scripts: Success
build: Success
full repository lint: Failed
full repository lint details: 56 errors / 23 warnings
changed-files lint: Success / 0 errors / 0 warnings
OutputVerifier: Success
DomSerializationVerifier: 未記録
overallResult: Failed
human review: pending
staged: 0
```

これらを実測値で再確認してください。

---

## 3. 今回の修正対象

### 3.1 Gate判定の分離

`06_Verification_Result.json`では、Gateを次の2種類に明確に分けてください。

#### Required Gates

```text
- Word Engine tests
- AI governance tests
- 2 formal verify scripts
- build
- changed-files lint
- OutputVerifier
- DomSerializationVerifier
- source hash
- AI Package / Verification Result consistency
- Audit Log validity
- repository DOCX absence
```

#### Informational Gate

```text
- full repository lint
```

全体lintの既存問題は、次のように記録してください。

```text
status: PreExistingFailed
errors: 56
warnings: 23
blocking: false
```

ただし、今回変更由来のlint error / warningが1件でもある場合はRequired Gate失敗です。

このGate方針を`docs/AI/04_Decisions.md`へ追記してください。

---

### 3.2 overallResultの機械判定

`overallResult`はRequired Gatesのみから機械判定してください。

```text
Required Gateが全件成功 → Passed
Required Gateに失敗または未取得が1件でも存在 → Failed
```

Informational Gateの既存lint失敗のみを理由に`overallResult`をFailedにしないでください。

推測や手動上書きは禁止です。

---

### 3.3 DomSerializationVerifier証跡

現在、`domSerializationVerifier`が空です。

正式verifyまたは正式UI経路の実測結果から、次を機械的に記録してください。

```json
{
  "status": "Success または Failed",
  "sourceCommand": "...",
  "evidenceDigest": "...",
  "verifiedAt": "..."
}
```

未取得の場合はSuccessにしないでください。

必要であれば、既存正式verifyの出力を最小変更で機械判定可能にしてください。

---

### 3.4 Verification Result構造

`06_Verification_Result.json`へ最低限、以下を追加・整理してください。

```text
requiredGates
informationalGates
preExistingIssues
outputVerifier
domSerializationVerifier
packageConsistency
auditLogValidation
repositoryDocxCheck
overallResult
```

生のstdout全文を無制限に保持する必要はありません。

人間確認を容易にするため、以下を優先してください。

```text
command
exitCode
counts
result
digest
evidenceTime
```

---

### 3.5 AI Package整合性

`01_AI_Package.md`を機械証跡と一致させてください。

特に以下を是正してください。

```text
status
blocking_issues
working_tree
verification_result_hash
human_review_status
AI Confidence
Remaining Uncertainty
Human Summary
Next Action
```

AI Confidenceは次の形式にしてください。

```text
Confidence:
Grounds:
Remaining Uncertainty:
```

次のような虚偽・矛盾表現は禁止です。

```text
全検証成功（実際には未取得Gateあり）
未解決事項なし（人間確認pending）
working tree clean（未追跡・変更あり）
```

---

### 3.6 Audit Logの訂正

AIは自己承認してはいけません。

既存の`approvalStatus: approved`行はappend-onlyのため削除・書換えせず、訂正イベントを新規追記してください。

訂正イベント例：

```json
{
  "action": "CORRECTION",
  "target": "Milestone 5-A audit approval status",
  "approvalStatus": "pending_human_review",
  "result": "corrected",
  "reason": "AI cannot self-approve. Human review is pending."
}
```

今回の最終イベントも、人間承認前は必ず次としてください。

```text
approvalStatus: pending_human_review
```

---

### 3.7 stage方針

禁止：

```text
git add .
git add -A
```

stageは、最終監査後に対象ファイルを明示した個別パス指定のみ許可します。

ただし今回は、人間確認のため**stage・commit・pushを実行せず停止**してください。

---

## 4. Implementation Plan運用

今回の修正計画は、チャットへ長文で貼らず、次のMarkdownへ保存してください。

```text
docs/AI/23_Milestone_5A_Final_Correction_Implementation_Plan.md
```

Planには最低限、以下のみを記載してください。

```text
Objective
Files to Change
Mechanical Evidence Changes
Gate Logic
Tests
Human Review Points
Stop Conditions
```

チャットでは次だけ報告してください。

```text
■ Plan保存先
■ 修正対象
■ 要人間確認
```

この運用を今後の標準としてください。

---

## 5. 必須検証

修正後に以下を実行してください。

```bash
npm run ai:verify
npm run ai:precommit
node --test scripts/ai-governance/tests/*.test.mjs
node --test scripts/document-verification/tests/*.test.mjs
node scripts/document-verification/verify-career-up-form1.mjs
node scripts/document-verification/verify-hatarakikata-r8-form1.mjs
npm run build
npx eslint scripts/ai-governance/
find . -type f -name "*.docx" -not -path "./node_modules/*"
```

必要に応じて、変更ファイルlintも明示実行してください。

必須結果：

```text
Required Gates: Passed
overallResult: Passed
full repository lint: PreExistingFailed / non-blocking
changed-files lint: Success / 0 errors / 0 warnings
OutputVerifier: Success
DomSerializationVerifier: Success
AI Package consistency: Success
Audit Log validation: Success
repository DOCX: none
source hash: unchanged
```

---

## 6. 人間確認しやすい最終状態

人間側で確認しやすいよう、最終報告は次だけにしてください。

```text
■ 結論
■ Required Gates
■ Informational Gate
■ 変更ファイル
■ AI Package
■ Verification Result
■ Audit Log
■ Git状態
■ 人間確認事項
■ 次工程
```

詳細なstdout・長文説明はチャットへ貼らず、MarkdownとJSONへ残してください。

---

## 7. Git監査

最終確認として以下を実行してください。

```bash
git status --short
git diff --stat
git diff --name-only
git diff
git diff --cached --stat
git diff --cached --name-only
```

確認事項：

```text
- staged 0
- commit未実施
- push未実施
- 範囲外変更なし
- 一時ファイルなし
- 実顧客情報なし
- repository DOCXなし
- Numbering参照切れなし
- Level 4正式完了状態維持
- Milestone 5-AのRequired Gates Passed
```

---

## 8. 停止条件

以下の場合は、完了扱いにせず停止してください。

```text
- DomSerializationVerifier未取得
- Required Gate失敗
- changed-files lint error / warning
- AI PackageとVerification Result不一致
- Audit Log破壊
- AI自己承認状態が未訂正
- repository DOCX検出
- 実顧客情報検出
- 参照切れ
- Level 4回帰
- 範囲外変更
```

---

## 9. 停止地点

今回は以下の状態で停止してください。

```text
実装完了
Required Gates Passed
AI Package更新済み
Verification Result更新済み
Audit Log訂正追記済み
Git差分監査済み
staged 0
commit未実施
push未実施
人間確認待ち
```

---

## 10. 完了チェックリスト

```text
[ ] Master v4.0 read
[ ] AI Package read
[ ] Decisions read
[ ] Audit Log read
[ ] Verification Result read
[ ] Request / Plan read
[ ] Correction Plan saved as 23_*.md
[ ] Required / Informational Gate separated
[ ] Gate decision recorded in 04_Decisions.md
[ ] overallResult mechanically corrected
[ ] DomSerializationVerifier recorded
[ ] OutputVerifier recorded
[ ] changed-files lint 0
[ ] full repository lint recorded as pre-existing non-blocking
[ ] AI Package aligned with evidence
[ ] Audit correction event appended
[ ] AI self-approval corrected
[ ] ai:verify passed
[ ] ai:precommit passed
[ ] governance tests passed
[ ] Word Engine tests passed
[ ] 2 formal verify scripts passed
[ ] build passed
[ ] repository DOCX absent
[ ] source hash unchanged
[ ] Git diff audited
[ ] staged 0
[ ] commit not performed
[ ] push not performed
[ ] human review prepared
```

未達が1件でもある場合、完了と報告しないでください。
