# 39_Gemini_Milestone5B_Phase2C_PreImplementation_Investigation

## 目的

Milestone 5-B Phase 2-C に着手する前に、Phase 2-Bで実装済みのProfileResolver、ExecutionContextBuilder、Adapter、Feature Activationを、既存のCareer-Up Form生成経路へ安全に接続するための事前調査を行ってください。

本指示では**調査・分析・報告のみ**を行い、実装、修正、Git操作は行わないでください。

---

## 最優先ルール

- 身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。
- 設計変更、仕様変更、実装範囲拡大を独断で行わないでください。
- 未確認事項を断定しないでください。
- 既存のlegacy経路を削除、置換、破壊しないでください。
- 調査中に重大な設計矛盾、既存不具合、互換性リスクを発見した場合は、実装せず停止して報告してください。
- `git add`、`git commit`、`git push`、PR作成は禁止です。

---

## 事前に読む文書

最低限、以下を読んでください。

- `docs/AI/34_Milestone5B_Phase2B_Design_Decision.md`
- `docs/AI/36_Phase2B_Implementation_Report.md`
- `docs/AI/37_Gemini_Milestone5B_Phase2B_ReviewFix.md`
- `docs/AI/38_Claude_Milestone5B_Phase2B_DateImmutability_DesignAudit.md`
- Phase 2全体、Milestone 5-B、Career-Up Form、Word Document Engine、Profile-driven経路に関する既存の正本Markdown

正本が複数ある場合は、最新の承認済み文書を優先し、参照した文書名を報告してください。

---

## 調査開始前の状態確認

以下を確認してください。

1. 現在のブランチ
2. `main` が最新か
3. PR #2のマージコミットが取り込まれているか
4. 作業ツリーがクリーンか
5. Phase 2-Bの実装ファイルが存在するか
6. 既存テスト、lint、build、verifyの基準が何か

### 重要

- 調査のために新しい作業ブランチを作成しても構いませんが、コード変更は禁止です。
- `main` の更新が必要な場合は、破壊的操作を避けてください。
- ローカル変更が存在する場合は、勝手に破棄、退避、上書きせず停止してください。

---

## 調査対象

### 1. 既存Career-Up Form生成入口の特定

Career-Up Formの生成が現在どこから開始されるかを追跡してください。

最低限、以下を特定してください。

- UI、Server Action、API Route、Service、Use Case、生成関数の入口
- 実際にWord生成処理を呼び出す箇所
- Mappingを取得する箇所
- template ID、version、expectedSha256を扱う箇所
- OutputVerifier、DomSerializationVerifier、manualCheck、humanReviewとの接続箇所
- 生成結果がUIへ戻るまでの経路

ファイル名、関数名、呼び出し順序を具体的に示してください。

---

### 2. legacy経路の構造確認

既存のCareer-Up Form生成経路を壊さず残すため、以下を確認してください。

- legacy経路の入口
- legacy Mappingの取得方法
- legacy経路が依存する型
- legacy経路の戻り値
- legacy経路のエラー処理
- legacy経路を保証する既存テスト
- Phase 2-Cで変更すると回帰しうる箇所

「既存経路を残したままProfile-driven経路を追加できるか」を判断してください。

---

### 3. Phase 2-B成果物の実接続可能性

以下の各要素について、実際の統合先を確認してください。

- `ProfileResolver`
- `ExecutionContextBuilder`
- `CareerUpAdapter` または該当Adapter
- `Feature Activation`
- `ResolveRequest`
- `ExecutionContext`
- `LegacyMappingFormat`

各要素について、以下を報告してください。

- 現在の公開API
- 呼び出しに必要な入力
- 返却値
- 想定される接続先
- 接続時に不足しているもの
- 型変換の必要性
- 既存コードとの互換性リスク

---

### 4. Feature Activationの利用方法

Profile-driven経路を明示的に有効化し、既存経路を既定のまま維持できるか確認してください。

以下を具体化してください。

- 切替単位
- 切替位置
- 既定値
- legacy fallbackの有無
- 自動fallbackを行うか否か
- エラー時にlegacyへ黙って戻す危険性
- テストで保証すべき条件

自動fallbackが設計上禁止または危険な場合は、その理由を明記してください。

---

### 5. 最小統合対象の決定材料

Phase 2-Cで最初に接続する対象を、Career-Up Formの1経路に限定できるか確認してください。

