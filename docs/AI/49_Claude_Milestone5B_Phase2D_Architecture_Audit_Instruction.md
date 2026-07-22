# Claude監査指示書：Milestone 5-B / Phase 2-D 設計監査

## 目的

Geminiが作成したPhase 2-D事前調査・設計について、アーキテクチャ上の妥当性を監査してください。

特に、以下の論点を重点確認してください。

- `legacyMapping.fields`依存をどの層で解消すべきか
- Profile側field定義を単一正本として持つ構成が妥当か
- RunnerやテストへJSONを直接複製する案を避けるべきか
- legacy経路を維持しながらProfile独立性を高める最小実装は何か
- Phase 2-Dとして実装すべき範囲と、次フェーズへ送る範囲

## 最重要ルール

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

- 実装しないでください。
- 既存コードを変更しないでください。
- commit、pushをしないでください。
- 推測ではなく、実際のコードと設計報告を根拠に判断してください。
- 不明点を断定しないでください。
- 既存legacy経路の削除を前提にしないでください。
- 自動legacy fallbackを追加する案は採用しないでください。
- 過剰な共通化や大規模リファクタリングを推奨しないでください。
- Phase 2-Dで完了可能な最小変更を優先してください。

## 読み込む対象

最低限、以下を確認してください。

```text
docs/AI/48_Gemini_Milestone5B_Phase2D_PreImplementation_Investigation.md
docs/AI/48_Gemini_Milestone5B_Phase2D_PreImplementation_Investigation_Instruction.md
scripts/document-verification/verify-career-up-profile-driven.mjs
src/profiles/tests/profile-driven-career-up-integration.test.ts
src/profiles/types/mapping-profile.ts
src/profiles/registry/profile-registry.ts
src/profiles/resolution/profile-resolver.ts
src/profiles/resolution/adapter.ts
scripts/document-verification/config/career-up-r8-form1.mapping.mjs
scripts/document-verification/verify-career-up-form1.mjs
```

必要に応じて関連ファイルも確認してください。

## 現在の主要論点

GeminiはOption Aとして、Profileへfield定義を完全内包する案を推奨しました。

ただし、その具体案には以下が含まれていました。

```text
verify-career-up-profile-driven.mjsへfield定義JSONを直接記述
profile-driven-career-up-integration.test.tsへ同じfield定義JSONを直接記述
```

この案では、次の問題が懸念されています。

- `legacyMapping`
- Profile Runner
- Integration Test

の最大3か所でfield定義が重複する可能性があります。

これに対し、現在の暫定推奨案は次のとおりです。

```text
Profile用field定義を独立した単一正本ファイルとして新設
    ↓
MappingProfileが参照
    ↓
Resolver / Adapter
    ↓
Verification Runner
    ↓
Integration Testも同じ定義を参照
```

legacy経路は既存の`legacyMapping`をそのまま維持します。

一時的には以下の2系統が残ります。

```text
legacy用正本
Profile用正本
```

両者の一致は比較テストで保証する案です。

## 監査してほしい選択肢

### Option A1：RunnerとTestへ直接JSONを複製

- Gemini初期案
- Profile独立性は示せる
- ただし3重管理の危険がある

### Option A2：Profile用field定義を独立した単一正本ファイルにする

- RunnerとTestは同じProfile定義を参照
- legacyMappingとは一時的に2系統
- 比較テストで差異を検出
- 将来的な統合は別フェーズ

### Option B：独立したMapping Definition Registryを導入

- ProfileはmappingIdのみ保持
- ResolverがMapping Definitionを解決
- 責務分離は明確
- ただしPhase 2-Dとしては変更範囲が広い可能性

### Option C：Adapter層へlegacyMapping依存を移す

- Runnerから依存は消える
- 二重管理は避けられる
- ただしProfile独立性は成立しない

## 必須監査項目

### 1. Gemini調査結果の正確性

以下を確認してください。

- `ProfileRegistry`自体は`legacyMapping`へ依存していないか
- 実際の依存主体はRunnerとTestか
- `CareerUpAdapter`はProfileの`fieldDefinitions`をどのように使用しているか
- 依存は配線依存か、データモデル依存か
- Gemini報告に見落としや誤認がないか

### 2. field定義の正本

以下を判断してください。

