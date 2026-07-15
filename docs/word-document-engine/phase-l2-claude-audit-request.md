# Claude向け監査指示書

Practice Assistant V2
Word Document Engine
Phase L2-E Level 2 完了確定・全体監査依頼

## 1. 目的
Geminiによって実施された Phase L2 全体の変更について、最終の差分監査を実施してください。
今回は「監査専用」です。実装・修正・commit・pushは禁止します。

対象Commit: df0c53fc83cc3c1929c4a9d5e7f26a51e0f0ad61

## 2. 監査対象と背景
Level 2の目的は「OutputVerifierの制度固有fieldId分岐の排除」および「Mapping駆動（verification.type等）への完全移行」でした。

監査観点は以下の通りです：
1. **Core設定駆動性**: `output-verifier.mjs` 等に特定の `fieldId` をハードコードした不要な処理分岐が残存していないか（フェイルセーフの例外スローは一時許容範囲内とします）。
2. **検証スキーマ移行**: Text, Date, Numeric, Distributed, SDTのすべての検証ロジックが `config` の定義に基づいて正しくルーティングされているか。
3. **副作用の不在**: `word-filler.mjs` を含む実装において、Level 1の既存機能やエラーハンドリングに対する破壊的な変更が含まれていないか。

## 3. 確認手順
1. 上記観点に基づき、コードの健全性と設定駆動化の到達度を確認してください。
2. 問題がなければ「Level 2 全体監査完了・承認」を宣言してください。
3. 致命的な欠陥・仕様破壊があれば理由とともに報告してください。
