# 41_Gemini_Milestone5B_Phase2C_Implementation_Instruction

## 目的

`40_Milestone5B_Phase2C_Design_Decision.md` に従い、Career-Up R8 Form1について、Phase 2-BのProfile-driven基盤を既存Word生成・Verifier経路へ最小統合してください。

安全性が保たれる範囲で、状態確認、設計確認、実装、テスト、lint、build、verify、差分監査、完了報告まで一回で完了してください。

Gitのstage、commit、push、PR作成は行わず停止してください。

---

## 最優先ルール

- 身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。
- 推定、独自判断、勝手な仕様変更、指示範囲外の実装を禁止します。
- エラーを握りつぶさないでください。
- 未確認事項を断定しないでください。
- 既存legacy経路を削除、置換、破壊しないでください。
- 不具合・副作用防止を最優先にしてください。
- テスト期待値を実装に合わせて安易に変更しないでください。
- SHA-256期待値、manualCheck、humanReview契約を変更しないでください。
- 自動fallbackを実装しないでください。
- 重大な設計変更が必要になった場合は、実装せず停止してください。

---

## 必ず読む文書

最低限、以下を読んでください。

- `docs/AI/34_Milestone5B_Phase2B_Design_Decision.md`
- `docs/AI/36_Phase2B_Implementation_Report.md`
- `docs/AI/37_Gemini_Milestone5B_Phase2B_ReviewFix.md`
- `docs/AI/38_Claude_Milestone5B_Phase2B_DateImmutability_DesignAudit.md`
- `docs/AI/39_Gemini_Milestone5B_Phase2C_PreImplementation_Investigation.md`
- `docs/AI/40_Milestone5B_Phase2C_Design_Decision.md`
- 関連する最新の正本Markdown

正本間に矛盾がある場合、最新の人間承認済み設計決議を優先し、それでも解消できなければ停止してください。

---

## Gate 1: 開始状態確認

最初に以下を確認してください。

1. 現在のブランチ
2. 作業ツリーがクリーンか
3. `origin/main`の状態
4. PR #2のマージコミット`a6d766f`がmainに存在するか
5. Phase 2-B実装コミット`6e040bd`の内容がmainに取り込まれているか
6. Phase 2-B成果物が存在するか

### 必須ブランチ手順

作業ツリーがクリーンな場合のみ、以下を実施してください。

```bash
git switch main
git fetch origin
git pull --ff-only origin main
git switch -c feature/milestone-5b-phase2c-career-up-integration
```

既に同名ブランチが存在する場合、勝手に削除・上書きせず状態を確認し、安全に継続できなければ停止してください。

未承認差分がある場合、破棄・stash・resetをせず停止してください。

---

## Gate 2: 実装前再確認

コード変更前に、以下を再確認してください。

- 既存legacy検証入口
- Profile-driven公開API
- CareerUpAdapterの入力・出力
- Profile ID、Profile Type、effectiveDate
- Word生成処理の再利用可能箇所
- OutputVerifier接続箇所
- DomSerializationVerifier接続箇所
- 既存SHA-256契約
- manualCheck / humanReview契約

設計決議書と一致しない事実を発見した場合、実装せず停止してください。

---

## Gate 3: 実装

### 3.1 新規Profile-driven検証入口

原則として以下を新規作成してください。

```text
scripts/document-verification/verify-career-up-profile-driven.mjs
```

このスクリプトは、明示的に以下の経路を実行してください。

```text
ProfileDrivenContextFactory
→ ProfileResolver
→ ExecutionContextBuilder
→ CareerUpAdapter
→ LegacyMappingFormat
→ 既存Career-Up Word生成処理
→ OutputVerifier
→ DomSerializationVerifier
```

### 3.2 legacy経路

以下は原則変更しないでください。

```text
scripts/document-verification/verify-career-up-form1.mjs
```

重複コードを避けるために既存処理の小さな抽出が必要な場合は、legacy挙動、出力、Verifier結果を変えないことを証明してください。

大規模リファクタリングは禁止です。

### 3.3 effectiveDate

- 明示的な固定Dateを渡してください
- `Date.now()`は禁止です
- 現在日時の暗黙利用は禁止です
- UTC基準にしてください
- 実行証跡に値を出してください

### 3.4 Adapter互換性

Word生成前に、Profile-driven Mappingが既存`careerUpR8Form1Mapping`と互換であることを確認してください。

最低限、以下を比較してください。

- `template.id`
- `template.version`
- `template.expectedSha256`
- `fields`

可能な限り厳密比較を行ってください。

不一致の場合、Word生成へ進まず失敗させてください。

### 3.5 エラー停止

以下の場合、Word生成処理が呼ばれない構造にしてください。

- Profile未存在
- Invalid Date
- Active versionなし
- Ambiguous Resolution
- Type Mismatch
- Dependency解決失敗
- Circular Reference
- ExecutionContext構築失敗
- Adapter変換失敗
- Mapping互換性不一致

