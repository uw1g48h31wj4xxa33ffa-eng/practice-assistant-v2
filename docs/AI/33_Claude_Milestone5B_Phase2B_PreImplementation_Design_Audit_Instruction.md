# Claude向け Milestone 5-B Phase 2-B 設計監査指示書

## 1. 目的

Milestone 5-B Phase 2-Bの実装前に、既存の正本文書・Phase 2-A実装・未確定設計項目を監査し、Phase 2-Bへ進める状態かを判定してください。

今回のClaudeの役割は、**調査・設計監査・論理レビューのみ**です。

実装、ファイル編集、Git操作は行わないでください。

---

## 2. 最重要方針

- 既存コードや文書を推測で補完しない
- 設計上の矛盾・責務重複・未確定事項を明示する
- 実装可能性よりも、不具合・副作用・将来の破壊的変更防止を優先する
- 過剰設計は避ける
- Phase 2-Bに必要な最小限の決議内容へ絞る
- Phase 3以降の先行設計・先行実装を提案しない
- 「実装してから調整」は禁止
- 現状のProfile LoaderおよびPhase 2-A公開契約を壊さない
- 人間が最終判断する前提で、断定には根拠を示す

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

---

## 3. 現在の確定状態

```text
branch: main
HEAD: f850acbb8e6a645ca3ce87dd4764fe1f2e6796b7
origin/main: f850acbb8e6a645ca3ce87dd4764fe1f2e6796b7
ahead / behind: 0 0
working tree: clean
Phase 2-A: 完了
Phase 2-B: 未着手
```

Phase 2-A実装commit：

```text
168e8b6f9f4de52f572fb4c86cd942b3b306c1e6
feat(profiles): complete milestone 5B phase 2A profile loader
```

AI文書整理commit：

```text
f850acbb8e6a645ca3ce87dd4764fe1f2e6796b7
docs(ai): organize phase 2A collaboration records
```

---

## 4. 背景

GeminiがPhase 2-B開始前調査を実施しました。

その結果、正本文書
`docs/AI/12_Milestone5B_Phase2_Design_Scope_Stop_Conditions.md`
の「Required decisions before implementation」に定められた項目のうち、少なくとも以下が未確定と判定されました。

1. effective-date source
2. Resolver input and output interfaces
3. execution-context interface
4. feature flag or explicit activation mechanism

Geminiは実装前停止条件に該当すると判断し、コード変更を行わず停止しています。

この停止判断が妥当か、またPhase 2-B実装前に何をどこまで設計決議として固定すべきかを監査してください。

---

## 5. 優先して読む文書

以下を必ず確認してください。

```text
docs/AI/00_AI_Collaboration_Policy_and_Operating_History.md
docs/AI/00_External_Disclosure_Public_Markdown_Rule.md
docs/AI/12_Milestone5B_Phase2_Design_Scope_Stop_Conditions.md
docs/AI/13_Milestone5B_Phase2_PreImplementation_Research.md
docs/AI/19_Copilot_Milestone5B_Phase2A_PreCommit_Review_Task_v3.json
docs/AI/25_Milestone5B_Phase2A_Uncommitted_AI_Documents_Classification_Report.md
```

加えて、以下を確認してください。

```text
src/profiles/registry/profile-loader.ts
src/profiles/tests/profile-loader.test.ts
```

Phase 2-A commit差分：

```bash
git show --stat --oneline 168e8b6f9f4de52f572fb4c86cd942b3b306c1e6
git show 168e8b6f9f4de52f572fb4c86cd942b3b306c1e6
```

関連文書・コード検索：

```bash
grep -RInEi "Phase 2-B|Phase2-B|effective date|effective-date|resolver|execution context|feature flag|feature-flag|adapter|fallback|profile loader|cross-profile" docs src scripts tests 2>/dev/null
```

---

## 6. 監査対象

### A. Geminiの停止判断

次を判定してください。

- 実装前停止は妥当か
- 未確定4項目は本当に未確定か
- 既存文書・コードに実質的な決定が既に存在しないか
- 停止せず実装可能な最小範囲が存在するか
- 正本文書更新が先に必要か

### B. Phase 2-Aの完成範囲

次を明確にしてください。

- Profile Loaderが完了した責務
- validationの責務
- cross-profile reference validationの完成状況
- error aggregationの責務
- Phase 2-Aの公開API
- Phase 2-Aで意図的に未実装の責務
- Phase 2-Bへ残る責務

### C. Phase 2-Bの責務境界

以下の境界を監査してください。

- ProfileLoader
- ProfileResolver
- ExecutionContext Builder
- Adapter
- Registry
- Feature activation
- Effective-date決定
- Fallback
- Error handling

責務の重複や循環依存がないかを確認してください。

