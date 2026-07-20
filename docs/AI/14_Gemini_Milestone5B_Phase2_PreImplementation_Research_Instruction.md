# Milestone 5-B Phase 2 事前調査指示書

## 1. 参照する正本・設計文書

以下を必ず読み、Milestone 5-B Phase 2の事前調査のみを実施してください。

- `docs/AI/00_AI_Collaboration_Policy_and_Operating_History.json`
- `docs/AI/12_Milestone5B_Phase2_Design_Scope_Stop_Conditions.md`

## 2. AI協働方針

次の役割分担を厳守してください。

- ChatGPT：設計・要件・品質基準・停止条件
- Copilot：簡潔化・矛盾確認・レビュー
- Gemini：調査・実装・検証・Git操作
- ユーザー：最終判断・承認

## 3. 今回の作業範囲

今回の作業範囲は、以下のみです。

- 調査
- 現状確認
- 設計適合性の判定
- 調査報告書の作成

以下は実施しないでください。

- 実装
- コード修正
- Commit
- Push
- Pull Request作成
- Merge

## 4. 必須調査項目

以下をすべて確認してください。

1. Phase 1で実装済みのProfile型、Schema、Registry、Version Registryの現状
2. Profile Loader追加に必要な既存構造と不足点
3. Profile間参照に使える既存フィールドと不足フィールド
4. Profile Resolverの入出力設計に影響する既存Interface
5. Execution Context Builderを接続可能な既存境界
6. Career-Up Formを最初の統合対象にできるか
7. Word Engine／Document Engineへの影響範囲
8. 既存テスト、verify、build、lintの実行経路
9. 後方互換性を維持する方法
10. Phase 2開始前に確定が必要な設計判断
11. Stop Conditionに該当する問題の有無
12. Phase 2を安全に一括実装できるか、分割が必要か
13. 未追跡の `docs/AI/03_AI_Collaboration_Governance_Commit_Report.json` が調査へ影響しないこと

## 5. 調査方法

調査では、推測ではなく、以下を根拠にしてください。

- 既存コード
- Schema
- テスト
- Markdown
- JSON
- `package.json` のscripts
- Git状態
- 実際のファイルパスと依存関係

未確認事項を断定しないでください。

## 6. 詳細報告書

詳細報告は、次のMarkdownへ保存してください。

`docs/AI/13_Milestone5B_Phase2_PreImplementation_Research.md`

報告書には、以下を必ず含めてください。

- 調査対象
- 現状構造
- 再利用可能な既存実装
- 不足している構造
- 変更候補ファイル
- 新規作成候補ファイル
- 既存Interfaceとの整合性
- Career-Up Form統合可否
- Word Engine／Document Engineへの影響範囲
- 後方互換性
- リスク
- Stop Condition判定
- 設計判断が必要な項目
- 推奨実装順序
- 一括実装可否
- 実装開始可否
- 根拠となるファイルパス
- 現在のGit状態
- 未追跡ファイルの扱い

## 7. 停止条件

次のいずれかに該当した場合は、実装へ進まず停止してください。

- 正本または設計文書が見つからない
- Phase 1の構造と設計文書に重大な矛盾がある
- Profile Loader／Resolver／Execution Contextの責務境界が確定できない
- Career-Up Form統合が既存互換性を破壊する可能性がある
- Word Engine／Document Engineへの重大な副作用が否定できない
- 一括実装時の影響範囲を特定できない
- 必須テスト経路が不明
- 未確認事項を推測しなければ結論を出せない
- 指示範囲外の変更が必要

停止した場合は、停止理由、根拠、必要な人間判断を報告してください。

## 8. ユーザー向け完了報告

ユーザー向け返答は要点のみとし、次の形式にしてください。

- 事前調査：完了／停止
- 実装開始可否：可／不可／条件付き
- Blocking Issue：有／無
- 設計判断が必要な項目数
- 一括実装可否：可／分割推奨／不可
- 未追跡ファイルの影響：有／無
- 推奨する次の作業

## 9. 禁止事項

- 身勝手な推測や独断は絶対にしないでください。
- 指示書を忠実に守ってください。
- 推定・独自判断・勝手な仕様変更をしないでください。
- 指示範囲外の実装をしないでください。
- エラーを握りつぶさないでください。
- 未確認事項を断定しないでください。
- 調査完了前に実装へ進まないでください。
