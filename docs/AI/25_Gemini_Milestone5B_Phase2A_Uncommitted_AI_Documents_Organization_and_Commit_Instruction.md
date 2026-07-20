# Gemini向け Milestone 5-B Phase 2-A 未Commit AI文書 整理・分類・限定Commit指示書

## 1. 目的

Milestone 5-B Phase 2-Aの実装・Commit・Push完了後に残っている未CommitのAI関連文書を整理し、以下の3分類へ明確に分けてください。

1. 今後も正本として保持する文書
2. 実行履歴として保持する文書
3. 重複・旧版・廃止候補

整理後、承認可能な文書だけを限定的にstageし、1回のCommitとして記録してください。

今回はAI文書整理のみです。

以下は禁止です。

- ソースコード変更
- テストコード変更
- Phase 2-B実装
- `docs/AI/06_Verification_Result.json` の内容変更
- Push
- PR作成
- force操作
- 無関係なファイルのstage

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

---

## 2. 現在確認されている未Commit対象

以下は直前のPush後に確認された未Commit・未追跡ファイルです。

```text
M docs/AI/06_Verification_Result.json

?? docs/AI/00_AI_Collaboration_Policy_and_Operating_History.md
?? docs/AI/00_External_Disclosure_Public_Markdown_Rule.md
?? docs/AI/03_AI_Collaboration_Governance_Commit_Report.json
?? docs/AI/12_Milestone5B_Phase2_Design_Scope_Stop_Conditions.md
?? docs/AI/13_Milestone5B_Phase2_PreImplementation_Research.md
?? docs/AI/14_Gemini_Milestone5B_Phase2_PreImplementation_Research_Instruction.md
?? docs/AI/15_Gemini_Milestone5B_Phase2A_Profile_Loader_Implementation_Instruction.md
?? docs/AI/16_Copilot_Milestone5B_Phase2A_PreCommit_Review_Instruction.json
?? docs/AI/16_Copilot_Milestone5B_Phase2A_PreCommit_Review_Instruction.md
?? docs/AI/16_Copilot_Milestone5B_Phase2A_PreCommit_Review_Instruction_v2.json
?? docs/AI/17_Gemini_Milestone5B_Phase2A_Review_Context_JSON_Generation_Instruction.md
?? docs/AI/18_Gemini_Milestone5B_Phase2A_Limited_Quality_Fix_Instruction.md
?? docs/AI/19_Copilot_Milestone5B_Phase2A_PreCommit_Review_Task_v3.json
?? docs/AI/20_Gemini_Milestone5B_Phase2A_SelfContained_Copilot_Review_Bundle_Generation_Instruction.md
?? docs/AI/21_Gemini_Milestone5B_Phase2A_Limited_Stage_and_Commit_Instruction.md
?? docs/AI/22_Gemini_Milestone5B_Phase2A_Trailing_Whitespace_Fix_and_Commit_Instruction.md
?? docs/AI/23_Gemini_Milestone5B_Phase2A_PrePush_Final_Verification_Instruction.md
?? docs/AI/24_Gemini_Milestone5B_Phase2A_Limited_Push_Instruction.md
?? docs/AI/Copilot_Handoff_AI_Collaboration_Policy_Review.json
?? docs/AI/Copilot_Handoff_AI_Collaboration_Policy_Review.md
```

実際の `git status --short` を正本とし、差異がある場合は報告してください。

---

## 3. 作業方針

以下の原則で整理してください。

### 3.1 正本として保持する文書

今後の開発・AI連携で継続参照される設計、方針、ルール、事前調査、正式指示書。

例：

- AI Collaboration Policy
- External Disclosure Rule
- Phase 2 Design / Scope / Stop Conditions
- Phase 2 Pre-Implementation Research
- Geminiの正式なPhase 2-A実装指示書

### 3.2 実行履歴として保持する文書

実装・検証・レビュー・Commit・Pushの過程を証跡として残す価値がある文書。

例：

- Review Context生成指示
- Quality Fix指示
- Self-Contained Review Bundle生成指示
- Stage・Commit指示
- Trailing Whitespace修正指示
- Push前確認指示
- Push指示

### 3.3 重複・旧版・廃止候補

同じ目的の旧版、失敗した方式、形式重複、今後誤参照の原因になる文書。

例：

- Copilot Review Instruction v1 / v2
- `.md`と`.json`の重複で、正式採用形式が1つに決まっているもの
- 旧Handoff文書
- Self-Contained Bundle方式に置き換えられた旧方式

ただし、勝手に削除してはいけません。

削除候補は必ず一覧化し、今回は原則としてCommit対象外にしてください。

---

## 4. 必須確認

最初に以下を実行してください。

```bash
git status --short
git diff -- docs/AI/06_Verification_Result.json
find docs/AI -maxdepth 1 -type f | sort
```

