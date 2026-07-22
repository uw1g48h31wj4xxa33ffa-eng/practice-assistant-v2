# Gemini実装指示書：Milestone 5-B / Phase 2-E 共通Profile Verification Runner Core実装

## 目的

Milestone 5-B / Phase 2-Eとして、Claude監査で条件付き承認された設計に基づき、共通Profile Verification Runner Coreを最小範囲で実装してください。

本Phaseでは、以下のみを実施します。

1. 共通Runner Coreの新規追加
2. Career-up Profile-driven Runnerの薄いwrapper化
3. 共通Runner単体テストの追加
4. 既存Career-up統合テストの維持・接続
5. 全検証・証跡・commit・push

新規様式追加、単一正本化、Mapping Definition Registry導入、legacy経路変更は実施しません。

---

## 最重要ルール

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

- 実装範囲を勝手に拡張しないでください。
- legacy runnerを変更しないでください。
- legacy mappingを変更しないでください。
- `career-up-r8-form1-fields.json`を変更しないでください。
- Mapping Definition Registryを実装しないでください。
- Profile JSON正本化・legacy mapping生成を実装しないでください。
- UI/API/Practice Assistant V2画面接続を変更しないでください。
- 自動legacy fallbackを追加しないでください。
- Verifierを任意化しないでください。
- Verifier省略経路を作らないでください。
- manualCheck / humanReviewをsystem errorとしてthrowしないでください。
- 既存期待値を実装都合で変更しないでください。
- テストを削除・skip・only化しないでください。
- エラーを握りつぶさないでください。
- 既存lint baselineを悪化させないでください。
- 予期しない差分が発生した場合はcommit・pushせず停止してください。

---

## 対象ブランチ

```text
feature/milestone-5b-phase2c-career-up-integration
```

## 期待HEAD

```text
0d30ffe docs: audit phase 2e profile verification architecture
```

完全hashは実際の`git rev-parse HEAD`結果を使用してください。

---

## 事前確認

最初に以下を実行してください。

```bash
git branch --show-current
git status -sb
git log -5 --oneline
git rev-parse HEAD
```

確認事項：

- 対象ブランチであること
- working treeがcleanであること
- HEADがClaude監査commitであること

異なる場合は停止してください。

---

## 必読資料

以下を必ず確認してください。

```text
docs/AI/01_AI_Package.md
docs/AI/52_Gemini_Milestone5B_Phase2E_Architecture_Design.md
docs/AI/53_Claude_Milestone5B_Phase2E_Architecture_Audit.md
```

## 必読コード

```text
scripts/document-verification/verify-career-up-profile-driven.mjs
scripts/document-verification/verify-career-up-form1.mjs
scripts/document-verification/config/career-up-r8-form1.mapping.mjs
scripts/document-verification/config/career-up-r8-form1-fields.json

src/profiles/types/form-profile.ts
src/profiles/types/mapping-profile.ts
src/profiles/types/execution-context.ts
src/profiles/registry/profile-registry.ts
src/profiles/resolution/profile-resolver.ts
src/profiles/resolution/adapter.ts
src/profiles/resolution/execution-context-builder.ts

src/profiles/tests/profile-driven-career-up-integration.test.ts

scripts/document-verification/core/dom-serialization-verifier.mjs
```

存在する場合は以下も確認してください。

```text
OutputVerifier
GenerationResultDTO
Template Registry
Word generation entrypoint
```

---

# 実装範囲

## 新規追加

```text
src/profiles/runner/profile-verification-runner.ts
src/profiles/tests/profile-verification-runner.test.ts
```

## 変更許可

```text
scripts/document-verification/verify-career-up-profile-driven.mjs
src/profiles/tests/profile-driven-career-up-integration.test.ts
```

必要な場合のみ、既存export経路のため以下を変更可能とします。

```text
src/profiles/index.ts
```

ただし、存在しない場合や不要な場合は作成・変更しないでください。

## 変更禁止

```text
scripts/document-verification/verify-career-up-form1.mjs
scripts/document-verification/config/career-up-r8-form1.mapping.mjs
scripts/document-verification/config/career-up-r8-form1-fields.json

src/profiles/registry/profile-registry.ts
src/profiles/resolution/profile-resolver.ts
src/profiles/resolution/adapter.ts
src/profiles/resolution/execution-context-builder.ts

既存Verifier Core
既存Word生成Core
既存template
UI
API
Practice Assistant V2画面
```

---

# 確定設計

## Runner形態

Claude監査に従い、クラス方式を採用してください。