- Profile側field定義の正本をどこに置くべきか
- Runner内ハードコードを許容すべきか
- Test内ハードコードを許容すべきか
- Profile DefinitionとMapping Definitionを分離すべきか
- 現在の型構造で単一正本化できるか

### 3. 二重管理リスク

以下を評価してください。

- legacyMappingとProfile用定義の2系統を一時許容できるか
- 比較テストで十分に管理できるか
- field ID、locator、validation、transform等のどこまで一致確認すべきか
- JSONシリアライズ比較で十分か
- 関数や正規表現等を含む場合の比較方法
- 二重管理を許容する期間と解消条件

### 4. Profile独立性の定義

以下を明確化してください。

- RunnerがlegacyMappingをimportしなければ独立といえるか
- AdapterがlegacyMappingをimportしている場合は独立といえるか
- legacyMappingとの比較テストが存在しても独立性を損なわないか
- 「配線独立」と「データ正本独立」を分けるべきか

### 5. 最小実装範囲

Phase 2-Dで実装すべき最小範囲を定義してください。

最低限、以下を判断してください。

- 新規Profile field definitionファイルの要否
- MappingProfile型変更の要否
- Registry変更の要否
- Resolver変更の要否
- Adapter変更の要否
- Runner変更の要否
- Integration Test変更の要否
- Legacy比較テストの要否
- 共通Runner化を今回含めるべきか

### 6. テスト設計

最低限、以下を評価してください。

- Profile定義だけで正常実行
- RunnerにlegacyMapping importがないこと
- Profile未登録
- Mapping未登録
- field不整合
- Word生成未呼出し
- legacy fallback未呼出し
- legacy経路回帰
- legacyMappingとProfile定義の一致
- Career-up出力互換性
- テストが単なる自己確認になっていないこと

### 7. 将来構造

次のどちらが妥当か判断してください。

```text
A. Profileがfield定義を保持する
B. ProfileはmappingIdを保持し、Mapping Definitionがfield定義を保持する
```

ただし、Phase 2-Dでは将来構造を全部実装する必要はありません。

今回の最小実装と将来の理想構造を分けてください。

## 成果物

次のファイルを新規作成してください。

```text
docs/AI/49_Claude_Milestone5B_Phase2D_Architecture_Audit.md
```

## 成果物の必須構成

### 1. Executive Verdict

以下を明確に記載してください。

- Gemini案を承認、条件付き承認、却下のいずれか
- 推奨Option
- Phase 2-D実装開始可否
- 重大停止条件

### 2. Findings

- 正しかった点
- 不正確だった点
- 見落とし
- 技術的リスク
- 過剰設計の有無

### 3. Source-of-Truth Decision

field定義の正本をどこに置くべきか判断してください。

次の表を作成してください。

| Data | Current Source | Phase 2-D Source | Future Source | Reason |
|---|---|---|---|---|
| Field definition | | | | |
| Locator | | | | |
| Validation | | | | |
| Transform | | | | |
| Template selection | | | | |
| Profile metadata | | | | |

### 4. Option Comparison

A1、A2、B、Cを比較し、推奨順位を付けてください。

### 5. Recommended Phase 2-D Architecture

具体的な依存関係をテキスト図で示してください。

### 6. Exact Phase 2-D Scope

以下に分類してください。

- 変更する
- 新規作成する
- 変更しない
- 次フェーズへ送る
- 禁止する

### 7. Required Tests

必要なテストを優先度順で示してください。

### 8. Stop Conditions

実装中に停止すべき条件を具体化してください。

### 9. Final Instruction for Gemini

次のGemini実装指示書へそのまま転記できる粒度で、実装方針を簡潔にまとめてください。

## 完了時確認

以下を実行してください。

```bash
git diff --check
git status -sb
git diff -- docs/AI/49_Claude_Milestone5B_Phase2D_Architecture_Audit.md
```

## 禁止事項

- 実装
- 既存コード変更
- commit
- push
- legacy経路削除
- 自動fallback追加
- RunnerまたはTestへのfield定義直接複製を無条件承認
- 根拠のない大規模リファクタリング提案

## 完了報告

以下を簡潔に報告してください。

1. Gemini案の判定
2. 推奨Option
3. field定義の正本
4. Phase 2-Dの最小変更範囲
5. 必須テスト
6. 停止条件
7. 成果物パス
8. 最終`git status -sb`
