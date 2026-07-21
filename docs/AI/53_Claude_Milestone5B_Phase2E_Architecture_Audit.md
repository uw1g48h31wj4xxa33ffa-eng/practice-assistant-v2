# Claude監査報告：Milestone 5-B / Phase 2-E Architecture Audit

## 1. Executive Verdict

**条件付き承認**

Gemini設計書（`52_Gemini_Milestone5B_Phase2E_Architecture_Design.md`）は、大方向として適切です。共通Runner導入の方針、legacy経路の不変維持、自動fallback禁止の原則は守られています。

ただし、実コード確認により以下の修正が実装開始前に必要です。

- **[Critical]** `runVerifier?: (...)` の任意化は検証省略経路を許容するため、必須依存に変更すること
- **[High]** `registry` を Config に混在させる設計は、dependency と execution input の責務混在であるため分離すること
- **[High]** `startWordGeneration: (...) => Promise<void>` は実コードで `inputsToFill` オブジェクトの生成と Verifier への受け渡しが必要であるため、返却型を `Promise<{ inputsToFill: Record<string, unknown> }>` に変更すること
- **[Medium]** 現行 `OutputVerifier.verify()` はデフォルト引数で `careerUpR8Form1Mapping` を動的 import するハードコードが存在する。共通Runner化の際にこの依存を切り離すこと

---

## 2. Scope and Evidence Reviewed

**参照ドキュメント**:
- `docs/AI/52_Gemini_Milestone5B_Phase2E_Architecture_Design.md`
- `docs/AI/52_Gemini_Milestone5B_Phase2E_Architecture_Design_Instruction.md`
- `docs/AI/01_AI_Package.md`
- `docs/AI/48_Gemini_Milestone5B_Phase2D_PreImplementation_Investigation.md`
- `docs/AI/49_Claude_Milestone5B_Phase2D_Architecture_Audit.md`
- `docs/AI/50_Gemini_Milestone5B_Phase2D_Implementation_Instruction.md`
- `docs/AI/51_Gemini_AI_Package_Phase2D_Update_Instruction.md`

**参照コード（実コード確認済み）**:
- `scripts/document-verification/verify-career-up-profile-driven.mjs` (366行全体)
- `scripts/document-verification/verify-career-up-form1.mjs` (先頭100行)
- `scripts/document-verification/config/career-up-r8-form1.mapping.mjs` (存在確認)
- `scripts/document-verification/config/career-up-r8-form1-fields.json` (参照経路確認)
- `scripts/document-verification/core/output-verifier.mjs` (577行全体)
- `scripts/document-verification/core/dom-serialization-verifier.mjs` (全体)
- `src/profiles/types/form-profile.ts`
- `src/profiles/types/mapping-profile.ts`
- `src/profiles/registry/profile-registry.ts`
- `src/profiles/resolution/adapter.ts` (CareerUpAdapter)
- `src/profiles/resolution/profile-resolver.ts`
- `src/profiles/resolution/execution-context-builder.ts`
- `src/profiles/resolution/feature-activation.ts` (ProfileDrivenContextFactory)
- `src/profiles/tests/profile-driven-career-up-integration.test.ts`
- `src/domain/workflow/resultTypes.ts`
- `src/app/api/document/generate/route.ts`

**GenerationResultDTO調査結果**:
`GenerationResultDTO` という名前の型・クラスはコードベースに存在しない。`src/domain/workflow/resultTypes.ts` には `MigrationResult<T>`, `ValidationResult`, `ProfileResolutionResult` 等が定義されている。`route.ts` では「DTOを受け取る」とコメントがあるが具体型は未定義。現時点でProfile-driven Runnerはアプリケーション層から独立した検証スクリプトとして動作しており、UI向けDTO変換は対象外。

---

## 3. Findings Summary

