# Gemini設計指示書：Milestone 5-B / Phase 2-E アーキテクチャ設計

## 目的

Milestone 5-B / Phase 2-Eとして、Profile-driven Verification基盤の次段階に向けたアーキテクチャ設計を行ってください。

本Phaseは**調査・設計・設計書作成・Git管理のみ**です。実装コード、テストコード、設定ファイル、Runner、Registry、Adapter、Resolver、legacy経路は変更しないでください。

主な設計対象は以下です。

1. 共通Profile Verification Runner
2. Mapping Definition Registry
3. legacyMappingとProfile JSONの単一正本化
4. 新規Wordテンプレート追加コストの削減

## 最重要ルール

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

- 実装しないでください。
- 既存コードを変更しないでください。
- 調査結果と推奨案を混同しないでください。
- 未確認事項を事実として断定しないでください。
- 現行legacy経路を廃止する前提で設計しないでください。
- 自動legacy fallbackを追加する設計にしないでください。
- Phase 2-Dで確立したOption A2を無断で覆さないでください。
- 過剰な共通化を提案しないでください。
- 新しい抽象化は、責務・利点・コスト・停止条件を明示してください。
- 既存Verifier、manualCheck、humanReview、出力互換性を弱める設計は禁止です。
- 停止条件に該当した場合はcommit・pushせず停止してください。

## 対象ブランチ

```text
feature/milestone-5b-phase2c-career-up-integration
```

## 事前状態確認

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
- 最新commitがPhase 2-D記録commitであること

```text
fbaf9f2 docs: record phase 2d completion
```

完全hashは実際の`git rev-parse HEAD`結果を使用してください。

異なる場合は停止してください。

## 必読ファイル

最低限、以下を確認してください。

```text
docs/AI/01_AI_Package.md
docs/AI/48_Gemini_Milestone5B_Phase2D_PreImplementation_Investigation.md
docs/AI/49_Claude_Milestone5B_Phase2D_Architecture_Audit.md
docs/AI/50_Gemini_Milestone5B_Phase2D_Implementation_Instruction.md
docs/AI/51_Gemini_AI_Package_Phase2D_Update_Instruction.md

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
```

存在する場合は以下も確認してください。

```text
Verifier関連Core
GenerationResultDTO関連
Template Registry関連
Word generation entrypoint
他様式のRunner・Mapping・Profile
```

## 調査対象

## 1. 現行Profile-driven実行フロー

実際のコードに基づき、以下を明確化してください。

```text
入力
↓
FormProfile登録
↓
MappingProfile登録
↓
ProfileRegistry
↓
ProfileResolver
↓
Adapter
↓
ExecutionContext
↓
Word generation
↓
Verifier
↓
結果返却
```

各段階について以下を記録してください。

- 実ファイル
- 関数またはクラス
- 入力
- 出力
- 責務
- 様式固有部分
- 共通化可能部分
- 共通化すべきでない部分
- 現在の副作用
- エラー伝播
- fallback有無
- テスト有無

## 2. 共通Profile Verification Runner

現行の`verify-career-up-profile-driven.mjs`を基準に、共通Runnerへ切り出せる責務を調査してください。

最低限、以下を分類してください。

### 共通化候補

- ProfileRegistry初期化
- FormProfile登録
- MappingProfile登録
- Profile解決
- Adapter実行
- ExecutionContext生成
- Word generation呼出し
- Verifier実行
- 結果集約
- エラー制御
- 証跡出力
- legacy fallback禁止確認

### 様式固有として残す候補

- formId
- mappingId
- templatePath
- templateHash
- formVersion
- fieldDefinitions
- sample input
- output path
- adapter種別
- verifier設定
- manualCheck条件
- humanReview条件

以下を必ず判断してください。

1. 共通Runnerを関数・クラス・CLIのどれにするか
2. RunnerConfigの必要項目
3. 返却型
4. CLI wrapperとCoreの分離要否
5. RunnerがProfileRegistryを内部生成するか外部注入するか
6. Word generation関数を依存注入するか
7. テストで副作用を差し替え可能にする方法
8. 失敗時にWord生成を開始しない保証
9. legacy fallbackを呼ばない保証
10. 既存Runner互換性を維持する移行順序

## 3. Mapping Definition Registry

Phase 2-Dで見送ったMapping Definition Registryについて、必要性と導入時期を評価してください。

最低限、以下を比較してください。

### Option M1

```text
MappingProfileがfieldDefinitions実体を保持
```

### Option M2

```text
MappingProfileはdefinitionIdのみ保持
MappingDefinitionRegistryが実体を管理
```

### Option M3

```text
FormProfile / MappingProfile / Field Definitionを単一Profile packageとして管理
```

### Option M4

