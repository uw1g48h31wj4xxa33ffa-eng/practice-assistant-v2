# Gemini指示書：Milestone 5-B / Phase 2-D 事前調査・設計

## 目的

Phase 2-Dの実装前に、Profile-driven基盤の現状を調査し、Registryの`legacyMapping.fields`依存を解消するための設計案を作成してください。

本指示書では、**調査・設計・影響範囲確認のみ**を行います。実装、既存コード変更、commit、pushは行わないでください。

## 最重要ルール

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

- 実装しないでください。
- 既存コードを変更しないでください。
- 自動修正、リファクタリング、ファイル移動、名称変更をしないでください。
- 未確認事項を事実として断定しないでください。
- 既存のlegacy経路を廃止する前提で設計しないでください。
- Phase 2-Cで確立した「自動legacy fallbackなし」を維持してください。
- 調査結果は証拠となるファイルパス、型名、関数名、参照関係を明記してください。
- 重大な不明点や矛盾がある場合は設計を確定せず、停止条件として報告してください。

## 対象ブランチ

```text
feature/milestone-5b-phase2c-career-up-integration
```

## Phase 2-Dの想定目的

Phase 2-Dでは、現在のProfile-driven verification pathを、Career-up専用の配線から共通基盤へ発展させます。

主な検討対象：

1. Registryの`legacyMapping.fields`依存解消
2. Profile DefinitionとMapping責務の明確化
3. Profile Resolverの共通API化
4. Profile-driven Verification Runnerの共通化
5. 新規Profile追加時の変更箇所最小化
6. 既存Career-up経路とlegacy経路の互換性維持

## 前提として維持する事項

- Phase 2-Cは完了済み
- Profile解決成功後にのみWord生成へ進む
- Profile解決失敗時はエラーを伝播する
- 自動legacy fallbackは行わない
- 既存legacy検証スクリプトは変更していない
- Phase 2-Cの統合テストでは、Word生成未呼出しとlegacy fallback未呼出しをspyで確認済み
- プロジェクト全体Lintには既存ベースラインがある
  - Error 56件
  - Warning 23件
- Phase 2-D対象ファイルへの新規Lint問題は許容しない

## 調査対象

最低限、以下を確認してください。

### A. Profile Definition

- Profileの型定義
- Profileが保持する情報
- Field定義の所在
- Template、Mapping、Verifierとの関係
- Profile単独でWord生成に必要な情報が揃うか

### B. Registry

- Registryの型定義
- 登録データ構造
- `legacyMapping.fields`参照箇所
- RegistryがlegacyMappingへ依存している理由
- RegistryからlegacyMapping依存を外した場合の影響範囲

### C. Mapping

- legacyMappingとProfile側Mappingの役割
- field ID、Word token、transform、validation等の責務
- 重複情報の有無
- 移行時に正本とすべき情報

### D. Resolver

- 現在のProfile Resolverの公開API
- Career-up固有処理の有無
- 共通化可能な部分
- エラー型と失敗条件
- Registry未登録時、Profile未登録時、Mapping不整合時の挙動

### E. Verification Runner

- `verify-career-up-profile-driven.mjs`の責務
- Career-up固有処理
- 共通Runnerへ切り出せる処理
- CLI引数または依存注入の必要性
- テスト容易性
- legacy scriptとの境界

### F. Test

- 現在のProfile関連テスト一覧
- Phase 2-C統合テストの検証範囲
- 共通化後に必要な成功・失敗テスト
- 既存テストを壊す可能性
- 完全なProfile独立性を証明するために不足しているテスト

## 必須確認コマンド

最初に以下を実行してください。

```bash
git branch --show-current
git status -sb
git log -3 --oneline
```

次に、該当ファイルを検索・参照してください。検索方法は任意ですが、最低限以下の語を調査してください。

```text
legacyMapping.fields
Profile
ProfileRegistry
resolveProfile
verify-career-up-profile-driven
mapping
registry
```

必要に応じて以下を使用してください。

```bash
rg -n "legacyMapping\.fields|ProfileRegistry|resolveProfile|verify-career-up-profile-driven|registry|mapping" src scripts
find src/profiles scripts/document-verification -maxdepth 4 -type f | sort
```

## 成果物

次のファイルを新規作成してください。

```text
docs/AI/48_Gemini_Milestone5B_Phase2D_PreImplementation_Investigation.md
```

## 成果物の必須構成

### 1. Executive Summary

- Phase 2-Dで解決すべき問題
- 現状の主要依存
- 推奨する最小変更方針
- 実装可否
- 停止条件の有無

### 2. Current Architecture

以下を具体的なファイル・型・関数単位で記載してください。