| # | 区分 | Severity | 内容 |
|---|------|----------|------|
| F1 | Verifier任意化 | Critical | `runVerifier?` 任意化で検証省略経路が生じる |
| F2 | Registry/Config責務混在 | High | `registry` をConfigに含めるのは設計ミス |
| F3 | Word生成返却型 | High | `Promise<void>` では `inputsToFill` を伝播できない |
| F4 | OutputVerifier内ハードコード | Medium | legacy mapping動的importが残存 |
| F5 | templatePath責務 | Low | FormProfileに`templateReference`がある。Runner責務か要確認 |
| F6 | manualCheck/humanReview現行状態 | Low | 現行コードにRunnerレベルでの集約なし（field属性のみ） |

---

## 4. Factual Accuracy Audit

| 主張 | 根拠ファイル | 根拠箇所 | 判定 | 補足 |
|------|-------------|----------|------|------|
| オーケストレーションが各様式固有Runnerにベタ書きされている | `verify-career-up-profile-driven.mjs` | L105-L274: `verify()` 関数内にFieldLocator, WordFiller, OutputVerifier等を直接呼出し | **正しい** | 約170行のDOM操作が1関数に集約 |
| `career-up-r8-form1-fields.json` が単一正本として機能している | `verify-career-up-profile-driven.mjs` L12-13, `profile-driven-career-up-integration.test.ts` L14-15 | `fs.readFileSync` + `JSON.parse` で同一ファイルをRunner・Testが参照 | **正しい** | ただし `legacyMapping.fields` との二重管理は継続中 |
| ProfileResolver/Adapter/ExecutionContextBuilderの責務 | `profile-resolver.ts`, `adapter.ts`, `execution-context-builder.ts` | ProfileResolverが依存解決と型チェック、AdapterがLegacy形式変換、BuilderがContext凍結 | **正しい** | — |
| Word生成→Verifier呼出し順序 | `verify-career-up-profile-driven.mjs` | L257: DomSerializationVerifier → L262-263: doc.save() → L265: OutputVerifier.verify() | **正しい** | DomSerializationVerifierはDOM状態確認、OutputVerifierは保存後のファイル検証 |
| 失敗時にWord生成が始まらない保証 | `orchestrateProfileGeneration` L89-103 | resolveMapping()がthrowした場合、`startWordGeneration`は呼ばれない | **正しい** | ただし `startWordGeneration` 内部での失敗は途中停止になる可能性あり |
| legacy fallbackが存在しない | `orchestrateProfileGeneration` L94-98 | `void legacyFallback`でfallback呼出しを明示的に排除 | **正しい** | — |
| manualCheckはfield属性として定義されている | `config/career-up-r8-form1-fields.json` 参照, `hatarakikata-r8-form1.mapping.mjs` | 各フィールドに `"manualCheck": true/false` を保持 | **正しい** | RunnerレベルでのmanualCheck集約は現行なし |
| DTO返却の現状 | `src/domain/workflow/resultTypes.ts`, `route.ts` | GenerationResultDTOは存在しない。検証スクリプトは返却値なし（throw or 正常終了） | **根拠不足** → **確認済** | Gemini設計書は「Runner結果DTO」として新設する設計。既存との矛盾はない |
| Template hash検証の現状 | `verify-career-up-profile-driven.mjs` L125, `output-verifier.mjs` L432 | `VersionGuard.verifyHash()` でWord生成前に確認、`OutputVerifier.verify()` で原本hash再確認 | **正しい** | 二重確認の構造になっている |

---

## 5. Common Runner Form Audit

### Option R1: 純粋関数 `runProfileVerification(config)`
- 現行コードと最も近い形。
- 状態保持の必要性はないため、関数でも原理上は可能。
- ただし、DIの表現が引数のフラットな混在になりやすく、Dependency と Input が区別しにくい。

### Option R2: クラス `new ProfileVerificationRunner(dependencies).run(config)` （Gemini案）
- DependenciesとExecution Configを構造的に分離できる。
- テスト時に dependencies をモック注入しやすい。
- 状態は持たず `run()` が純粋な変換処理となることを設計上保証しやすい。
- concurrent execution は dependencies を immutable に保てば安全。