```text
JSON正本からlegacy互換mappingとProfile定義を生成
```

比較軸：

- 単一正本性
- 既存互換性
- 変更量
- テスト容易性
- 型安全性
- JSON互換性
- 実行時依存
- 初期化順序
- Registry責務
- 新規様式追加コスト
- legacy経路への影響
- 段階移行可能性
- 過剰設計リスク

## 4. 単一正本化ロードマップ

現状は以下です。

```text
legacyMapping
Profile JSON
```

この二重管理を解消するため、最低限3案を比較してください。

### 案S1

```text
Profile JSONを正本
↓
legacy互換mappingを生成
```

### 案S2

```text
共通Mapping Definitionを正本
├─> legacy wrapper
└─> Profile MappingProfile
```

### 案S3

```text
Registryを正本
├─> legacy adapter
└─> Profile adapter
```

各案について以下を記載してください。

- 正本
- 生成物
- runtime dependency
- build-time generation要否
- migration手順
- rollback方法
- legacy互換性
- drift防止方法
- 必須テスト
- 採用時期
- 不採用理由

最終的にPhase 2-E時点での推奨案を1つ選んでください。

ただし、Phase 2-Eでは実装しません。

## 5. 新規Wordテンプレート追加コスト

現在、新しい様式を1件追加する際に必要な工程を実コードから洗い出してください。

例：

- 原本配置
- SHA-256確認
- FormProfile
- MappingProfile
- field definition
- Adapter
- Runner
- Integration Test
- Verifier設定
- OutputVerifier
- DomSerializationVerifier
- sample data
- expected output
- manualCheck
- humanReview
- AI_Package更新
- Git証跡

各工程について以下を評価してください。

- 現在の作業量
- 重複作業
- human errorリスク
- 共通化可能性
- 自動化可能性
- Phase 2-E以降の削減方法
- 削減後も人間確認を残す箇所

## 6. 既存制約との整合性

以下を壊さない設計であることを明示してください。

- AI抽出後に人間確認
- manualCheck維持
- humanReview維持
- Verifier判定維持
- Legacy経路維持
- 自動fallback禁止
- Profile未解決時はWord生成未開始
- Mapping未解決時はWord生成未開始
- Adapter失敗時はWord生成未開始
- Template hash不一致時停止
- 出力互換性維持
- 新規様式追加時も既存様式へ副作用なし

## 必須設計成果物

次のファイルを新規作成してください。

```text
docs/AI/52_Gemini_Milestone5B_Phase2E_Architecture_Design.md
```

## 設計書の必須構成

以下の見出しを必ず含めてください。

```text
# Gemini設計報告：Milestone 5-B / Phase 2-E Architecture Design

## 1. Executive Summary

## 2. Current Architecture

## 3. Current Execution Flow

## 4. Responsibility Matrix

## 5. Common Profile Verification Runner Design

## 6. Runner API and Types

## 7. Runner Error Model

## 8. Mapping Definition Registry Options

## 9. Single Source of Truth Options

## 10. Recommended Target Architecture

## 11. Migration Roadmap

## 12. New Template Addition Cost Analysis

## 13. Required Tests

## 14. Compatibility and Rollback

## 15. Exact Next Implementation Scope

## 16. Out of Scope

## 17. Stop Conditions

## 18. Final Recommendation
```

## 必須のAPI案

実装はしませんが、最低限以下の型案を提示してください。

```ts
type ProfileVerificationRunnerConfig = {
  formProfile: FormProfile;
  mappingProfile: MappingProfile;
  adapter: ProfileAdapter;
  input: unknown;
  templatePath: string;
  outputPath: string;
  startWordGeneration: (...args: unknown[]) => Promise<unknown>;
  runVerifier: (...args: unknown[]) => Promise<unknown>;
};

type ProfileVerificationResult = {
  success: boolean;
  formId: string;
  mappingId: string;
  outputPath?: string;
  verification?: unknown;
  manualCheck: boolean;
  humanReview: boolean;
  errorCode?: string;
  errorMessage?: string;
};
```

この型案をそのまま採用する必要はありません。

実コードと既存型に適合するように修正し、修正理由を記載してください。

## 必須エラーモデル

