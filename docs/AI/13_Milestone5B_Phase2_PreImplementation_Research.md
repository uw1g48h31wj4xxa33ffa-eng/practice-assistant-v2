# Milestone 5-B Phase 2
# Pre-Implementation Research Report

**Status:** Research Completed<br>
**Date:** 2026-07-18<br>

---

## 1. 調査対象
- Phase 1で構築されたProfile Schema、Types、Registry群
- Document Engine / Verification Scriptの既存実装 (`verify-career-up-form1.mjs` 等)
- Milestone 5-B Phase 2 設計要件 (`docs/AI/12_Milestone5B_Phase2_Design_Scope_Stop_Conditions.md`)

---

## 2. 現状構造と再利用可能な既存実装
- **Profile Types / Schema**: 全7種の型とAJV 2020-12の厳格な検証ロジックが完成している (`ProfileValidator`)。
- **Registry / Version Registry**: ID・バージョンの登録と、`effectiveDate`に基づくActiveバージョンの解決機能(`resolveActive`)が実装済みであり、Resolverの基礎として完全に再利用可能。

---

## 3. 不足している構造
- **Profile Loader**: ディレクトリ（例: `src/profiles/fixtures` または新規ディレクトリ）から複数JSONファイルを読み込み、パース・一括検証・一括登録を行う機構が未実装。
- **Cross-Profile Reference Validator**: プロファイル間の参照関係（IDと有効期間の一致）を登録後に検証するロジック。
- **Profile Resolver & Execution Context Builder**: `resolveActive` をラップして、関連する全Profile（Form, Mapping, Law等）を連鎖的に引き当て、イミュータブルな `ExecutionContext` へ変換する機構。
- **Adapter**: `ExecutionContext` を既存の Document Engine（`careerUpR8Form1Mapping` 形式）へ変換するブリッジ層。

---

## 4. 既存Interfaceとの整合性と Career-Up Form 統合可否
**Career-Up Form 統合可否：可能（条件付き推奨）**
- **現状**: `verify-career-up-form1.mjs` や `document-engine.test.mjs` 等で `career-up-r8-form1.mapping.mjs` という静的設定ファイルが直接Importされている。
- **統合アプローチ**: 既存の静的設定（レガシーパス）を破壊せず、新たに「`ProfileLoader` と `Resolver` を経由して動的に生成した `ExecutionContext` を `careerUpR8Form1Mapping` 互換オブジェクトへ変換するAdapter」を作成することで、安全に統合可能。これにより、Word Engine / Document Engine 本体のロジックを一切書き換えることなく検証が行える。

---

## 5. Profile間参照フィールド（変更候補と不足フィールド）
- 現在、`FormProfile` に `mappingId`, `verifierConfigId` が存在。
- `DocumentVersionProfile` に `formProfileId`, `lawProfileId`, `mappingProfileId` が存在。
- **課題**: `WorkflowProfile` や `VerificationRuleProfile` のスキーマは、現在 `steps` や `rules` の内部（`Record<string, unknown>`）に参照を持つ構造となっており、汎用的なValidatorが参照を静的に抽出しにくい。また、命名規則が揺れている（`mappingId` vs `mappingProfileId`）。
- これらは設計判断フェーズで、Validatorがどのようにフィールドを特定するか（規約ベースか、明示的な型定義変更か）を決める必要がある。

---

## 6. Word Engine／Document Engine への影響範囲と後方互換性
- 前述のAdapterを境界（Boundary）として設けることで、**影響範囲をゼロに抑える**ことが可能。
- 既存のテストスクリプト（レガシーパス）は維持したまま、新ルートのテストケースを追加することで後方互換性が担保される。

---

## 7. Stop Condition 判定
**該当なし（安全に進行可能）**
- Phase 1 の構造に重大な矛盾なし。
- Word Engine等への副作用はAdapter境界により回避可能。
- 必須テスト経路は明確 (`ai:verify` の出力検証スクリプト)。

---

## 8. 設計判断が必要な項目 (フェーズ開始前)

以下の4項目について設計案と推奨案を整理しました。

### 1. Loaderの仕様 (ソースディレクトリ位置、エラー発生時の挙動)
- **設計案A**: エラー即時停止（Fail Fast）。無効なJSONやスキーマ違反を見つけ次第throwしてロード処理を中断する。
  - **メリット**: 実装が単純。早期に異常終了するため、問題の発生箇所が単一の場合はデバッグが容易。
  - **デメリット**: 複数ファイルに問題がある場合、1つ直すたびに再度実行しなければ次のエラーが分からない。
- **設計案B**: 全件収集・一括報告。全ファイルを一旦ロード・検証し、発生したエラーをすべて集約してから最終的にthrowまたはレポート出力する。
  - **メリット**: 一度の実行で全エラーを把握でき、Profile定義の修正・開発効率が高い。
  - **デメリット**: 収集や報告用のエラーデータ構造（Error Aggregation）の実装が若干複雑になる。
- **推奨案**: **設計案B**
- **推奨理由**: 今後Profile数が数十・数百と増加していく運用を考慮すると、検証エラーを一度にフィードバックできる全件収集型のほうが圧倒的に運用保守性が高いため。
- **将来的な拡張性への影響**: 外部ツールや管理UIへ、構造化された「検証結果リスト」としてそのまま受け渡しやすくなります。

