# Decisions

今回確定した設計判断は以下の通りです。

- verified / modifiedのみ出力
- unverified / rejectedは除外
- manualCheck / humanReviewは人間確認前に解除しない
- POSTでDTO返却、GETでdownloadId取得
- Verifier失敗時はdownloadIdを返さない
- MarkdownをAI間連携の正本とする
