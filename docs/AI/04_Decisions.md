# Decisions

今回確定した設計判断は以下の通りです。

- verified / modifiedのみ出力
- unverified / rejectedは除外
- manualCheck / humanReviewは人間確認前に解除しない
- POSTでDTO返却、GETでdownloadId取得
- Verifier失敗時はdownloadIdを返さない
- MarkdownをAI間連携の正本とする
- AIによる検証結果は機械生成JSON (`06_Verification_Result.json`) を正とする
- Gate判定は Required Gates と Informational Gate に分離し、Required Gates が全件成功した場合のみ `overallResult: Passed` とする
- 全体lintエラーは Informational Gate (PreExistingFailed) とし、今回変更由来のlintエラーのみ Required Gate とする
- JSON Schema Draft 2020-12の検証のため、`ajv` (version 8) および `ajv-formats` を追加依存として採用 (`Ajv2020`を利用しstrict validationを有効化)
- Profileのバージョン境界となる日付は `effectiveFrom` を inclusive（以上）、`effectiveTo` を exclusive（未満）として判定する
- 同一Profile IDにおけるactive期間の重複は厳格に拒否する
- Profileのメタデータ命名規則は独自拡張（`profileId`等）を行わず、指示書記載の共通項目名（`id`, `profileType`等）を正本としてTypeScript・JSON Schema間で統一する