### Option R3: Factory + 純粋関数 `createProfileVerificationRunner(dependencies)`
- R2と実質同等だが、クラス構文を避けたい場合の代替。
- 実装量は R2 とほぼ同じ。

**採用判定: Option R2（クラス）を採用**

理由: 現行コードは `.js` と `.ts` の混在環境であり、クラスによる型付き DI が最も安全。`dependencies` とは別に `run(config)` を呼ぶことで「静的な配線」と「動的な実行」の境界が明確になる。

---

## 6. Dependency Injection Audit

**Gemini案の問題点**:
```ts
// 現設計（問題あり）
type ProfileVerificationRunnerConfig = {
  formId: string;
  registry: ProfileRegistry; // ← dependencyがconfigに混在
  startWordGeneration: (...) => ...; // ← dependencyがconfigに混在
  ...
};
```

`registry` と `startWordGeneration` は実行ごとに変わらない依存であり、Config（実行ごとの入力）に含めるべきではありません。

**推奨インターフェース**:
```ts
type ProfileVerificationDependencies = {
  registry: ProfileRegistry;
  startWordGeneration: (mapping: LegacyMappingFormat, input: Record<string, unknown>, outPath: string) => Promise<{ inputsToFill: Record<string, unknown> }>;
  runVerifier: (originalBuffer: Buffer, outPath: string, expectedSha256: string, inputsToFill: Record<string, unknown>, mapping: LegacyMappingFormat) => Promise<void>; // 必須
};

type ProfileVerificationRunnerConfig = {
  formId: string;
  mappingId: string;
  effectiveDate: Date;
  inputData: Record<string, unknown>;
  outputPath: string;
};

class ProfileVerificationRunner {
  constructor(private deps: ProfileVerificationDependencies) {}
  async run(config: ProfileVerificationRunnerConfig): Promise<ProfileVerificationResult> { ... }
}
```

- Registry のmutable stateは、Runnerインスタンス生成後に `register()` を追加呼出しすることで並列実行に影響する可能性がある。テスト用はインスタンスごとに新たな Registry を生成する方式を推奨。
- `templatePath` は FormProfile の `templateReference` から導出できるため、Config への明示は不要（Runner内部で解決）。

---

## 7. Verifier Requirement Audit

**Gemini案**:
```ts
runVerifier?: (...) // オプション
```

**判定: 任意化は禁止。Verifierは必須依存とする。**

根拠:
- `DomSerializationVerifier.verify()` と `OutputVerifier.verify()` は現行の全シナリオで呼ばれており、省略するシナリオは存在しない（実コード L257, L265 確認）。
- 任意化すると、「Verifierを渡し忘れた」状態でWord生成が完了し、品質保証なしに出力ファイルが生成される経路が生じる。
- テストでの差替えは `dependencies` への mock 注入で実現できるため、optional にする理由がない。
- `manualCheck` / `humanReview` の判定は Verifier 実行後の結果に基づくべきであり、Verifier 省略時にこれらを正しく判定できない。

**採用する設計**:
- `DomSerializationVerifier` は Word生成関数（`startWordGeneration`）の責務内で呼ぶ（DOM操作と密結合のため）。
- `OutputVerifier` は Runner が `runVerifier` として依存注入を受け、`startWordGeneration` 完了後に呼ぶ。
- いずれも dependencies から省略不可（required）とする。

---

## 8. Error Model Audit

**既存実コードのエラー伝播方式**:
- `orchestrateProfileGeneration` は失敗時に throw する（L98）。
- `OutputVerifier.verify()` は失敗時に throw する。
- `DomSerializationVerifier.verify()` は失敗時に throw する。
- 呼び出し元 `verify()` 関数の `try/catch` でエラーをログ出力後、再 throw。
- `run()` 関数の `try/catch` で `process.exit(1)` を実行。

