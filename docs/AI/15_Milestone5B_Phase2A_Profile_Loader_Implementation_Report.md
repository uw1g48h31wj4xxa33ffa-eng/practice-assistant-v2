# Milestone 5-B Phase 2-A 実装報告書

**Status:** 実装およびテスト完了
**Date:** 2026-07-18

---

## 1. 実装概要
Phase 2-A のスコープである `ProfileLoader` の新規実装、それに伴う型拡張とエラー定義、および Profile 間の参照検証（Cross-Profile Reference Validation）を実装しました。また、設計判断に従い `FormProfile` スキーマの参照フィールド名を統一しました。

## 2. 変更ファイル
- `src/profiles/types/form-profile.ts`: `mappingId` → `mappingProfileId`, `verifierConfigId` → `verificationRuleProfileId` へ統一修正。
- `src/profiles/schemas/form-profile.schema.json`: 上記に同じ。
- `src/profiles/fixtures/synthetic-profiles.json`: スキーマ変更に合わせてテストデータのキーを更新。
- `src/profiles/registry/profile-registry.ts`: `ProfileLoader` から全件走査するための `listAll()` メソッドを追加。
- `src/profiles/registry/version-registry.ts`: 上記に同じ。
- `src/profiles/index.ts`: `ProfileLoader` の export を追加。

## 3. 新規ファイル
- `src/profiles/registry/profile-loader.ts`: `ProfileLoader`, `ProfileLoadError`, `ReferenceError`, `ProfileLoadReport` を実装。
- `src/profiles/tests/profile-loader.test.ts`: `ProfileLoader` の各種挙動（正常系、異常系）の検証テスト。

## 4. Loaderの責務と参照検証仕様
- **責務**: 指定されたディレクトリ（サブディレクトリ含む）を再帰的に走査し、すべての `.json` ファイルを抽出。構文解析、スキーマ検証を行いつつ `ProfileRegistry` へ登録。すべてのエラーを握りつぶさずに `ProfileLoadReport` へ集約します。
- **参照検証**: すべてのファイルをロード・登録した直後に一括検証を実施します（設計判断の案A）。
  - `FormProfile` -> `mappingProfileId`, `verificationRuleProfileId`
  - `MappingProfile` -> `formProfileId`
  - `DocumentVersionProfile` -> `lawProfileId`, `formProfileId`, `mappingProfileId`
  - 存在しない Profile、または想定外の Profile 種別（Type Mismatch）を参照している場合、エラーとして `referenceErrors` に追加されます。

## 5. 既存Registryとの接続方法と後方互換性
- `ProfileLoader` は `ProfileRegistry` のインスタンスをコンストラクタで受け取り、内部で `.register()` を呼び出します。
- 既存の `VersionRegistry` や `ProfileRegistry` の振る舞いは一切変更しておらず、既存のテストも全て通るため、後方互換性は維持されています。
- Resolver や Adapter の先行実装は行っていません。

## 6. 検証結果
- **Phase 2-A 単体テスト (`profile-loader.test.ts`)**: 成功 (7 passing)
  - 単一/複数プロファイル読み込み、JSON Parseエラー、Schema不一致エラー、重複登録エラー、参照欠損エラー、参照種別不一致エラーを全てカバレッジ済み。
- **既存Profile関連テスト**: 全て成功
- **`npm run build`**: 成功
- **`changed-files lint`**: 成功（変更・追加ファイルでの新規エラー/警告ゼロ）
- **既存Lintエラーとの差分**: なし（全体Lintで出力されるものはすべて着手前からの既存エラーであり、Phase 2 のスコープ外です）

## 7. Git状態
- `git status --short` 上では指定されたファイルのみが変更・未追跡ファイルとして認識されています。
- 不要なstageや指示範囲外のファイル変更はありません。
- 人間による明示的承認がないため Commit, Push 等は実行していません。

## 8. Stop Condition判定
- **該当なし**: 参照文書間の矛盾なし。調査報告書の通りに実装可能でした。既存互換性の破壊や範囲外の実装などもありません。

## 9. 未解決事項・推奨する次の作業
- **未解決事項**: 特になし。
- **Commit可否**: **可** (対象ファイルをstageしてcommit可能です)。
- **Phase 2-B 開始可否**: **可** (Phase 2-A の検証が完了したため、次の Phase 2-B である `ProfileResolver` と `Execution Context Builder` の実装へ進む準備が整っています)。
- **次の作業**:
  1. 本報告の内容およびコードのレビュー
  2. 人間側での Commit & Push 実行、またはGeminiへの Commit & Push の指示
  3. Phase 2-B 実装指示書の受領