```ts
class ProfileVerificationRunner {
  constructor(dependencies: ProfileVerificationDependencies);

  run(
    config: ProfileVerificationExecutionConfig
  ): Promise<ProfileVerificationResult>;
}
```

## DependenciesとExecution Configを分離

以下の責務分離を必ず守ってください。

### Dependencies

実行環境・差替え対象・副作用を持つ依存。

```ts
type ProfileVerificationDependencies = {
  registry: ProfileRegistry;
  startWordGeneration: (
    context: ExecutionContext,
    inputData: Record<string, unknown>,
    outputPath: string
  ) => Promise<{
    inputsToFill: Record<string, unknown>;
  }>;
  runVerifier: (
    context: ExecutionContext,
    outputPath: string,
    inputsToFill: Record<string, unknown>
  ) => Promise<ProfileVerificationEvidence>;
};
```

実コードに合わせて引数型は調整して構いません。

ただし以下は必須です。

- `registry`はDependencies側
- `startWordGeneration`はDependencies側
- `runVerifier`はDependencies側
- `runVerifier`は必須
- `startWordGeneration`は`inputsToFill`相当を返す
- `Promise<void>`は禁止
- Configへ依存オブジェクトを混在させない

### Execution Config

1回の実行入力。

```ts
type ProfileVerificationExecutionConfig = {
  formProfileId: string;
  mappingProfileId: string;
  effectiveDate: Date;
  inputData: Record<string, unknown>;
  outputPath: string;
};
```

実コードに合わせ、命名は調整可能です。

ただし以下を守ってください。

- Registry解決対象IDを明示
- effectiveDateを明示
- inputDataを明示
- outputPathを明示
- `templatePath`を重複指定しない
- templateはFormProfile / ExecutionContextから解決
- adapterを呼び出し元から直接指定しない

---

# 実行順序

共通Runnerは最低限、次の順序を守ってください。

```text
1. Config検証
2. FormProfile解決
3. MappingProfile解決
4. Profile整合性検証
5. Adapter解決
6. Adapter実行
7. ExecutionContext生成
8. template reference解決
9. template存在・hash検証
10. Word生成
11. inputsToFill取得
12. 必須Verifier実行
13. manualCheck / humanReviewを含むResult返却
```

既存実装で順序が異なる場合は、既存安全性を維持しつつ必要最小限に合わせてください。

---

# エラー方針

## Core

Claude監査に従い、Coreは致命的エラーをthrowしてください。

最低限、以下を識別可能にしてください。

```text
FORM_PROFILE_NOT_FOUND
MAPPING_PROFILE_NOT_FOUND
PROFILE_VALIDATION_FAILED
ADAPTER_RESOLUTION_FAILED
ADAPTER_EXECUTION_FAILED
TEMPLATE_NOT_FOUND
TEMPLATE_HASH_MISMATCH
WORD_GENERATION_FAILED
VERIFICATION_FAILED
OUTPUT_INVALID
```

既存エラー型がある場合は再利用してください。

新しいエラー型を作る場合は、過剰な階層化を避け、最低限以下を持たせてください。

```ts
type ProfileVerificationErrorCode =
  | "FORM_PROFILE_NOT_FOUND"
  | "MAPPING_PROFILE_NOT_FOUND"
  | "PROFILE_VALIDATION_FAILED"
  | "ADAPTER_RESOLUTION_FAILED"
  | "ADAPTER_EXECUTION_FAILED"
  | "TEMPLATE_NOT_FOUND"
  | "TEMPLATE_HASH_MISMATCH"
  | "WORD_GENERATION_FAILED"
  | "VERIFICATION_FAILED"
  | "OUTPUT_INVALID";
```

## Boundary

`verify-career-up-profile-driven.mjs`側で必要に応じてcatchし、既存CLI挙動を維持してください。

## manualCheck / humanReview

以下はthrowしないでください。

```text
manualCheck
humanReview
```

success-with-reviewとしてResultへ含めてください。

---

# Result型

最低限、次を返してください。

```ts
type ProfileVerificationResult = {
  success: true;
  formProfileId: string;
  mappingProfileId: string;
  outputPath: string;
  verification: ProfileVerificationEvidence;
  manualCheck: boolean;
  humanReview: boolean;
};
```

既存Verifier結果に合わせて調整可能です。

ただし以下を守ってください。

- Verifier結果を保持
- manualCheckを保持
- humanReviewを保持
- outputPathを保持
- 成功時にVerifier未実行を許さない
- 成功時にverification欠落を許さない