legacy Mappingへの自動fallbackは禁止です。

---

## Gate 4: テスト

必要な統合テストを追加してください。

推奨ファイル名：

```text
src/profiles/tests/profile-driven-career-up-integration.test.ts
```

最低限、以下を検証してください。

1. 正常なProfile-driven経路でContextを構築できる
2. CareerUpAdapter出力がlegacy Mappingと厳密に互換である
3. Profile-driven MappingでWord生成経路へ進める
4. OutputVerifierがPASSする
5. DomSerializationVerifierがPASSする
6. Profile不足時にWord生成へ進まない
7. 型不一致時にWord生成へ進まない
8. dependency失敗が上位へ伝播する
9. 自動fallbackが発生しない
10. legacy検証経路が従来どおりPASSする
11. 同一入力で同一versionとMappingが得られる
12. Profile-driven経路が明示的に呼ばれたことを確認できる

テストダブルを使う場合、内部private状態を不正に書き換えず、公開契約または安全なFakeを使用してください。

---

## Gate 5: 検証

最低限、以下を実行してください。

```bash
npx tsx --test src/profiles/tests/*.test.ts
```

既存Career-Up legacy検証コマンドを特定して実行してください。

新規Profile-driven検証スクリプトを実行してください。

続けて以下を実行してください。

```bash
npm run lint
npm run build
npm run ai:verify
git diff --check
```

可能であれば、変更ファイル限定lintも実行してください。

Verifierの出力ファイルまたは結果JSONを読み、単にexit codeだけでなく、以下を確認してください。

- Overall Result
- Required Gates
- OutputVerifier結果
- DomSerializationVerifier結果
- manualCheck / humanReviewの扱い
- SHA-256結果

---

## Gate 6: 差分監査

以下を実行してください。

```bash
git status -sb
git diff --stat
git diff --name-only
git diff --check
```

未追跡ファイルを含む全変更を確認してください。

次を監査してください。

- 対象外ファイルがない
- legacy Mappingを変更していない
- SHA-256期待値を変更していない
- manualCheckを解除していない
- humanReview契約を変更していない
- UI/API/Application Serviceを変更していない
- Profile JSONを独断変更していない
- debug出力、TODO、秘密情報がない
- 自動fallbackがない
- エラー握りつぶしがない

---

## Gate 7: 実装報告

以下の順で報告してください。

### A. 開始状態

- branch
- HEAD
- origin/main
- ahead/behind
- working tree

### B. 参照文書

- 読んだ正本文書一覧
- 適用した設計決議

### C. 実装内容

- 変更・追加ファイル一覧
- 各ファイルの責務
- 実行経路
- effectiveDate
- Profile ID / Type / version
- legacy互換性の維持方法
- 自動fallbackがないこと

### D. テスト結果

各コマンドについて、以下を記載してください。

- command
- exit code
- tests件数
- pass / fail / skip
- 重要stdout

### E. Verifier結果

- OutputVerifier
- DomSerializationVerifier
- SHA-256
- manualCheck
- humanReview
- overall result

### F. 差分監査

- `git status -sb`
- `git diff --stat`
- `git diff --name-only`
- 未追跡ファイル一覧
- 対象外差分の有無

### G. 最終判定

- Phase 2-C完了候補か
- 停止条件の該当有無
- 残課題
- 人間レビューが必要な点

---

## 禁止事項

- UI変更
- API Route変更
- `WordGenerationApplicationService`変更
- Template RegistryへのCareer-Up登録
- legacy経路削除・置換
- 環境変数による切替
- Profile JSONの独断変更
- Schema変更
- DTO変更
- Verifier仕様変更
- SHA-256期待値変更
- manualCheck解除
- humanReview契約変更
- 自動fallback
- エラー握りつぶし
- 無関係リファクタリング
- 既存テスト期待値の安易な変更
- `git add`
- `git commit`
- `git push`
- PR作成

---

## 停止条件

以下の場合、独断で回避せず停止して報告してください。

- mainを安全に最新化できない
- 作業ツリーに未承認差分がある
- Phase 2-B成果物がmainにない
- 正本間に矛盾がある
- Profile IDまたは依存関係が特定できない
- CareerUpAdapter出力がlegacy Mappingと一致しない
- Word生成処理の再利用に本体改修が必要
- Verifier仕様変更が必要
- UI/API/DTO変更が必要
- legacy経路が回帰する
- Profile解決失敗後も生成処理が開始される
- 自動fallbackが必要になる
- SHA-256期待値変更が必要になる
- manualCheck解除が必要になる
- 指示範囲を超える設計変更が必要になる

---

## Git停止位置

実装・検証・差分監査・報告まで完了したら、以下の状態で停止してください。

```text
未stage
未commit
未push
PR未作成
```

人間のレビューと明示承認を待ってください。