### 2. 参照検証のタイミング
- **設計案A**: Loaderでの全件登録直後に一括検証。
  - **メリット**: ロード完了時点でシステム全体のProfile整合性が確定するため、実行時の参照エラー（Missing Profile等）を確実に予防できる。
  - **デメリット**: アプリ起動時（ロード時）に全参照を走査するため、将来的にProfileが数千規模になった際に起動時間が微増する可能性がある。
- **設計案B**: Resolver呼び出し時に遅延検証（Lazy Validation）。
  - **メリット**: 使われる分だけを検証するため起動時の無駄がない。
  - **デメリット**: 実行時に初めて「参照先のProfileが欠損している」などの致命的エラーが発覚するリスクがあり、安全性が低い。
- **推奨案**: **設計案A**
- **推奨理由**: Phase 2では安全な Execution Context を提供することが主目的であり、「実行時の予期せぬ障害」を未然に防ぐ早期フェイルのほうが設計として堅牢であるため。
- **将来的な拡張性への影響**: 起動時の一括検証コストが許容できなくなった将来フェーズにおいて、必要に応じて遅延検証へリファクタリングすることは容易です。

### 3. スキーマの参照フィールド名
- **設計案A**: 現状のまま（`mappingId`, `verifierConfigId`等）維持し、Reference Validator側に固有の探索規約（ハードコードされたフィールドリスト）を持たせる。
  - **メリット**: 既存のSchemaやType定義を変更しなくて済む。
  - **デメリット**: 新しいProfile型を追加するたびにValidator側のコードも修正する必要があり、DRY原則に反する。
- **設計案B**: 命名規則を統一（例: `mappingProfileId`, `verificationRuleProfileId` 等）するよう、SchemaとType定義を微調整する。
  - **メリット**: フィールド名から「参照先がProfileであること」が自明となり、型の安全性が向上する。将来的に動的探索などの汎用化がしやすい。
  - **デメリット**: 既に作成した Schema, Type, Fixtures などの一部修正作業が発生する。
- **推奨案**: **設計案B**
- **推奨理由**: まだ本格稼働前である現在のフェーズが、一貫した命名規則へ是正する最良のタイミングであるため。
- **将来的な拡張性への影響**: 将来的に汎用的なグラフ走査（Profile依存関係の自動解決・可視化）などを導入する際に、メタデータ解析の基盤として非常に有利に働きます。

### 4. Adapterの実装位置
- **設計案A**: Verification Script側（`verify-career-up-form1.mjs`側）にAdapter層を注入する。
  - **メリット**: Document Engine本体の既存ロジックを一切汚染しないため、本体への影響範囲・副作用リスクが確実に「ゼロ」になる。
  - **デメリット**: Script側のアダプター記述が少し厚くなる。
- **設計案B**: Document Engine内部に、ExecutionContextを受け取る新ルートを直接実装する。
  - **メリット**: 最終的な本番アーキテクチャに近い形での検証が可能になる。
  - **デメリット**: 既存のレガシーテスト等で未知の副作用（Regression）を引き起こすリスクがある。
- **推奨案**: **設計案A**
- **推奨理由**: 指定されたStop Condition「Word Engine／Document Engineへの影響」を完全に回避しつつ、安全にProfile由来データの等価性を証明できるため。
- **将来的な拡張性への影響**: 後続のフェーズで本番側の移行準備が整った際に、このAdapterの実装をそのまま本番Engine側のファサードとして流用することが可能です。

---

## 9. Lintエラーに関する事前整理
現在 `npm run lint` や `ai:verify` 実行時にコンソールに出力されるエラーについて以下の通り整理・宣言します。
- **既存エラーであること**: 現在発生している `@typescript-eslint/no-explicit-any` や `react-hooks/set-state-in-effect` などのエラー・警告は、本Phase着手以前から既存コードベース（Hooksや既存のe2eテストファイル等）に存在しているものです。
- **Phase2での修正対象外**: これらの既存エラーの解消は、Milestone 5-B Phase 2の対象スコープ外として扱います。
- **今回の変更に起因しない**: 今後の実装によって発生するエラーがないか（Changed Files Lintでゼロ件であること）を検証基準とします。

---

## 10. 実装の一括／分割可否と推奨順序 (Phase 2-A スコープ明確化)
リスク極小化のため、一括実装を避け、段階的な実装を行います。

### Phase 2-A (今回実装対象)
- **対象**: `ProfileLoader` (ファイル走査、ロード、および設計判断2に基づくCross-Profile Reference Validatorの組み込み)

### Phase 2-B 以降 (今回実装対象外)
- **対象外**: `ProfileResolver`
- **対象外**: `Execution Context Builder`
- **対象外**: `Adapter` (Career-Up Form向け)

上記の範囲限定により、まずはLoader基盤の安全性と既存システム非破壊性のみを独立して担保します。

---

## 11. 根拠・Git状態
- **調査元ファイル**:
  - `src/profiles/types/*.ts`
  - `scripts/document-verification/verify-career-up-form1.mjs`
  - `src/profiles/tests/profile-registry.test.ts`
- **現在のGit状態**: Clean (未追跡ファイルは要件に従い調査から除外)
- 未追跡の `docs/AI/03_AI_Collaboration_Governance_Commit_Report.json` はコードベースに一切影響を与えないことを確認。
