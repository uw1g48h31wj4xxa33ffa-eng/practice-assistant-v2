# Milestone 5-B Phase 2-C 設計決議書

**決議日:** 2026-07-21
**対象:** Milestone 5-B Phase 2-C
**前提:** Phase 2-B は PR #2 により `main` へマージ済み。実装コミット `6e040bd`、マージコミット `a6d766f`。

---

## 1. 決議目的

Phase 2-Bで実装した以下の成果物を、既存のCareer-Up R8 Form1生成・検証経路へ安全に接続する。

- `ProfileResolver`
- `ExecutionContextBuilder`
- `CareerUpAdapter`
- `ProfileDrivenContextFactory`
- `ResolveRequest`
- `ExecutionContext`
- `LegacyMappingFormat`

Phase 2-Cでは、本番UI/APIへ接続する前段として、既存のWord生成・Verifier経路までを通す最小統合を行う。

---

## 2. 正式な統合対象

### 採用対象

Career-Up R8 Form1のみを対象とする。

### 採用する接続層

検証スクリプト層を採用する。

### 新規の明示的入口

以下を新規追加する。

```text
scripts/document-verification/verify-career-up-profile-driven.mjs
```

### 採用理由

- 既存legacy経路を変更せず維持できる
- UI、API、Application Serviceへ影響を与えない
- Profile-driven経路を独立して実行・検証できる
- 自動fallbackの混入を防ぎやすい
- ResolverからVerifierまでの統合不具合を局所的に切り分けられる
- Phase 2-Cの責務を最小化できる

---

## 3. 実行経路

Phase 2-Cで成立させる経路は以下とする。

```text
明示的なProfile-driven検証スクリプト
  ↓
ProfileDrivenContextFactory
  ↓
ProfileResolver
  ↓
ExecutionContextBuilder
  ↓
CareerUpAdapter
  ↓
LegacyMappingFormat
  ↓
既存Career-Up Word生成処理
  ↓
OutputVerifier
  ↓
DomSerializationVerifier
  ↓
検証結果
```

Profile解決、Context構築、Adapter変換のいずれかが失敗した場合、Word生成処理へ進んではならない。

---

## 4. Feature Activation決議

### 採用方式

明示的呼出方式を継続する。

### 決議

- Profile-driven経路は新規スクリプトからのみ明示的に開始する
- 環境変数による大域切替は採用しない
- 既存スクリプトの既定動作を変更しない
- legacy経路はdefaultのまま維持する
- Profile-driven経路失敗時にlegacy経路へ自動fallbackしない
- 実行した経路がコードとログから判別できること

### 禁止

- `USE_PROFILE_DRIVEN=1` 等による暗黙切替
- 既存スクリプト内部での見えにくい分岐
- Profile解決失敗後の静的Mapping再読込
- エラー握りつぶし
- 成功扱いへの変換

---

## 5. legacy互換性決議

以下は変更・削除・置換しない。

- `scripts/document-verification/verify-career-up-form1.mjs` の既存legacy経路
- `careerUpR8Form1Mapping`
- 既存Word生成ロジック
- 既存Verifier契約
- 既存SHA-256期待値
- manualCheck / humanReviewの既存契約

Phase 2-C完了時も、legacyスクリプトは従来どおり独立して実行・PASSできることを必須とする。

---

## 6. 実装対象

### 新規追加候補

- `scripts/document-verification/verify-career-up-profile-driven.mjs`
- `src/profiles/tests/profile-driven-career-up-integration.test.ts`
- 必要な場合のみ、Phase 2-C専用の小さな統合補助モジュール

### 変更候補

- npm scriptまたは検証ランナーへの明示的な登録
- `docs/AI/06_Verification_Result.json`（verify実行による自動更新）
- Phase 2-C実装報告Markdown

### 原則変更しない

- UI
- API Route
- `WordGenerationApplicationService`
- Application ServiceのTemplate Registry
- DTO
- Profile Schema
- Profile JSONの既存値
- Word Engine本体
- Verifier本体
- legacy Mapping

既存モジュールの小変更が不可避な場合は、理由と影響範囲を報告し、設計変更に該当する場合は実装せず停止する。

---

## 7. Profile入力決議

- `effectiveDate`はスクリプト内で明示的に固定値を渡す
- `Date.now()`、`new Date()`による現在日時の暗黙利用は禁止
- Profile ID、Profile Typeは既存Profile定義と一致する値を明示する
- Active versionが一意に解決されること
- 入力値はテストおよび実行証跡に残す

---

## 8. Adapter互換性決議

