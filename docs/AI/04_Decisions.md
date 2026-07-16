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