### D. 未確定設計項目

最低限、次の4項目について推奨案を提示してください。

#### 1. Effective-date source

確認事項：

- 有効日は誰が供給するか
- システム時刻を暗黙利用してよいか
- UI/API/呼出元/ExecutionContextのどこで保持するか
- タイムゾーン
- 日付のみか日時か
- テストで注入可能か
- 未指定時の挙動
- 不正値の扱い

#### 2. Resolver input/output interfaces

確認事項：

- Resolverの入力型
- profile identifier
- version指定
- effective date
- provider
- tenant/client/case等の識別子
- fallback可否
- 出力型
- resolved profile
- resolution metadata
- warnings/errors
- fallback履歴
- null/exception/result型のどれを採用するか

#### 3. Execution Context interface

確認事項：

- 必須項目
- option項目
- immutableか
- Resolverへの入力と同一か別型か
- build責務
- validation責務
- current date/timeの扱い
- traceability
- human review情報
- 将来拡張の余地と過剰設計回避

#### 4. Feature flag / explicit activation

確認事項：

- どこで有効化するか
- default OFFか
- environment variableか
- configurationか
- Registry activationか
- 明示的な呼出APIか
- 既存経路に影響を与えないか
- 段階導入可能か
- テスト可能か
- 誤有効化時の安全性

### E. その他の不足項目

正本文書が要求する14項目すべてを監査し、4項目以外にも不足・曖昧・矛盾があれば列挙してください。

---

## 7. 禁止事項

- 実装
- ファイル編集
- 自動修正
- stage
- Commit
- Push
- branch作成・切替
- PR作成
- テスト期待値変更提案
- Phase 3以降の先行実装提案
- 大規模リファクタリング提案
- 新規Providerの独断追加
- UI/APIの独断変更
- Word Engine接続の先行
- DTO追加の先行
- 推測による仕様確定

---

## 8. 必須成果物

以下の形式で監査結果を報告してください。

### 1. 結論

```text
Geminiの停止判断:
妥当 / 一部妥当 / 不要

Phase 2-B実装開始:
可能 / 条件付き可能 / 不可

正本文書更新:
必要 / 不要
```

### 2. 根拠

- 根拠文書
- 根拠コード
- 該当箇所
- 矛盾・不足
- 実装時の具体的リスク

### 3. Phase 2-A完成範囲

- 完了済み責務
- 未完了責務
- Phase 2-Bへの残作業
- cross-profile validationの判定

### 4. Phase 2-B責務分割

次の表形式で提示してください。

| Component | Responsibility | Must not do | Input | Output |
|---|---|---|---|---|
| ProfileLoader |  |  |  |  |
| ProfileResolver |  |  |  |  |
| ExecutionContextBuilder |  |  |  |  |
| Adapter |  |  |  |  |
| FeatureActivation |  |  |  |  |

### 5. 未確定4項目の推奨決議案

各項目について：

- 推奨案
- 代替案
- 推奨理由
- 既存互換性
- 実装リスク
- テスト観点
- 決議文書に記載すべき型・契約

### 6. 14項目監査表

| No. | Required decision | 状態 | 根拠 | 追加決議の要否 |
|---|---|---|---|---|

状態は次のいずれか：

```text
確定
実質確定
一部未確定
未確定
矛盾あり
```

### 7. 最小設計決議書の構成案

Phase 2-B開始前に作成すべきMarkdownの章立てを提示してください。

過剰な文書化は避け、実装に必要な最小限へ絞ってください。

### 8. Stop Condition

- 該当／非該当
- 該当理由
- 解除に必要な決定
- 実装開始前に人間が承認すべき事項

### 9. 最終推奨

次のいずれかを選んでください。

```text
A. 設計決議書を作成後、Gemini実装へ進む
B. 追加コード調査後、設計決議書を作成する
C. Phase 2-Bの範囲を縮小する
D. 現状のまま実装可能
```

---

## 9. 監査品質要件

- 抽象論だけで終わらせない
- 推奨型や責務境界を具体化する
- 既存コードに適合する案を優先する
- 破壊的変更を避ける
- 既存Loaderの責務を増やしすぎない
- ResolverとExecutionContextの責務を混同しない
- feature flagを単なる環境変数追加で済ませるか、既存構造に適した明示有効化方式にするかを比較する
- effective dateを`new Date()`の暗黙利用で済ませない
- fallbackを暗黙成功にしない
- error/warning/fallback metadataを追跡可能にする
- 人間レビューが必要な条件を明示する

---

## 10. 最終指示

実装は行わず、Phase 2-B実装前の設計監査に集中してください。

Geminiの停止判断を検証し、正本文書の14項目を監査したうえで、未確定4項目に対する具体的で最小限の設計決議案を提示してください。

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。
