# Gemini Request — AI_Package.md 標準化・Level 4-B実行

## 0. 読み込み順序

作業開始前に、以下を順番に読み込んでください。

1. `Gemini_Master_Instruction_v2.0.md`
2. `Practice_Assistant_V2_L4B_Request.md`
3. リポジトリ内のAI向けMarkdown資産
   - `docs/AI/01_Project/Current_Status.md`
   - `docs/AI/01_Project/Architecture.md`
   - `docs/AI/01_Project/Decisions.md`
   - `docs/AI/01_Project/Progress_Log.md`
   - `docs/AI/01_Project/Known_Issues.md`
   - `docs/AI/03_Report/Gemini_Report.md`
   - `docs/AI/03_Report/Human_Summary.md`

チャット履歴ではなく、Markdown資産を正本として扱ってください。

身勝手な推測や独断は絶対にしないでください。  
指示書を忠実に守ってください。

---

## 1. 今回の目的

Level 4-Bの作業を既存指示書どおり実行し、作業終了時に、次のAIまたはChatGPTが1ファイルだけで状況を把握できるよう、`AI_Package.md`を生成・更新してください。

`AI_Package.md`は共有用の集約ファイルです。

正式な正本は、各役割別Markdownです。  
`AI_Package.md`はそれらの最新状態を矛盾なく要約したものとしてください。

---

## 2. AI_Package.mdの配置

以下に作成してください。

```text
docs/AI/AI_Package.md
```

既に存在する場合は全置換せず、最新状態へ更新してください。

---

## 3. AI_Package.mdの必須構成

以下の順序を固定してください。

```markdown
# AI Package

## 1. Project
## 2. Current Status
## 3. Latest Changes
## 4. Architecture
## 5. Decisions
## 6. Verification Evidence
## 7. Git Status
## 8. Known Issues
## 9. Human Review
## 10. Next Action
## 11. Required Source Files
## 12. Human Summary
```

### 3.1 Project

最低限：

- プロジェクト名
- リポジトリ
- ブランチ
- 対象フェーズ
- 対象機能

### 3.2 Current Status

最低限：

- 現在のフェーズ
- 実装済み範囲
- 未実装範囲
- commit / push状態
- HEAD / origin/main
- working tree状態

### 3.3 Latest Changes

今回の変更だけを列挙してください。

詳細なdiff全文は記載しないでください。

### 3.4 Architecture

以下の責務境界を簡潔に記載してください。

```text
Practice Assistant V2
→ Document Input Adapter
→ Word Generation Application Service
→ Word Document Engine
→ OutputVerifier
→ DomSerializationVerifier
→ Generation Result DTO
→ Download
```

### 3.5 Decisions

確定済み判断だけを記載してください。

推測や提案は含めないでください。

### 3.6 Verification Evidence

最低限：

- 自動テスト
- 既存様式verify
- 第2様式verify
- build
- lint
- OutputVerifier
- DomSerializationVerifier
- 原本SHA-256
- 出力SHA-256
- Word人間確認

各項目に以下を記載してください。

- Command
- Exit Code
- 件数
- Result

### 3.7 Git Status

最低限：

- changed files
- staged files
- commit hash
- push結果
- HEAD
- origin/main
- working tree

### 3.8 Known Issues

未解決事項だけを記載してください。

解消済み事項は残さないでください。

### 3.9 Human Review

人間が確認済みの事項と、未確認事項を分離してください。

### 3.10 Next Action

次に行う作業を1つだけ明記してください。

複数候補を列挙しないでください。

### 3.11 Required Source Files

次のAIが詳細確認を必要とする場合に読むべき正式Markdownを列挙してください。

例：

```text
docs/AI/01_Project/Architecture.md
docs/AI/01_Project/Decisions.md
docs/AI/03_Report/Gemini_Report.md
```

### 3.12 Human Summary

人間向けに次だけを記載してください。

```text
■ 実施
■ 結果
■ 要確認
■ 判断事項
■ 次工程
```

各項目は最大3行までにしてください。

---

## 4. 更新順序

作業終了時は次の順序を守ってください。

1. 正式Markdown群を更新
2. 正式Markdown間の矛盾を確認
3. `AI_Package.md`を生成・更新
4. `AI_Package.md`の内容と正式Markdownを照合
5. Git差分監査
6. 対象ファイル限定stage
7. commit
8. push
9. push後のGit状態確認

`AI_Package.md`を先に書き、後から正式Markdownを更新してはいけません。

---

## 5. 整合性ルール

以下を禁止します。

- 正式Markdownと異なる数値
- 実測していない成功結果
- 推定値の記載
- 解消済み問題の残存
- commit前の仮commit hash
- push前のpush成功記載
- 人間未確認事項を確認済みとすること
- AI_Packageだけ更新し、正式Markdownを更新しないこと

矛盾を検出した場合は、commitせず停止してください。

---

## 6. 人間・ChatGPTへの共有ルール

作業完了後、チャットには詳細を貼らないでください。

次だけを報告してください。

```text
■ 結論
■ commit hash
■ push結果
■ テスト・verify
■ Git状態
■ AI_Package.md更新
■ 未解決事項
```

人間またはChatGPTへ共有するファイルは、原則として次の1ファイルだけです。

```text
docs/AI/AI_Package.md
```

追加ファイルは、依頼された場合のみ共有してください。

---

## 7. Gitルール

`git add .`、`git add -A`は禁止です。

今回対象ファイルだけを個別にstageしてください。

commit前に必ず実行してください。

```bash
git diff --cached --stat
git diff --cached --name-only
git diff --cached
```

対象外ファイルが含まれる場合はcommit禁止です。

---

## 8. 停止条件

以下の場合はcommit・pushせず停止してください。

- 正式Markdown間に矛盾
- AI_Package.mdと正式Markdownに矛盾
- 実測値不足
- テスト・verify・build失敗
- 今回変更由来lint error / warning
- OutputVerifier失敗
- DomSerializationVerifier失敗
- 原本SHA-256不一致
- 対象外差分
- staged内容に対象外ファイル
- 人間確認結果が不明
- push失敗

---

## 9. 完了チェックリスト

```text
[ ] Master読込
[ ] L4-B Request読込
[ ] 正式Markdown群読込
[ ] 正式Markdown群更新
[ ] Markdown間整合性確認
[ ] AI_Package.md生成・更新
[ ] AI_Package.md整合性確認
[ ] 全自動テスト成功
[ ] 既存様式verify成功
[ ] 第2様式verify成功
[ ] build成功
[ ] 今回変更由来lint 0
[ ] OutputVerifier成功
[ ] DomSerializationVerifier成功
[ ] 原本SHA-256一致
[ ] Git差分監査成功
[ ] 対象ファイル限定stage
[ ] staged差分監査成功
[ ] commit成功
[ ] push成功
[ ] HEAD = origin/main
[ ] working tree clean
[ ] 人間向け要点報告のみ
[ ] 共有対象はAI_Package.mdのみ
```

未達が1件でもある場合は、未完了として停止してください。
