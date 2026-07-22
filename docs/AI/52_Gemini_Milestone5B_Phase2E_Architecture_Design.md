# Gemini設計報告：Milestone 5-B / Phase 2-E Architecture Design

## 1. Executive Summary
Phase 2-Dで確立されたProfile-driven実行基盤をさらに発展させるため、検証プロセスの共通化、Mapping Registryの必要性、二重管理解消に向けたアーキテクチャ調査と設計を行いました。
次フェーズ（Phase 2-E 実装）では、過剰設計を避けるため「共通Runner Coreの新規追加と、既存のCareer-up Runnerの薄いラッパー化」のみにスコープを限定します。Mapping Definition Registryの導入やレガシー定義の単一正本化については、リスク低減のため将来フェーズへ先送りする段階的な移行計画を推奨します。

## 2. Current Architecture
Option A2の採用により、`career-up-r8-form1-fields.json` が独立した単一正本として配置されています。Profile-drivenのRunnerと統合テストはこれを参照し、レガシー定義への直接依存は解消されました。
しかし、現時点では各様式の実行スクリプト（`verify-career-up-profile-driven.mjs`）内に、WordDOM操作、データ充填、検証機能（DomSerializationVerifier, OutputVerifier）の呼び出しがベタ書きされており、新規様式追加時にこれらのオーケストレーションコードが重複する課題があります。

## 3. Current Execution Flow
現在の Profile-driven フローは以下の手順で実行されています：
1. **入力**: 各シナリオ（`verify` 関数内）から `outputsMap` などの入力データが提供される。
2. **FormProfile / MappingProfile 登録**: `setupRegistry()` 内で、対象様式の固定情報およびJSON定義を `ProfileRegistry` に登録する。
3. **Profile解決とAdapter実行**: `resolveCareerUpMapping()` にて `ProfileDrivenContextFactory` から Context を生成し、`CareerUpAdapter` によりレガシー互換の構造へと変換する。
4. **Word generation**: `orchestrateProfileGeneration` 経由で Word generation が呼び出され、`WordFiller` と `SdtCheckboxFiller` により DOM への値埋めが行われる。
5. **Verifier**: 変更前後の DOM 比較（`DomSerializationVerifier`）および最終成果物のハッシュ検証等（`OutputVerifier`）が実行される。
6. **エラー制御**: 解決失敗時などは例外が throw され、レガシーフォールバックは呼ばれないことが保証されている。

## 4. Responsibility Matrix
次期アーキテクチャに向けて、責務を以下のように分類します。

**共通化候補**:
- ProfileRegistryの初期化（注入されたProfileの登録）
- Profile解決、Adapter実行、ExecutionContext生成
- Word generationの安全な実行制御
- 共通Verifier（DomSerializationVerifier, OutputVerifier）の実行
- エラーハンドリングと例外の伝播
- 証跡（ログ）出力、レガシーフォールバック禁止の強制

**様式固有として残す候補**:
- formId, mappingId, formVersion
- templatePath, templateHash, fieldDefinitions（JSONパス）
- sample input / expected output
- Adapter種別
- manualCheck / humanReview の条件（様式固有のビジネスロジックを含むため）

## 5. Common Profile Verification Runner Design
共通Runnerは **クラス (`ProfileVerificationRunner`)** として設計します。
関数やCLIスクリプトベタ書きではなくクラスを採用する理由は、`ProfileRegistry` や外部サービス（ファイルI/Oなど）の **依存注入 (DI)** を容易にし、テスト時に副作用を安全にモックへ差し替え可能にするためです。
また、CLIラッパーとRunner Coreは完全に分離し、Runner Coreは純粋なオーケストレーションのみを担当します。Word generationロジック自体は過渡期においては依存注入でRunnerへ渡し、将来的に共通化を図ります。