**既存GenerationResultDTOとの整合性**: `GenerationResultDTO` は codebase に存在しない。現時点でProfile-driven Runner は Application Layer から分離された検証スクリプトとして動作しており、UI向けDTO変換は対象外。将来の Application Layer 統合時に変換レイヤーを設ける方針で問題ない。

**採用する境界: Option E2（CoreはThrow、BoundaryでResult化）**

理由: Runner Core を純粋に保ちつつ、CLI wrapper や将来の Application Layer 統合でResult型に変換できる柔軟性を確保する。Runner Core の内部で全エラーをResultに変換すると、catch忘れによる silent failure のリスクが生じる。

**manualCheck / humanReview の扱い**:
- 「success-with-review」状態として `ProfileVerificationResult` にフラグを持たせる設計（Gemini案）に同意。
- これはシステムエラーではなく、業務的な要確認フラグであり、throw で表現すべきではない。
- Runner は `manualCheck: boolean` と `humanReview: boolean` をResultに含め、呼び出し元が適切に処理する。

---

## 9. Runner API Audit

**実コードに基づく修正API**:

```ts
// dependencies: インスタンス生成時に注入（実行ごとに変わらない）
type ProfileVerificationDependencies = {
  registry: ProfileRegistry;
  // DomSerializationVerifier はstartWordGeneration内部責務のため含めない
  startWordGeneration: (
    mapping: LegacyMappingFormat,
    input: Record<string, unknown>,
    outputPath: string
  ) => Promise<{ inputsToFill: Record<string, unknown> }>; // voidではなく結果を返す
  runVerifier: (
    originalBuffer: Buffer,
    outputPath: string,
    expectedSha256: string,
    inputsToFill: Record<string, unknown>,
    mapping: LegacyMappingFormat
  ) => Promise<void>; // 必須
};

// config: run()呼出しごとの実行入力
type ProfileVerificationRunnerConfig = {
  formId: string;
  mappingId: string;
  effectiveDate: Date;
  inputData: Record<string, unknown>;
  outputPath: string;
  // templatePath は FormProfile.templateReference から Runner内部で解決
};

// result
type ProfileVerificationResult = {
  success: boolean;
  formId: string;
  mappingId: string;
  outputPath?: string;
  manualCheck: boolean;
  humanReview: boolean;
  errorCode?: string;
  errorMessage?: string;
};
```

**各論点への回答**:
- `formId` + `mappingId` + `Registry`: Profileの解決はRunner内部で行う。ProfileResolver がdependency chain を辿るため、明示的な mappingId は不要の可能性もあるが、Phase 2-E では明示指定を維持して安全を確保する。
- `templatePath`: FormProfileの`templateReference`から導出するため不要。ただし絶対パス解決ロジックをRunner内に持つ必要がある。
- `effectiveDate`: timezone依存リスクあり。Runner内で `UTC midnight` に正規化するか、呼び出し元が責任を持つ旨をコメントで明示する。
- `adapter` 明示指定: 現行は `CareerUpAdapter` のみ。Phase 2-Eでは1様式のみのため、Runner内部で固定 or dependencies に含める。dependencies化を推奨。
- `abort signal` / `correlation id` / `logger`: Phase 2-E では追加しない（過剰設計）。

---

## 10. Single Source of Truth Audit

**S1案の評価（Profile JSONを正本→legacy互換mapping自動生成）**

**確認事項**:
- `career-up-r8-form1-fields.json` はフィールド定義の配列であり、`manualCheck`, `verification`, `locator`, `inputMode` 等のメタデータを保持している（legacyMapping.fields と同構造）。
- `legacyMapping` の `template` 部分（`id`, `version`, `expectedSha256`）は JSON に含まれておらず、FormProfile が保持している。
- S1実現にはJSON正本 + FormProfile情報からlegacyMapping全体を生成するgenerator scriptが必要。