致命的エラー時はCoreがthrowするため、`success: false`はPhase 2-Eでは必須ではありません。

---

# Verifier要件

## 必須

`runVerifier`は必須依存です。

以下は禁止です。

```ts
runVerifier?: ...
```

以下の実行経路を作らないでください。

```text
Verifier未指定
↓
Word生成のみ成功
↓
success返却
```

## 責務

Claude監査の整理を反映してください。

- DomSerializationVerifier：既存Word生成処理内の責務を維持
- OutputVerifier：共通Runnerから必須依存として実行
- Phase 2-Eで既存Verifier Coreの責務移動はしない

---

# Career-up Wrapper化

`scripts/document-verification/verify-career-up-profile-driven.mjs`を、共通Runnerを組み立てて呼び出す薄いwrapperへ変更してください。

wrapper側に残してよいもの：

```text
Career-up固有Profile登録
Career-up固有sample input
Career-up固有output path
Career-up固有Word生成adapter
Career-up固有Verifier adapter
CLI表示
CLI exit code
```

共通Runnerへ移すもの：

```text
Profile解決オーケストレーション
ExecutionContext構築
Word生成呼出し制御
Verifier必須実行制御
Result集約
```

## legacy経路禁止

以下を絶対に追加しないでください。

```text
try profile-driven
catch
legacy runner実行
```

legacy fallbackは常に0回である必要があります。

---

# 単体テスト

新規作成：

```text
src/profiles/tests/profile-verification-runner.test.ts
```

最低限、以下を実装してください。

## P0

1. 正常系
   - Word生成1回
   - Verifier1回
   - success result
   - manualCheck / humanReview伝播

2. FormProfile未登録
   - throw
   - Word生成0回
   - Verifier0回

3. MappingProfile未登録
   - throw
   - Word生成0回
   - Verifier0回

4. Profile validation失敗
   - Word生成0回
   - Verifier0回

5. Adapter解決失敗
   - Word生成0回
   - Verifier0回

6. Adapter実行失敗
   - Word生成0回
   - Verifier0回

7. template未存在
   - Word生成0回
   - Verifier0回

8. template hash不一致
   - Word生成0回
   - Verifier0回

9. Word生成失敗
   - Verifier0回
   - error code維持

10. Verifier失敗
    - Word生成1回
    - Verifier1回
    - successを返さない

11. Verifier必須
    - verifier省略可能な型・実行経路が存在しないこと

12. legacy fallback 0回
    - legacy runnerまたはlegacy mappingへのimport/callがないこと

13. manualCheck
    - throwしない
    - result flag true

14. humanReview
    - throwしない
    - result flag true

## P1

15. effectiveDate不一致
16. deterministic result
17. concurrent executionで状態混線なし
18. dependency差替え
19. outputPath伝播
20. inputsToFillがVerifierへ渡る

---

# 統合テスト

既存：

```text
src/profiles/tests/profile-driven-career-up-integration.test.ts
```

以下を維持してください。

- 既存48件全PASS
- Career-up Profile-driven結果の互換性
- field JSONとlegacy mappingのdrift検出
- legacy fallbackなし
- Word出力互換性
- Profile解決互換性

既存期待値を変更して通すことは禁止です。

必要最小限の変更だけで共通Runnerへ接続してください。

---

# 静的差分監査

以下を確認してください。

```bash
git diff --name-only
git diff --stat
git diff
```

以下の禁止importが新規Runnerに存在しないことを確認してください。

```text
verify-career-up-form1.mjs
career-up-r8-form1.mapping.mjs
career-up-r8-form1-fields.json
```

共通RunnerはCareer-up固有ファイルをimportしてはいけません。

例：

```bash
grep -R "career-up-r8-form1\|verify-career-up-form1" \
  src/profiles/runner/profile-verification-runner.ts
```

結果0件であること。

---

# 必須検証

## 対象テスト

```bash
npx tsx --test src/profiles/tests/profile-verification-runner.test.ts
npx tsx --test src/profiles/tests/profile-driven-career-up-integration.test.ts
npx tsx --test src/profiles/tests/*.test.ts
```

## legacy verification

```bash
npm run verify:career-up
```

実際のscript名が異なる場合はpackage.jsonを確認し、既存のlegacy verification commandを使用してください。

## Profile-driven verification

```bash
npm run verify:career-up:profile-driven
```

実際のscript名が異なる場合はpackage.jsonを確認してください。

## 全体検証

```bash
npm run ai:verify
npm run build
```