以下を報告してください。

- 最小の統合入口
- 最小の変更ファイル群
- 変更不要なファイル群
- UI変更の要否
- API変更の要否
- DTO変更の要否
- Verifier変更の要否
- Adapter変更の要否
- Profile JSON変更の要否

ここでは決定せず、根拠を添えて候補を提示してください。

---

### 6. エラー伝播と停止条件

Profile解決に失敗した場合、既存生成処理を開始してはいけない条件を確認してください。

最低限、以下を追跡してください。

- Profile未存在
- effectiveDate不正
- active versionなし
- ambiguous resolution
- type mismatch
- dependency解決失敗
- circular reference
- Adapter変換失敗
- Mapping互換性不一致
- SHA-256不一致
- Verifier失敗

各エラーがどこで発生し、どこまで伝播し、UIまたは呼び出し元にどう返るべきかを整理してください。

エラー握りつぶし、暗黙fallback、成功扱いは禁止です。

---

### 7. 統合テスト候補

Phase 2-C実装時に必要となるテストを提案してください。

最低限、以下を含めてください。

1. 正常なProfile-driven経路でCareer-Up Mapping形式を生成できる
2. effectiveDateにより正しいProfile versionが選択される
3. Profile不足時にWord生成へ進まない
4. 型不一致時にWord生成へ進まない
5. Resolverの依存解決失敗が上位へ伝播する
6. Adapter出力が既存Career-Up Mappingと厳密に互換である
7. legacy経路が従来どおり動作する
8. Profile-driven経路が明示的に有効化された場合のみ動作する
9. 自動fallbackが発生しない
10. 同一入力から同一結果が得られる
11. OutputVerifierおよび必要ならDomSerializationVerifierへ正しく接続される
12. manualCheck、humanReviewの扱いが既存契約どおりである

各テストについて、対象ファイル、テスト層、期待結果を示してください。

---

## 禁止事項

- 実装
- ファイル編集
- 型変更
- Profile JSON変更
- テスト追加・修正
- legacy経路削除
- 自動fallback追加
- エラー握りつぶし
- UI変更
- API変更
- DTO変更
- Verifier変更
- SHA-256期待値変更
- manualCheck解除
- Git stage、commit、push
- PR作成

---

## 停止条件

以下に該当した場合は、調査を打ち切って報告してください。

- mainが最新でない、または安全に同期できない
- 作業ツリーに未承認変更がある
- Phase 2-Bのマージ内容が見つからない
- 正本同士が矛盾している
- Career-Up Form生成入口を一意に特定できない
- Profile-driven経路の接続に設計変更が必要
- legacy互換性を維持できない可能性がある
- Adapter契約と実在Mappingが一致しない
- Verifierまたは生成結果DTOとの接続が不明
- 重大な既存不具合を発見した

---

## 報告形式

以下の順で報告してください。

### 1. 調査結果要約

- Phase 2-Cを最小統合として実施可能か
- 実装着手可能か
- 設計決議が必要か
- 重大リスクの有無

### 2. 現在の生成経路

入口からWord生成、Verifier、UI返却までを、ファイル名と関数名付きで示してください。

### 3. 推奨する接続位置

候補を最大3案まで提示し、各案について以下を示してください。

- 接続位置
- 変更範囲
- 利点
- リスク
- legacy互換性

最後に推奨案を1つ示してください。

### 4. 変更候補ファイル一覧

- 変更候補
- 新規追加候補
- テスト候補
- 変更不要

### 5. エラー伝播設計案

エラー種別ごとに、発生元、返却先、生成停止条件を示してください。

### 6. テスト計画

テストケース、対象層、期待結果を表形式で整理してください。

### 7. 未確定事項

人間またはChatGPTによる設計決議が必要な点を列挙してください。

### 8. 実行証跡

以下を提示してください。

- 実行コマンド
- exit code
- 重要なstdout要約
- `git status -sb`
- 参照した正本文書

---

## 完了条件

以下をすべて満たした時点で調査完了です。

- Career-Up Formの既存生成入口を特定した
- legacy経路を追跡した
- Phase 2-B成果物の接続候補を特定した
- 最小変更範囲を提示した
- エラー伝播を整理した
- 統合テスト案を提示した
- 未確定事項を明示した
- コード変更を一切行っていない
- Git操作を一切行っていない

完了後は、人間の承認を待って停止してください。