## 6. Runner API and Types
```ts
type ProfileVerificationRunnerConfig = {
  formId: string;
  mappingId: string;
  effectiveDate: Date;
  inputData: Record<string, unknown>;
  templatePath: string;
  outputPath: string;
  // Registryは外部注入を可能にし、テスト性を向上させる
  registry: ProfileRegistry;
  // 既存のWord生成ロジックとの互換性を保つための注入関数
  startWordGeneration: (mapping: MappingProfile, input: Record<string, unknown>, outPath: string) => Promise<void>;
  // オプション: 固有のVerifierがある場合
  runVerifier?: (mapping: MappingProfile, outPath: string) => Promise<void>;
};

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
*修正理由*: `formProfile` や `mappingProfile` の実体を渡すのではなく、`formId` と `Registry` を渡すことで、Runner内部で `ProfileResolver` による解決プロセスを確実に経由させ、本来の Profile-driven の制約を強制するためです。

## 7. Runner Error Model
エラー分類と対応方針は以下の通りです。
- `FORM_PROFILE_NOT_FOUND` / `MAPPING_PROFILE_NOT_FOUND`: Registry未登録。Word生成不可。
- `PROFILE_VALIDATION_FAILED`: Schema不正。Word生成不可。
- `ADAPTER_RESOLUTION_FAILED` / `ADAPTER_EXECUTION_FAILED`: 変換エラー。Word生成不可。
- `TEMPLATE_NOT_FOUND` / `TEMPLATE_HASH_MISMATCH`: 原本ファイルの問題。Word生成不可。
- `WORD_GENERATION_FAILED`: DOM操作やファイル書き込み等の実行時エラー。
- `VERIFICATION_FAILED`: OutputVerifier等の検証エラー。

上記はいずれも **リトライ不可・自動フォールバック不可** の致命的エラーとして扱い、上位へ伝播させます。

一方、`MANUAL_CHECK_REQUIRED` および `HUMAN_REVIEW_REQUIRED` については、システムエラー（例外）として扱うべきではなく、`success: true` の上でフラグが立つ **success-with-review（要確認成功）** 状態として扱う設計とします。

## 8. Mapping Definition Registry Options
- **Option M1**: MappingProfileがfieldDefinitions実体を保持（現状）
- **Option M2**: DefinitionRegistryが実体を管理し、MappingProfileはIDのみ保持
- **Option M3**: パッケージとしての統合管理
- **Option M4**: JSON正本からの動的生成

**評価と判定**: Option M2 は参照透過性が高まりますが、初期化順序の複雑化と変更コストを伴います。現状の段階では過剰設計リスクを回避するため、**Option M1 を継続** します。

## 9. Single Source of Truth Options
現在の `legacyMapping` と `Profile JSON` の二重管理を解消するための案です。
- **案S1**: Profile JSONを正本とし、ビルドプロセスで legacy 互換 mapping を自動生成する。
- **案S2**: 共通Mapping Definitionを正本とし、両方を生成する。
- **案S3**: Registryを正本とし、Adapter内で実行時に分岐する。

**推奨案**: **案S1** を推奨します。JSON を正本とすることで型とデータの依存を最もクリーンに分離でき、レガシー側は生成された静的ファイルを読み込むだけとなるため、実行時のオーバーヘッドもありません。

## 10. Recommended Target Architecture
- **オーケストレーション**: `ProfileVerificationRunner` クラス（DIベース）
- **Registry構造**: Option M1 (現状維持)
- **単一正本化**: 案S1 へ向けた準備期間として、今回は二重管理（Integration Testの比較アサーションによるドリフト検出）を維持する。

## 11. Migration Roadmap
1. **Phase 2-E**: 共通Runner Coreの導入と、既存Career-up Runnerの薄いラッパー化（機能等価性の証明）。
2. **Phase 2-F**: 他の様式の Profile-driven 経路への移行と Runner への接続。
3. **Phase 2-G**: 案S1に基づく Profile JSON からのレガシー mapping 動的生成（二重管理の根本解消）。

## 12. New Template Addition Cost Analysis
現在の新規テンプレート追加には、「原本配置、各種Profileのコーディング、JSON生成、Adapter作成、Runner作成（オーケストレーションの複製）、テスト実装」などの工程が存在します。
- **課題**: Runner作成に伴うファイルI/Oや検証ロジックの重複、Hashのコピペによるヒューマンエラー。
- **Phase 2-E以降の削減効果**: 共通Runnerの導入により、新しい様式は「Configオブジェクトの定義」と「固有のAdapter作成」のみで済むようになり、オーケストレーションの重複作業が完全に排除されます。ただし、手動確認（manualCheck/humanReview）の判定ロジック設計など、人間による判断が必須な部分は引き続き残ります。

## 13. Required Tests
共通Runner実装時に必要なテスト（P1, P2）:
- **P1**: 正常系の貫通テスト。Form未登録、Adapter失敗、Hash不一致などの異常系で「確実にWord生成が開始されないこと」「legacy fallbackが0回であること」の証明。manualCheckフラグの伝播確認。
- **P2**: DIを用いた Registry や Word生成関数のモック差し替えテスト。エラーコードの安定性担保。
- **P3**: （今回は見送り）

## 14. Compatibility and Rollback
今回のアーキテクチャ変更は Profile-driven 経路の内部リファクタリングに留まり、レガシー実行スクリプト（`verify-career-up-form1.mjs` 等）には一切変更を加えません。
問題発生時は、環境変数やフラグ等でレガシー実行を呼び出すか、以前のコミットへ戻すだけで安全にロールバック可能です。

## 15. Exact Next Implementation Scope
次フェーズ（Phase 2-E実装）の安全な最小範囲として以下を提案します。
- 共通Runner Core (`ProfileVerificationRunner`) クラスの新規追加。
- Career-up Profile-driven Runner を、この共通Runnerを呼び出す「薄いラッパー」へ変更。
- 既存の統合テストを、変更後の Runner に対して実行しパスさせる。
- （新規様式の追加、Mapping Definition Registry の実装、単一正本化の自動化は行わない）

## 16. Out of Scope
- DB・外部APIの導入、UIの変更
- 全テンプレートの一括移行やレガシー経路の削除
- プラグインアーキテクチャや過剰なDIコンテナの導入

## 17. Stop Conditions
以下の状況に陥った場合は設計を停止し、再評価します。
- レガシー経路への意図せぬ影響が避けられない場合。
- 既存の検証（Verifier）の精度や manualCheck の要件を弱める設計になった場合。
- 共通化により、逆に様式固有の分岐がRunner内に散乱する場合。

## 18. Final Recommendation
共通RunnerをDI可能なクラスとして設計し、まずは現在の Career-up のみを対象にラッパー化を行うアプローチは、リスクを最小限に抑えつつ将来の拡張性（他様式の容易な追加）を担保する最善の策です。二重管理の解消などの根本対応は次以降のフェーズへ分離することで、安全なインクリメンタルデリバリーが達成されます。