## lint

対象限定lintを必ず実行してください。

```bash
npx eslint \
  src/profiles/runner/profile-verification-runner.ts \
  src/profiles/tests/profile-verification-runner.test.ts \
  src/profiles/tests/profile-driven-career-up-integration.test.ts \
  scripts/document-verification/verify-career-up-profile-driven.mjs
```

全体lintも実行してください。

```bash
npm run lint
```

既存baselineがある場合：

```text
56 errors
23 warnings
```

これを悪化させないでください。

件数が異なる場合は、実際のbaselineを確認し、今回差分由来か判定してください。

## diff検証

```bash
git diff --check
git status -sb
git diff --stat
git diff --name-only
```

## template hash

既存Profile-driven verificationがtemplate hashを確認していることを、実行結果またはテストで確認してください。

---

# 実装完了条件

以下をすべて満たした場合のみ完了です。

- 共通Runner Core新規追加
- DependenciesとExecution Config分離
- RegistryはDependencies注入
- Word生成依存は`inputsToFill`を返却
- Verifierは必須
- Verifier省略経路なし
- templatePath重複指定なし
- templateはProfile/ExecutionContextから解決
- Coreは致命的エラーをthrow
- manualCheck / humanReviewはsuccess-with-review
- Career-up Runnerが薄いwrapper化
- legacy runner変更なし
- legacy mapping変更なし
- field JSON変更なし
- Mapping Definition Registry未実装
- 単一正本化未実装
- 共通Runner単体テストPASS
- Career-up統合テストPASS
- Profile全テストPASS
- legacy verification PASS
- profile-driven verification PASS
- ai:verify PASS
- build PASS
- 対象lint PASS
- 全体lint baseline非悪化
- git diff --check PASS
- 対象限定stage
- commit成功
- push成功
- working tree clean

---

# 停止条件

以下の場合はcommit・pushせず停止してください。

1. working treeがcleanではない
2. HEADが期待commitと一致しない
3. 必読コードを確認できない
4. 既存RunnerのWord生成戻り値を安全に取得できない
5. `inputsToFill`をVerifierへ渡せない
6. Verifier必須化が既存挙動と両立しない
7. templatePathをProfile/ExecutionContextから解決できない
8. legacy runner変更が必要になる
9. legacy mapping変更が必要になる
10. field JSON変更が必要になる
11. 既存期待値変更が必要になる
12. Profile既存テストが失敗する
13. legacy verificationが失敗する
14. profile-driven verificationが失敗する
15. buildが失敗する
16. lint baselineが悪化する
17. 予期しないファイル差分が発生する
18. git diff --checkが失敗する
19. ai:verifyが失敗する

---

# Git操作

全検証通過後のみ実施してください。

## stage

許可ファイルだけを明示stageしてください。

```bash
git add \
  src/profiles/runner/profile-verification-runner.ts \
  src/profiles/tests/profile-verification-runner.test.ts \
  src/profiles/tests/profile-driven-career-up-integration.test.ts \
  scripts/document-verification/verify-career-up-profile-driven.mjs \
  docs/AI/54_Gemini_Milestone5B_Phase2E_Common_Runner_Implementation_Instruction.md
```

`src/profiles/index.ts`を実際に必要最小限で変更した場合のみ追加してください。

```bash
git add src/profiles/index.ts
```

本指示書がrepository内にない場合はstage対象から除外してください。

`git add .`は禁止です。

## staged差分確認

```bash
git diff --cached --check
git diff --cached --stat
git diff --cached --name-only
git diff --cached
```

## commit

```bash
git commit -m "feat: add common profile verification runner"
```

## push

```bash
git push origin feature/milestone-5b-phase2c-career-up-integration
```

## 最終確認

```bash
git status -sb
git log -2 --oneline
git rev-parse HEAD
```

---

# 完了報告

以下を簡潔に報告してください。

1. 新規・変更ファイル
2. Runner API
3. Dependencies型
4. Execution Config型
5. Result型
6. Error型
7. Verifier必須化の実装方法
8. `inputsToFill`伝播方法
9. template解決方法
10. manualCheck / humanReviewの扱い
11. legacy fallback 0回の証拠
12. 単体テスト結果
13. 統合テスト結果
14. Profile全テスト結果
15. legacy verification結果
16. profile-driven verification結果
17. ai:verify結果
18. build結果
19. 対象lint結果
20. 全体lint結果とbaseline比較
21. git diff --check結果
22. commit hash
23. push結果
24. 最終git status
25. 残存リスク
