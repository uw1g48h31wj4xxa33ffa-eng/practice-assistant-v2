# Phase 3-B Design Report

## 目的
`WordGenerationApplicationService` および API Route を `ProfileVerificationRunner` へ完全移行し、レガシーなマッピングオブジェクト（`hatarakikataR8Form1Mapping` 等）への直接依存を排除する。同時に、各検証スクリプトおよびサービスクラスで重複しているWord文書生成と検証処理（コールバック）を再設計・共通化する。

## 設計の詳細と実装結果

### 1. 共通生成・検証コールバックの抽出 (全様式共通の生成コールバック再設計)
- **ファイル**: `src/lib/document-generation/profile-word-generator.ts` (新規作成)
- **内容**: 
  - `verify-career-up-profile-driven.mjs` 等にハードコードされていた `startWordGenerationCb` と `runVerifierCb` のロジックを抽出・汎用化。
  - `ExecutionContext` を受け取り、内部でアダプター (`CareerUpAdapter`相当の処理) を通じて `mapping` に変換、`WordDocument` を用いて文書を生成・保存する共通の関数をエクスポートする構成に。
  - プロファイルの `locator.type` に対して、`next-row-continuation-cell` や `same-cell` などのパターンを追加実装し、複数の様式でのWord生成を汎用的にカバーできるようにした。

### 2. Application Serviceの移行
- **ファイル**: `src/lib/document-generation/application-service.ts`
- **内容**:
  - `DocumentInputAdapter` への依存を残しつつも、生成の中核ロジックを `ProfileVerificationRunner` へ移行。
  - `ProfileRegistry` を初期化し、`orchestrateProfileGeneration` 相当のフローを実装。
  - `ProfileWordGenerator` のコールバックを使用し、結果を `GenerationResult` フォーマットへ変換して返却する構成とした。これにより、API Route側の変更は最小限に抑えつつ、内部はProfile駆動で動作するようになった。

### 3. 検証スクリプトの依存排除
- **ファイル**: `verify-hatarakikata-r8-profile-driven.mjs` および `verify-career-up-profile-driven.mjs`
- **内容**:
  - 重複していた生成処理を削除。
  - `ProfileWordGenerator.createStartWordGenerationCallback` と `createRunVerifierCallback` を呼び出す形に一元化。

### 4. モジュール解決の最適化
- **内容**:
  - Next.js (Turbopack) のビルドプロセスにおいて、`.ts` ファイル内の相対パス解決で `.js` 拡張子が指定されているとModule Not Foundエラーが発生する問題を解消するため、関連ファイルのインポートから `.js` を削除した。

## 期待される効果
- Application Service がレガシーなマッピング定義から完全に切り離された。
- 新しいプロファイル（様式）を追加する際、JSONプロファイルの定義とProfileRegistryへの登録のみで完結し、コードの改変が不要になる（プラグインアーキテクチャの実現）。
- 生成・検証ロジックの一元化により、変更漏れやバグのリスクを大幅に削減。