**問題点**:
- legacy runner（`verify-career-up-form1.mjs`）は現在 `.mjs` dynamic import で `careerUpR8Form1Mapping` を直接参照している。生成ファイルへの切り替えには legacy runner の変更が必要になる可能性があり、「既存コード変更禁止」の制約と矛盾する。
- `OutputVerifier.verify()` L464: `const { careerUpR8Form1Mapping } = await import('../config/career-up-r8-form1.mapping.mjs');` というハードコード動的importが残存しており、S1実現のためにはこの箇所も変更が必要。
- generator不具合時に legacy runner が壊れるリスクがある。generated fileのGit差分は可読性が低い場合がある。

**判定: S1は条件付き承認。Phase 2-F以降で実施すること。**

Phase 2-Eではこれらの複雑性を持ち込まず、Integration Testの `deepStrictEqual` によるドリフト検出（現行方式）を維持する。

---

## 11. Test Strategy Audit

| テストケース | 優先度 | 理由 |
|-------------|--------|------|
| 正常系貫通テスト | **P0** | Runner動作の基本確認 |
| FormProfile未登録 | **P0** | Word生成が開始されないことを spy で確認 |
| MappingProfile未登録 | **P0** | 同上 |
| Profile validation失敗 | **P0** | PROFILE_VALIDATION_FAILEDのerrorCode確認 |
| Adapter解決失敗 | **P0** | ADAPTER_RESOLUTION_FAILEDのerrorCode確認 |
| Template hash不一致 | **P0** | TEMPLATE_HASH_MISMATCHで停止し Word生成0回 |
| legacy fallback 0回 | **P0** | spy で callCount === 0 を検証 |
| 失敗時Word生成 0回 | **P0** | spy で startWordGeneration callCount === 0 を検証 |
| Verifier未実行禁止 | **P0** | runVerifier が必ず呼ばれることを spy で確認 |
| manualCheck フラグ伝播 | **P1** | Result.manualCheck === true の確認 |
| humanReview フラグ伝播 | **P1** | Result.humanReview === true の確認 |
| effectiveDate不一致 | **P1** | 無効な日付でRESOLUTION_FAILED |
| Adapter実行失敗 | **P1** | ADAPTER_EXECUTION_FAILEDで停止 |
| Word生成失敗 | **P1** | WORD_GENERATION_FAILEDのerrorCode確認 |
| Verifier失敗 | **P1** | VERIFICATION_FAILEDのerrorCode確認 |
| output compatibility | **P1** | 既存Runnerと同一入力で同一出力を確認 |
| deterministic output | **P1** | 同一入力で複数回実行し同一出力を確認 |
| JSON drift 検出 | **P1** | 既存Integration Testで担保済み |
| errorCode安定性 | **P1** | 同一エラー条件で同一errorCodeを確認 |
| DIモック差替えテスト | **P1** | dependencies に mock を注入 |
| legacy regression | **P1** | 既存legacyRunnerがPassすることを確認 |
| build / lint / ai:verify | **P1** | 必須gate（既存CI）|
| concurrent execution安全性 | **P2** | 同一Registry使用時の状態競合なし |
| static import graph | **P2** | legacyRunnerからの新規依存なし |
| Registry差替えテスト | **P2** | 異なるRegistry instanceでの動作確認 |
| template onboarding | **将来** | 新規様式追加後に対応 |

---

## 12. Exact Next Implementation Scope

以下を次の実装Phaseの最小安全スコープとして確定します。

**実施**:
1. **共通Runner Core の新規追加**: `src/profiles/runner/profile-verification-runner.ts` を新規作成（TypeScript）
2. **Career-up Profile-driven Runner の薄いラッパー化**: `scripts/document-verification/verify-career-up-profile-driven.mjs` の `orchestrateProfileGeneration` と `resolveCareerUpMapping` を共通Runnerへ委譲し、様式固有の Word生成関数を `startWordGeneration` として注入
3. **既存統合テストの接続**: `profile-driven-career-up-integration.test.ts` が共通Runner経由でも PASS することを確認