最低限、以下のエラー分類を設計してください。

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
MANUAL_CHECK_REQUIRED
HUMAN_REVIEW_REQUIRED
```

各エラーについて以下を記載してください。

- 発生箇所
- Word生成開始可否
- retry可否
- fallback可否
- user-facing message要否
- log evidence
- test方法

`MANUAL_CHECK_REQUIRED`と`HUMAN_REVIEW_REQUIRED`を単純なsystem errorとして扱うべきか、success-with-review状態として扱うべきかも判断してください。

## 必須テスト設計

最低限、以下を設計してください。

### P1

- 正常系
- FormProfile未登録
- MappingProfile未登録
- Profile validation失敗
- Adapter解決失敗
- Adapter実行失敗
- Template hash不一致
- Word generation失敗
- Verifier失敗
- manualCheckあり
- humanReviewあり
- legacy fallback 0回
- 失敗時Word generation 0回

### P2

- 複数様式で同一Runnerを利用
- field definition drift検出
- legacy出力互換性
- deterministic output
- error code安定性
- dependency injection
- concurrent execution安全性

### P3

- Registry差替え
- generated legacy mapping
- template onboarding automation
- import graph検査

## Exact Next Implementation Scope

次の実装Phaseを、最大でも以下の粒度に限定して提案してください。

```text
- 共通Runner Coreの新規追加
- Career-up Profile-driven Runnerを薄いwrapperへ変更
- 既存テストを共通Runnerへ接続
- 新規様式追加は行わない
- Mapping Definition Registryはまだ実装しない
- 単一正本化はまだ実装しない
```

この範囲が不適切な場合は、より安全な最小範囲を提案してください。

## 過剰設計防止

以下をPhase 2-E実装対象に含めないでください。

- DB導入
- 外部API導入
- UI変更
- Practice Assistant V2画面接続
- 複数テンプレート一括移行
- legacy経路削除
- 自動migration
- code generation framework
- plugin architecture
- DI container導入
- 全Runner一括置換

## 変更対象

原則として新規作成を許可するのは以下のみです。

```text
docs/AI/52_Gemini_Milestone5B_Phase2E_Architecture_Design.md
```

本指示書をrepositoryへ配置した場合は以下も許可します。

```text
docs/AI/52_Gemini_Milestone5B_Phase2E_Architecture_Design_Instruction.md
```

上記以外の差分が発生した場合は停止してください。

## 検証

設計書作成後、以下を実行してください。

```bash
git diff --check
git status -sb
git diff --stat
git diff --name-only
git diff -- docs/AI/52_Gemini_Milestone5B_Phase2E_Architecture_Design.md
```

AI文書検証がある場合は実行してください。

```bash
npm run ai:verify
```

`docs/AI/06_Verification_Result.json`が動的に変更された場合は、内容を確認し、今回の成果物として不要ならstageせず元に戻してください。

## Git操作

全検証通過後のみ実施してください。

### stage

```bash
git add \
  docs/AI/52_Gemini_Milestone5B_Phase2E_Architecture_Design.md \
  docs/AI/52_Gemini_Milestone5B_Phase2E_Architecture_Design_Instruction.md
```

本指示書がrepository内に存在しない場合は、設計書のみstageしてください。

`git add .`は禁止です。

### staged差分確認

```bash
git diff --cached --check
git diff --cached --stat
git diff --cached --name-only
git diff --cached
```

### commit

```bash
git commit -m "docs: design phase 2e profile verification architecture"
```

### push

```bash
git push origin feature/milestone-5b-phase2c-career-up-integration
```

### 最終確認

```bash
git status -sb
git log -2 --oneline
git rev-parse HEAD
```

## 完了条件

以下をすべて満たした場合のみ完了としてください。

- 現行実行フローを実コードに基づき記録
- 共通Runnerの責務を定義
- Runner API案を定義
- エラーモデルを定義
- Mapping Definition Registry案を比較
- 単一正本化案を比較
- 推奨Target Architectureを決定
- 移行ロードマップを定義
- 新規テンプレート追加コストを分析
- 次実装Phaseの最小範囲を提示
- 実装コードを変更していない
- `git diff --check` PASS
- `ai:verify` PASS
- 対象限定commit
- push成功
- working tree clean

## 停止条件

以下の場合はcommit・pushせず停止してください。

1. working treeがcleanではない
2. HEADがPhase 2-D記録commitと一致しない
3. 現行実装フローを確認できない
4. 既存型とAPI案の整合性を判断できない
5. legacy経路への影響を限定できない
6. 共通Runnerの責務境界を定義できない
7. 自動fallbackなしを保証できない
8. 次実装Phaseが複数の大規模変更を含む
9. 設計書以外に予期しない差分が発生
10. `git diff --check`失敗
11. `ai:verify`失敗

## 完了報告

以下を簡潔に報告してください。

1. 作成した設計書パス
2. 現行アーキテクチャの要約
3. 推奨共通Runner構成
4. 推奨Runner API
5. 推奨エラーモデル
6. Mapping Definition Registryの判定
7. 単一正本化の推奨案
8. 新規テンプレート追加コストの主要課題
9. 次実装Phaseの最小範囲
10. `ai:verify`結果
11. `git diff --check`結果
12. commit hash
13. push結果
14. 最終`git status -sb`
15. 残存リスク