次に、各未追跡文書について内容を確認してください。

最低限、以下を確認してください。

- ファイル名
- 目的
- 作成フェーズ
- 現在も有効か
- 正本か
- 旧版か
- 重複か
- 今後誤参照の危険があるか
- 保持価値
- Commit対象に含めるべきか

---

## 5. `06_Verification_Result.json` の扱い

`docs/AI/06_Verification_Result.json` は今回変更禁止です。

以下を確認してください。

- 変更内容
- Phase 2-Aとの関係
- 今回Commitへ含めるべきか
- 別Commitが適切か
- 内容確認が必要か

今回は原則としてstageしないでください。

ただし、明確に今回のAI文書整理だけに関係し、既存方針上同一Commitが妥当であることを証拠付きで確認できる場合は、Commit前に停止して人間判断を求めてください。

独断で含めてはいけません。

---

## 6. 分類レポート作成

以下のMarkdownを新規作成してください。

```text
docs/AI/25_Milestone5B_Phase2A_Uncommitted_AI_Documents_Classification_Report.md
```

必須構成：

### A. 正本として保持

各ファイルについて：

- path
- purpose
- status
- rationale
- futureReference
- commitRecommendation

### B. 実行履歴として保持

各ファイルについて：

- path
- purpose
- phase
- evidenceValue
- futureReferenceRisk
- commitRecommendation

### C. 重複・旧版・廃止候補

各ファイルについて：

- path
- duplicateOf
- obsoleteReason
- riskIfRetained
- deletionRecommendation
- commitRecommendation

### D. `06_Verification_Result.json`

- currentDiffSummary
- relationToPhase2A
- recommendedHandling
- commitRecommendation

### E. 最終提案

以下を明記してください。

- 今回Commit対象
- 今回Commit対象外
- 削除候補
- 保留候補
- 人間判断が必要な項目
- Phase 2-B開始前に残すべき正本

---

## 7. Commit対象の原則

### 7.1 Commit対象に含めてよいもの

以下をすべて満たす文書のみ。

- 内容確認済み
- 機密情報なし
- 現在も有効
- 正本または有用な実行履歴
- 今後の誤参照リスクが低い
- Phase 2-Aの証跡として合理的
- JSONまたはMarkdownの構文が有効
- ScopeがAI文書整理に限定
- 人間判断不要

### 7.2 Commit対象外

- `docs/AI/06_Verification_Result.json`
- 旧版Copilot Review Instruction
- 重複Handoff文書
- 廃止候補
- 内容不明
- 正式採用形式と不一致
- 一時的な試行ファイル
- 機密情報を含むもの
- Phase 2-B実装資料で、まだ正本化されていないもの
- 今回の指示書自身

---

## 8. 推奨保持対象

内容確認で問題がなければ、以下は保持候補です。

### 正本候補

```text
docs/AI/00_AI_Collaboration_Policy_and_Operating_History.md
docs/AI/00_External_Disclosure_Public_Markdown_Rule.md
docs/AI/03_AI_Collaboration_Governance_Commit_Report.json
docs/AI/12_Milestone5B_Phase2_Design_Scope_Stop_Conditions.md
docs/AI/13_Milestone5B_Phase2_PreImplementation_Research.md
docs/AI/14_Gemini_Milestone5B_Phase2_PreImplementation_Research_Instruction.md
docs/AI/15_Gemini_Milestone5B_Phase2A_Profile_Loader_Implementation_Instruction.md
```

### 実行履歴候補

```text
docs/AI/17_Gemini_Milestone5B_Phase2A_Review_Context_JSON_Generation_Instruction.md
docs/AI/18_Gemini_Milestone5B_Phase2A_Limited_Quality_Fix_Instruction.md
docs/AI/19_Copilot_Milestone5B_Phase2A_PreCommit_Review_Task_v3.json
docs/AI/20_Gemini_Milestone5B_Phase2A_SelfContained_Copilot_Review_Bundle_Generation_Instruction.md
docs/AI/21_Gemini_Milestone5B_Phase2A_Limited_Stage_and_Commit_Instruction.md
docs/AI/22_Gemini_Milestone5B_Phase2A_Trailing_Whitespace_Fix_and_Commit_Instruction.md
docs/AI/23_Gemini_Milestone5B_Phase2A_PrePush_Final_Verification_Instruction.md
docs/AI/24_Gemini_Milestone5B_Phase2A_Limited_Push_Instruction.md
```

### 旧版・廃止候補

```text
docs/AI/16_Copilot_Milestone5B_Phase2A_PreCommit_Review_Instruction.json
docs/AI/16_Copilot_Milestone5B_Phase2A_PreCommit_Review_Instruction.md
docs/AI/16_Copilot_Milestone5B_Phase2A_PreCommit_Review_Instruction_v2.json
docs/AI/Copilot_Handoff_AI_Collaboration_Policy_Review.json
docs/AI/Copilot_Handoff_AI_Collaboration_Policy_Review.md
```

