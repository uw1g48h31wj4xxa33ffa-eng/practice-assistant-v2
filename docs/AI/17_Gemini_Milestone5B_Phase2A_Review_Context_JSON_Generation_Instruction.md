# Gemini向け Phase 2-A Review Context JSON生成指示書

## 1. 目的

Milestone 5-B Phase 2-AのCopilot Commit前レビューに必要な情報を、単一のReview Context JSONへ集約してください。

この作業はレビュー用コンテキスト生成のみを目的とします。

## 2. 実施対象

以下を確認し、Review Context JSONへ整理してください。

- Phase 2-Aの変更ファイル一覧
- `git diff`
- `git diff --stat`
- `git status --short`
- 実装概要
- Loaderの責務
- 参照検証仕様
- 型・Schema変更
- Registry・Version Registry変更
- テスト追加・変更内容
- テスト結果
- `npm run ai:verify`結果
- `npm run build`結果
- changed-files lint結果
- `git diff --check`結果
- 既存Lintエラーとの切り分け
- 後方互換性
- 未解決事項
- 既知の制約
- Stop Condition判定
- Commit可否
- Phase 2-B開始可否

## 3. 必須参照文書

以下を最初から最後まで確認してください。

- `docs/AI/00_AI_Collaboration_Policy_and_Operating_History.json`
- `docs/AI/12_Milestone5B_Phase2_Design_Scope_Stop_Conditions.md`
- `docs/AI/13_Milestone5B_Phase2_PreImplementation_Research.md`
- `docs/AI/15_Gemini_Milestone5B_Phase2A_Profile_Loader_Implementation_Instruction.md`
- `docs/AI/15_Milestone5B_Phase2A_Profile_Loader_Implementation_Report.md`

## 4. 実行コマンド

必要に応じて、少なくとも以下を再実行または確認してください。

```bash
git status --short
git diff --stat
git diff --name-only
git diff
git diff --check
npx tsx --test src/profiles/tests/profile-loader.test.ts
npm run build
npm run ai:verify
```

changed-files lintについては、今回変更した対象ファイルのみを指定して実行してください。

既存のリポジトリ全体Lintエラーは今回の失敗として扱わず、今回変更ファイル由来の新規エラー・警告のみを明示してください。

## 5. 出力先

以下へJSON形式で保存してください。

`docs/AI/16_Milestone5B_Phase2A_Review_Context.json`

## 6. 必須JSON構造

以下のトップレベルキーを必ず含めてください。

```json
{
  "metadata": {},
  "scope": {},
  "changedFiles": [],
  "implementationSummary": {},
  "diffSummary": {},
  "loaderResponsibility": {},
  "referenceValidation": {},
  "typeAndSchemaChanges": {},
  "registryChanges": {},
  "tests": {},
  "verification": {},
  "lint": {},
  "backwardCompatibility": {},
  "knownConstraints": [],
  "unresolvedIssues": [],
  "stopCondition": {},
  "commitReadiness": {},
  "phase2BReadiness": {},
  "evidence": []
}
```

## 7. Evidence要件

`evidence`には、各検証について以下を記録してください。

- command
- executedAt
- exitCode
- result
- relevantOutput
- affectedFiles

実行していないコマンドを成功扱いしないでください。

結果が不明な場合は、`unknown`または`not_executed`と明示してください。

## 8. Git差分の扱い

Review Context JSONには以下を含めてください。

- 変更ファイルの相対パス
- 新規／変更／削除の区分
- 各ファイルの変更目的
- Scope内／Scope外の判定
- `git diff --stat`の要約
- 重要差分の説明

ただし、巨大なdiff全文をそのままJSONへ埋め込まないでください。

Copilotがレビューできるよう、重要な変更点を正確に要約してください。

## 9. 判定ルール

### Commit可

以下をすべて満たす場合のみ可としてください。

- Phase 2-AのScope内
- BLOCKERなし
- 未解決MAJORなし
- 必須テスト成功
- build成功
- `npm run ai:verify`成功
- changed-files lint成功
- `git diff --check`成功
- 新規Lintエラーなし
- 後方互換性に重大な問題なし
- Stop Condition非該当

### Commit不可

以下のいずれかに該当する場合は不可としてください。

- Scope逸脱
- 必須検証失敗
- 新規Lintエラー
- 破壊的変更
- Registry破損リスク
- LoaderとResolverの責務混在
- Stop Condition該当
- 未確認事項を推測しなければ判定できない

## 10. 禁止事項

- ソースコードを変更しない
- テストコードを変更しない
- 既存仕様を変更しない
- Commitしない
- Pushしない
- PRを作成しない
- 無関係なファイルをstageしない
- 実行していない検証を成功扱いしない
- 既存Lintエラーを今回変更によるエラーと混同しない

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

## 11. 停止条件

以下に該当した場合は停止してください。

- 必須参照文書が存在しない
- Phase 2-A実装報告と実際の差分が一致しない
- Scope外変更を検出した
- 必須検証を実行できない
- Git状態が不明確
- Review Contextへ正確な根拠を記録できない

停止時は、理由、根拠、不足情報、必要な人間判断を報告してください。

## 12. ユーザー向け完了報告

- Review Context JSON：作成済／停止
- 出力先
- 必須入力：充足／不足
- テスト：成功／失敗／未実行
- build：成功／失敗／未実行
- ai:verify：成功／失敗／未実行
- changed-files lint：成功／失敗／未実行
- git diff --check：成功／失敗／未実行
- 新規Lintエラー：有／無／不明
- Stop Condition：該当／非該当
- Commit可否：可／不可／不明
- Phase 2-B開始可否：可／不可／条件付き／不明