**実施しない**:
- 新規様式の追加
- Mapping Definition Registry の実装
- 単一正本化（S1）の実装
- legacy runner の変更
- OutputVerifier 内ハードコードの解消（Phase 2-F以降）

**分割推奨**: 「Runner Core新規追加 + テスト」と「既存Runnerのラッパー化」は1 Phaseで実施可能。ただし、既存Runnerのラッパー化で既存テスト (P0) が全PASS することをgate条件とすること。

---

## 13. Required Corrections to Gemini Design

### Correction C1
- **Severity**: Critical
- **Current Design**: `runVerifier?: (...) => Promise<void>` （任意）
- **Problem**: optional化により検証省略経路が生じる。Verifier未実行でWord生成が完了する。
- **Required Change**: `runVerifier` を `ProfileVerificationDependencies` の必須フィールドに変更する
- **Evidence**: `output-verifier.mjs` L429-575, `dom-serialization-verifier.mjs` 全体 — 全シナリオで必ず呼ばれている
- **Implementation Impact**: `ProfileVerificationRunner` のコンストラクタ引数変更のみ

### Correction C2
- **Severity**: High
- **Current Design**: `registry: ProfileRegistry` を Config に含める
- **Problem**: Dependency と Execution Input の責務混在。テスト時の差替えが困難。
- **Required Change**: `ProfileVerificationDependencies` と `ProfileVerificationRunnerConfig` を分離し、`registry` と `startWordGeneration`, `runVerifier` は Dependencies に移動する
- **Evidence**: 現行コードで Registry は `setupRegistry()` で一度生成、以降は変更されない（Immutable use）
- **Implementation Impact**: API型の再定義、呼び出し側のコード変更が必要

### Correction C3
- **Severity**: High
- **Current Design**: `startWordGeneration: (...) => Promise<void>`
- **Problem**: Word生成後に `inputsToFill` が必要（`OutputVerifier.verify(originalBuffer, outputPath, hash, inputsToFill)` へ渡すため）。`Promise<void>` では情報が欠落し、OutputVerifier が正しく機能しない。
- **Required Change**: `startWordGeneration: (...) => Promise<{ inputsToFill: Record<string, unknown> }>`
- **Evidence**: `verify-career-up-profile-driven.mjs` L131-254 で `inputsToFill` を収集し L265 で `OutputVerifier.verify()` に渡している
- **Implementation Impact**: `startWordGeneration` の実装関数の返却型変更が必要

### Correction C4
- **Severity**: Medium
- **Current Design**: `templatePath` を Config に含める
- **Problem**: `FormProfile.templateReference` から導出できる。Runner責務に含めることで二重管理が生じる。
- **Required Change**: `templatePath` をConfigから除外し、Runner内部で `FormProfile.templateReference` を基に絶対パス解決する
- **Evidence**: `FormProfile` 型に `templateReference: string` が定義されている
- **Implementation Impact**: Runner内部にパス解決ロジックが必要。Phase 2-Eでは一旦Configに残しても許容

---

## 14. Stop Conditions

以下の場合は実装を停止すること。

1. Verifier を optional にする設計に戻す場合
2. legacy runner（`verify-career-up-form1.mjs`）への変更が発生した場合
3. `OutputVerifier` / `DomSerializationVerifier` の呼出し省略が設計に入った場合
4. 自動 legacy fallback が実装に入った場合
5. 既存 Integration Test（48テスト）が1件でも FAIL した場合
6. `git diff --check` が FAIL した場合
7. `ai:verify` が FAIL した場合
8. 設計書以外のファイルに差分が生じた場合（新規ファイル追加を除く）

---

## 15. Final Recommendation

Gemini設計書は大方向として正しく、現行コードとの整合性も概ね確保されています。ただし以下の修正を実装開始前に適用する必要があります。