これは仮分類です。必ず内容を確認して確定してください。

---

## 9. 機密情報・品質確認

Commit候補文書について以下を確認してください。

```bash
grep -RniE 'api[_-]?key|access[_-]?token|secret|password|private[_-]?key|BEGIN [A-Z ]*PRIVATE KEY' docs/AI
```

誤検出は内容を確認してください。

また、以下を確認してください。

```bash
git diff --check
```

JSON候補は構文検証してください。

例：

```bash
node -e "JSON.parse(require('fs').readFileSync('<FILE>','utf8')); console.log('VALID_JSON')"
```

Markdown候補は末尾空白を確認してください。

---

## 10. stage方法

分類レポートと承認可能な保持対象だけを、1ファイルずつ明示してstageしてください。

```bash
git add -- <対象ファイル>
```

禁止：

```bash
git add .
git add -A
git commit -a
```

削除候補はstageしないでください。

---

## 11. staged差分監査

stage後、以下を実行してください。

```bash
git status --short
git diff --cached --stat
git diff --cached --name-only
git diff --cached --check
git diff --cached
git diff --cached | grep -nE '<<<<<<<|=======|>>>>>>>'
git diff --cached --unified=0 | grep -nEi 'api[_-]?key|access[_-]?token|secret|password|private[_-]?key|BEGIN [A-Z ]*PRIVATE KEY'
```

確認事項：

- staged対象がAI文書だけ
- `06_Verification_Result.json` が含まれていない
- 旧版・重複・廃止候補が含まれていない
- ソースコードが含まれていない
- Phase 2-B実装が含まれていない
- 機密情報なし
- trailing whitespaceなし
- Conflict markerなし
- 意図しない削除なし

---

## 12. Commit条件

以下をすべて満たす場合のみCommitしてください。

- 分類レポート作成済み
- 全未Commit AI文書を分類済み
- 正本・履歴・旧版の区別が明確
- `06_Verification_Result.json` をstageしていない
- Commit対象が保持価値のある文書だけ
- JSON構文有効
- `git diff --cached --check` 成功
- 機密情報なし
- Scope外変更なし
- 人間判断不要
- staged diff全文確認済み

判断が必要なファイルが1つでもある場合はCommitせず停止してください。

---

## 13. Commitメッセージ

以下を使用してください。

```text
docs(ai): organize phase 2A collaboration records
```

実行：

```bash
git commit -m "docs(ai): organize phase 2A collaboration records"
```

---

## 14. Commit後確認

```bash
git status --short
git log -1 --oneline
git show --stat --oneline --summary HEAD
git show --name-status --format=fuller HEAD
```

以下を確認してください。

- Commit成功
- Commit hash取得
- AI文書のみ
- 旧版・廃止候補をCommitしていない
- `06_Verification_Result.json`をCommitしていない
- Push未実施
- Phase 2-B未着手

---

## 15. Stop Condition

以下の場合はCommitせず停止してください。

- 正本判定不能
- 旧版と正本の区別不能
- 重複文書の扱いに人間判断が必要
- `06_Verification_Result.json` の扱いが不明
- 機密情報疑い
- JSON構文不正
- `git diff --cached --check`失敗
- Scope外変更混入
- ソースコード混入
- Phase 2-B実装混入
- Commit対象に廃止候補が含まれる
- Commit Hook失敗
- Commit失敗

停止時は以下を報告してください。

- 停止理由
- 該当ファイル
- 分類
- 判断不能点
- 実行コマンド
- exit code
- 重要stdout/stderr
- 推奨対応

---

## 16. 完了報告

- 未Commit AI文書確認：成功／失敗
- 分類レポート：作成済／未作成
- 正本として保持：一覧
- 実行履歴として保持：一覧
- 旧版・廃止候補：一覧
- `06_Verification_Result.json`：Commit対象外／要判断
- 機密情報確認：問題なし／問題あり／不明
- JSON構文確認：成功／失敗
- stagedファイル
- staged diff監査：成功／失敗
- `git diff --cached --check`：成功／失敗
- Commit：成功／未実施／失敗
- Commit hash
- Commit message
- Commit対象ファイル
- Commit後の未Commit変更：なし／あり
- 未Commit変更一覧
- Push：未実施
- Phase 2-B：未着手
- Stop Condition：非該当／該当
- 次工程：整理Commit確認後にPush可否判断

---

## 17. 最終指示

一回で完了できる範囲は一回で完了させてください。

ただし、削除候補・旧版・重複文書は独断で削除またはCommitせず、分類レポートへ明記してください。

安全性、正本性、今後の誤参照防止を最優先してください。

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。