- Profile
- Registry
- Mapping
- Resolver
- Verification Runner
- Word generation
- Legacy path
- Tests

依存関係をテキスト図で示してください。

例：

```text
Profile Registry
  -> legacyMapping.fields
  -> Profile Resolver
  -> Word Generation
```

実際のコードに基づいて修正してください。

### 3. Confirmed Dependency on legacyMapping.fields

- 参照ファイル
- 参照行または周辺コード
- 依存理由
- 依存を除去した場合の影響
- 単なる配線依存か、データモデル依存か

### 4. Responsibility Matrix

次の責務を、どの層が持つべきか整理してください。

| Responsibility | Current Owner | Proposed Owner | Reason |
|---|---|---|---|
| Field definition | | | |
| Word token mapping | | | |
| Transform | | | |
| Validation | | | |
| Template selection | | | |
| Profile resolution | | | |
| Verification execution | | | |

### 5. Design Options

最低3案を比較してください。

#### Option A: Profileにfield定義を完全内包
#### Option B: Profileから独立したMapping DefinitionをRegistryで参照
#### Option C: Adapter層でlegacyMappingを段階的に変換

各案について以下を記載してください。

- 概要
- 変更ファイル
- 利点
- 欠点
- 既存互換性
- テスト容易性
- 移行コスト
- 将来のテンプレート追加コスト
- 推奨度

### 6. Recommended Design

推奨案を1つ選び、理由を説明してください。

推奨設計は以下を満たす必要があります。

- Registryが直接`legacyMapping.fields`へ依存しない
- legacy経路を破壊しない
- 自動fallbackを追加しない
- 新規Profile追加時の既存コード変更を最小化
- Profile、Mapping、Template、Runnerの責務が明確
- テストでProfile独立性を証明可能
- 過剰な共通化を避ける
- Phase 2-D内で完了可能な最小スコープ

### 7. Proposed API and Types

実装候補となる型・APIを疑似コードで示してください。

例：

```ts
type ProfileRegistryEntry = {
  profileId: string;
  templateId: string;
  mappingId: string;
};

type MappingDefinition = {
  fields: FieldMapping[];
};

resolveProfile(profileId): ResolvedProfile
runProfileVerification(resolvedProfile, input): VerificationResult
```

実際の既存型に合わせて提案してください。実装はしないでください。

### 8. File Change Plan

想定変更ファイルを分類してください。

- 新規
- 変更
- 変更不要
- 絶対に変更しない

各ファイルについて、変更理由と影響範囲を記載してください。

### 9. Test Plan

最低限、以下を含めてください。

- 正常系
- Registry未登録
- Profile未登録
- Mapping未登録
- ProfileとMappingのfield不整合
- Word生成未呼出し
- legacy fallback未呼出し
- 既存legacy検証の回帰
- Career-up既存出力の互換性
- Profile独立性の証明

### 10. Risks and Stop Conditions

以下を明記してください。

- データモデル二重管理
- ProfileとMappingの責務重複
- 既存テンプレート破壊
- field ID互換性
- Runtime import循環
- Testが配線互換性しか証明しない危険
- lintベースラインとの混同
- スコープ肥大化

停止条件を明示してください。

### 11. Proposed Phase 2-D Scope

Phase 2-Dで実装するものと、次フェーズへ送るものを分離してください。

#### Phase 2-Dに含める
#### Phase 2-Dに含めない
#### 将来候補

### 12. Implementation Gates

実装時のGateを次の順序で定義してください。

```text
Gate 1: 状態確認
Gate 2: 型・Registry設計
Gate 3: 最小実装
Gate 4: Unit / Integration Test
Gate 5: legacy回帰確認
Gate 6: build / ai:verify / lint差分確認
Gate 7: Git差分監査
Gate 8: commit / push
```

### 13. Final Recommendation

最後に以下を明確に記載してください。

- 実装開始可否
- 推奨案
- 推奨実装順序
- Claude監査が必要か
- 追加確認が必要な事項
- 次のGemini指示書に含めるべき項目

## 完了時の確認

成果物作成後、以下を実行してください。

```bash
git diff --check
git status -sb
git diff -- docs/AI/48_Gemini_Milestone5B_Phase2D_PreImplementation_Investigation.md
```

## 禁止事項

- commit
- push
- 実装コード変更
- テスト期待値変更
- legacy経路削除
- 自動fallback追加
- 未調査内容の断定
- 指示範囲外のファイル変更

## 完了報告

以下を簡潔に報告してください。

1. 調査した主要ファイル
2. `legacyMapping.fields`依存の実態
3. 推奨設計案
4. 想定変更ファイル
5. 主要リスク
6. 実装開始可否
7. 成果物パス
8. 最終`git status -sb`
