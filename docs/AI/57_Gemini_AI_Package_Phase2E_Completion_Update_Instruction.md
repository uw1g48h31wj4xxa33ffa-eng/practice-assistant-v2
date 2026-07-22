# Gemini指示書：AI_PackageへPhase 2-E完了を反映

## 目的
Milestone 5-B / Phase 2-Eの共通Profile Verification Runner実装について、監査指摘F1〜F6の修正完了を`docs/AI/01_AI_Package.md`へ正確に反映してください。本作業はドキュメント更新のみです。

## 最重要ルール
身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

- AI_Package以外を変更しないでください。
- Phase 2-Fの設計・実装は開始しないでください。
- 既存履歴や決定事項を削除しないでください。
- `git add .`、`git add -A`は禁止です。
- 予期しない差分や検証失敗時はcommit・pushせず停止してください。

## 対象ブランチ
`feature/milestone-5b-phase2c-career-up-integration`

## 期待HEAD
`c23e50434470f53a4f2bef0aa3d575b4696cc507`

## 事前確認
```bash
git branch --show-current
git status -sb
git log -5 --oneline
git rev-parse HEAD
```

対象ブランチ、working tree clean、期待HEAD一致を確認してください。一致しない場合は停止してください。

## 必読資料
```text
docs/AI/01_AI_Package.md
docs/AI/53_Claude_Milestone5B_Phase2E_Architecture_Audit.md
docs/AI/54_Gemini_Milestone5B_Phase2E_Common_Runner_Implementation_Instruction.md
docs/AI/55_Claude_Milestone5B_Phase2E_Implementation_Audit.md
docs/AI/56_Gemini_Milestone5B_Phase2E_Audit_Followup_Instruction.md
```

## 更新対象
```text
docs/AI/01_AI_Package.md
```

## 反映する確定事項

### 正式状態
```text
Phase 2-E: 完了
Phase 2-F: 未着手
```

### 実装commit
```text
c23e50434470f53a4f2bef0aa3d575b4696cc507
```

### 監査commit
```text
ceb74c01c4d636c080cc92fc6edee849f2e5efc7
```

### アーキテクチャ監査commit
```text
0d30ffe
```

### 共通Runner
```text
src/profiles/runner/profile-verification-runner.ts
```

### Runner形態
```ts
new ProfileVerificationRunner(dependencies).run(config)
```

### Dependencies
```text
registry
startWordGeneration
runVerifier
```

### Execution Config
```text
formProfileId
mappingProfileId
effectiveDate
inputData
outputPath
```

### 必須契約
- `runVerifier`は必須依存
- Word生成後にVerifierを必ず実行
- `startWordGeneration`は`inputsToFill`を返す
- `inputsToFill`をVerifierへ伝播
- `manualCheck` / `humanReview`はsuccess-with-reviewとして返却
- Coreはthrow、CLI境界でResult変換
- legacy fallbackなし
- 共通RunnerのCareer-up固有依存0件
- Career-up固有wrapperは共通Runnerを呼ぶ薄い構造
- legacy runnerは変更なし

### Claude監査結果
```text
条件付き承認
Critical: 0
High: 0
Medium: 2
Low: 4
```

その後、F1〜F6を修正し、Phase 2-E完了条件を満たしたことを記録してください。

### F1〜F6解消内容
- FormProfile未登録テストとMappingProfile未登録テストを分離
- `templateHash`未定義時に`FORM_PROFILE_INVALID`
- 実hash不一致時のみ`TEMPLATE_HASH_MISMATCH`
- trailing whitespace除去
- `manualCheck=false` / `humanReview=false`テスト追加
- 共通Runner内コメントを汎用化

### 最終検証結果
```text
Runner単体テスト: 9件 PASS
Career-up統合テスト: 7件 PASS
Profile全テスト: 57件 PASS
legacy verification: PASS（18シナリオ）
profile-driven verification: PASS（18シナリオ）
ai:verify: PASS
build: PASS
対象限定lint: 0 errors / 0 warnings
全体lint: 56 errors / 23 warnings（既存baseline、非悪化）
git diff --check: PASS
legacy fallback: 0回
working tree: clean
push: 成功
```

## frontmatter
既存frontmatterに`head`がある場合は、次へ更新してください。

```text
c23e50434470f53a4f2bef0aa3d575b4696cc507
```

`head`はAI_Packageが表す実装commitを指す既存運用に従い、今回の文書更新commitへ変更しないでください。

## 実装履歴
既存形式に合わせて、Phase 2-Eの実装・監査・F1〜F6修正を記録してください。Phase 2-E本体実装commitは`git log`と既存文書から正確に特定し、推測しないでください。

最低限、次を記録してください。

```text
0d30ffe
docs: audit phase 2e profile verification architecture

ceb74c01c4d636c080cc92fc6edee849f2e5efc7
docs: audit phase 2e common runner implementation

c23e50434470f53a4f2bef0aa3d575b4696cc507
fix: resolve phase 2e audit findings
```

## 次工程
```text
Phase 2-F開始準備
```

Phase 2-Fの詳細設計や実装内容は追加しないでください。

## 禁止事項
- Phase 2-Fを開始済み・完了と記載
- S1 JSON Single Sourceを実装済みと記載
- UI/API接続を実装済みと記載
- legacy fallbackを許容する記載
- Claude監査結果やcommit hashの改変
- AI_Package以外の編集
- 無関係な整形や見出し構造の全面変更

## 差分確認
```bash
git diff --check
git status -sb
git diff --stat
git diff --name-only
git diff -- docs/AI/01_AI_Package.md
```

変更ファイルがAI_Packageだけであり、Phase 2-E完了、Phase 2-F未着手、frontmatter、commit hash、F1〜F6解消、検証結果が正しいことを確認してください。

## 検証
```bash
npm run ai:verify
git diff --check
```

`docs/AI/06_Verification_Result.json`が変更された場合、今回の成果物でなければ元に戻してください。

## Git操作
全検証通過後のみ実施してください。

```bash
git add docs/AI/01_AI_Package.md
git diff --cached --check
git diff --cached --stat
git diff --cached --name-only
git diff --cached -- docs/AI/01_AI_Package.md
git commit -m "docs: record phase 2e completion"
git push origin feature/milestone-5b-phase2c-career-up-integration
git status -sb
git log -2 --oneline
git rev-parse HEAD
```

## 完了条件
- AI_Packageのみ変更
- frontmatter `head`が`c23e50434470f53a4f2bef0aa3d575b4696cc507`
- Phase 2-E完了
- Phase 2-F未着手
- 共通Runner構造、Verifier必須、`inputsToFill`伝播、reviewフラグ、legacy fallback 0を正確に記録
- Claude監査とF1〜F6修正履歴を記録
- 最終検証結果を記録
- `git diff --check` PASS
- `ai:verify` PASS
- 対象限定commit・push
- working tree clean

## 停止条件
対象branch・期待HEAD・clean状態の不一致、資料不足、AI_Package以外の変更必要、履歴矛盾、`git diff --check`または`ai:verify`失敗、予期しない差分発生時はcommit・pushせず停止してください。

## 完了報告
1. 更新ファイル
2. frontmatter `head`
3. Phase 2-E状態
4. Phase 2-F状態
5. Phase 2-E本体実装commit
6. 監査commit
7. F1〜F6修正commit
8. 共通Runner記録内容
9. Verifier・`inputsToFill`・reviewフラグ記録
10. legacy fallback / Career-up固有依存記録
11. 最終テスト件数
12. ai:verify結果
13. git diff --check結果
14. commit hash
15. push結果
16. 最終git status
17. 次工程