**必須修正（実装開始前）**:
1. `runVerifier` を Dependencies の必須フィールドとする（C1）
2. Dependencies と Config を分離する（C2）
3. `startWordGeneration` の返却型を `Promise<{ inputsToFill: Record<string, unknown> }>` とする（C3）

**推奨修正（Phase 2-E内で対応）**:
4. `templatePath` を Config から除去し、FormProfile から解決する（C4）

**Phase 2-F以降へ先送り**:
- S1（単一正本化）の実装
- `OutputVerifier` 内の `careerUpR8Form1Mapping` ハードコード解消

---

## 実装用確定案

```text
採用Runner形態:
  Option R2 — クラス `class ProfileVerificationRunner { constructor(deps: Deps); run(config: Config): Promise<Result> }`

Dependencies型:
  type ProfileVerificationDependencies = {
    registry: ProfileRegistry;
    startWordGeneration: (mapping: LegacyMappingFormat, input: Record<string, unknown>, outputPath: string) => Promise<{ inputsToFill: Record<string, unknown> }>;
    runVerifier: (originalBuffer: Buffer, outputPath: string, expectedSha256: string, inputsToFill: Record<string, unknown>, mapping: LegacyMappingFormat) => Promise<void>;
  };

Execution Config型:
  type ProfileVerificationRunnerConfig = {
    formId: string;
    mappingId: string;
    effectiveDate: Date;
    inputData: Record<string, unknown>;
    outputPath: string;
  };

Result型:
  type ProfileVerificationResult = {
    success: boolean;
    formId: string;
    mappingId: string;
    outputPath?: string;
    manualCheck: boolean;
    humanReview: boolean;
    errorCode?: string;
    errorMessage?: string;
  };

Error型:
  FORM_PROFILE_NOT_FOUND / MAPPING_PROFILE_NOT_FOUND / PROFILE_VALIDATION_FAILED /
  ADAPTER_RESOLUTION_FAILED / ADAPTER_EXECUTION_FAILED /
  TEMPLATE_NOT_FOUND / TEMPLATE_HASH_MISMATCH /
  WORD_GENERATION_FAILED / VERIFICATION_FAILED

Verifier必須性:
  必須（dependencies の required field）。optional は禁止。

Registry注入方法:
  ProfileVerificationDependencies.registry に外部注入。テスト時は新規インスタンスを生成。

Word生成依存の型:
  (mapping: LegacyMappingFormat, input: Record<string, unknown>, outputPath: string) => Promise<{ inputsToFill: Record<string, unknown> }>

manualCheck / humanReviewの扱い:
  success-with-review状態。ProfileVerificationResult のフラグとして返す。throwしない。

最小変更ファイル:
  [NEW] src/profiles/runner/profile-verification-runner.ts
  [MODIFY] scripts/document-verification/verify-career-up-profile-driven.mjs

変更禁止ファイル:
  scripts/document-verification/verify-career-up-form1.mjs
  scripts/document-verification/config/career-up-r8-form1.mapping.mjs
  scripts/document-verification/core/output-verifier.mjs
  scripts/document-verification/core/dom-serialization-verifier.mjs
  src/profiles/registry/profile-registry.ts
  src/profiles/resolution/profile-resolver.ts
  src/profiles/resolution/adapter.ts
  src/profiles/resolution/execution-context-builder.ts

必須テスト（P0）:
  正常系 / FormProfile未登録でWord生成0回 / MappingProfile未登録でWord生成0回 /
  Template hash不一致で停止 / legacy fallback 0回 / Verifier必ず実行を spy で確認

commit前検証:
  npx tsx --test src/profiles/tests/*.test.ts (48 PASS)
  npm run ai:verify (PASS)
  git diff --check (PASS)
  git diff --name-only (設計書・指示書のみ)

停止条件:
  Verifier optional 化 / legacy runner 変更 / 自動fallback追加 /
  既存テストFAIL / git diff --check FAIL / ai:verify FAIL
```