CareerUpAdapterの出力は、既存の`careerUpR8Form1Mapping`と生成処理上互換でなければならない。

最低限、以下を確認する。

- `template.id`
- `template.version`
- `template.expectedSha256`
- `fields`の構造
- `fields`の順序
- `fields`の値

必要に応じて`deepStrictEqual`相当で厳密比較する。

互換性が確認できない場合、Word生成へ進まず停止する。

---

## 9. エラー伝播決議

以下の失敗は成功扱いに変換しない。

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
- SHA-256不一致
- OutputVerifier失敗
- DomSerializationVerifier失敗

### 停止順序

```text
Profile解決失敗
  → Context生成禁止
  → Adapter呼出禁止
  → Word生成禁止

Context生成失敗
  → Adapter呼出禁止
  → Word生成禁止

Adapter変換失敗・互換性不一致
  → Word生成禁止

Word生成後のVerifier失敗
  → 検証失敗として終了
  → 成功扱い禁止
```

---

## 10. 必須テスト

最低限、以下を実装する。

1. 正常なProfile-driven経路でCareer-Up Mappingを生成できる
2. Profile-driven Mappingがlegacy Mappingと厳密に互換である
3. Profile-driven MappingでWord生成が成功する
4. OutputVerifierがPASSする
5. DomSerializationVerifierがPASSする
6. Profile不足時にWord生成関数が呼ばれない
7. 型不一致時にWord生成関数が呼ばれない
8. Dependency解決失敗が上位へ伝播する
9. 自動fallbackが発生しない
10. legacy検証スクリプトが従来どおりPASSする
11. 同一入力で同一Profile version・同一Mappingが得られる
12. 実行経路がProfile-drivenであることを証跡で確認できる

既存テストの期待値変更による見かけ上のPASSは禁止する。

---

## 11. Git・ブランチ決議

Phase 2-Bの旧ローカルブランチ上で作業を継続しない。

実装開始前に以下を行う。

```text
mainへ切替
→ originをfetch
→ mainをorigin/mainへfast-forward更新
→ Phase 2-C専用ブランチを新規作成
```

ブランチ名：

```text
feature/milestone-5b-phase2c-career-up-integration
```

ローカルに未承認差分がある場合、勝手に破棄・stash・上書きせず停止する。

---

## 12. 検証ゲート

実装後、最低限以下を実行する。

- Phase 2-C統合テスト
- 既存profilesテスト
- 既存Career-Up legacy検証
- 新規Profile-driven Career-Up検証
- `npm run lint`
- `npm run build`
- `npm run ai:verify`
- `git diff --check`
- `git status -sb`
- `git diff --stat`
- `git diff --name-only`

各コマンドについて、command、exit code、重要stdout、件数を報告する。

---

## 13. 禁止事項

- UI変更
- API変更
- Application Service接続
- Template RegistryへのCareer-Up登録
- legacy経路削除・置換
- Profile JSONの独断変更
- Schema変更
- DTO変更
- Verifier仕様変更
- SHA-256期待値変更
- manualCheck解除
- humanReview契約変更
- 環境変数による切替
- 自動fallback
- エラー握りつぶし
- 無関係リファクタリング
- 指示範囲外の実装
- `git add`
- `git commit`
- `git push`
- PR作成

---

## 14. 停止条件

以下の場合は、実装を続行せず停止して報告する。

- mainを安全に最新化できない
- 作業ツリーに未承認差分がある
- Phase 2-B成果物がmainに存在しない
- Profile IDまたは参照関係が一意に特定できない
- Adapter出力がlegacy Mappingと一致しない
- Word生成処理の再利用に本体変更が必要
- Verifier接続に仕様変更が必要
- 既存legacy経路が回帰する
- Profile解決失敗後に処理が継続する
- 自動fallbackが必要になる
- 正本文書間に矛盾がある
- UI/API/DTO変更が不可避になる
- SHA-256期待値変更が必要になる

---

## 15. 完了条件

以下をすべて満たした場合のみPhase 2-C完了候補とする。

- Career-Up R8 Form1のProfile-driven明示的入口が存在する
- Resolver → Context → Adapter → Word生成 → Verifierが接続されている
- Profile-driven経路でWord生成が成功する
- OutputVerifierがPASSする
- DomSerializationVerifierがPASSする
- Profile解決失敗時にWord生成へ進まない
- 自動fallbackがない
- legacy経路が従来どおりPASSする
- lint、build、ai:verify、diff checkがPASSする
- 対象外差分がない
- 未stage、未commit、未pushで人間レビュー待ちとなっている
