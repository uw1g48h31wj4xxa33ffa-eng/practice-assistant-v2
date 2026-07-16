# Gemini Request — Practice Assistant V2 / Word Document Engine Level 4-B

## 0. 読み込み順序

作業開始前に、以下を順番に読み込んでください。

1. `Gemini_Master_Instruction_v2.0.md`
2. この `L4B_Request.md`
3. リポジトリ内に以下が存在する場合は、続けて読み込むこと
   - `docs/AI/01_Project/Current_Status.md`
   - `docs/AI/01_Project/Architecture.md`
   - `docs/AI/01_Project/Known_Issues.md`
   - `docs/AI/03_Report/Gemini_Report.md`

この作業では、チャット履歴ではなく、上記Markdownを正本として扱ってください。

身勝手な推測や独断は絶対にしないでください。  
指示書を忠実に守ってください。

---

## 1. 今回の目的

Level 4-Aで実装・検証済みの差分について、最終確認結果を反映し、Markdown資産を整備したうえで、対象ファイル限定stage、commit、pushまで完了してください。

今回は新機能追加ではありません。

対象は次のみです。

- Level 4-A差分の最終監査
- 人間確認済みWord結果の反映
- AI間引継ぎ用Markdownの作成・更新
- 対象ファイル限定stage
- commit
- push
- 人間向け要点サマリー作成

---

## 2. 確定済みの人間確認結果

以下は人間によるMicrosoft Word確認済み結果として扱ってください。

- Word修復警告：なし
- 重大なレイアウト崩れ：なし
- 指定事業場一覧
  - 1行目：東京本社
  - 2行目：大阪支社
  - 末尾プレースホルダー残存なし
- 賃金引上げ対象労働者一覧
  - 山田太郎
  - 佐藤花子
  - 表示崩れなし
- 固定行テーブルの罫線・構造：目視上問題なし

この人間確認結果を理由なく再解釈しないでください。

---

## 3. 作業開始前Gate

以下を実行し、証跡を取得してください。

```bash
cd /Users/to/practice-assistant-v2/dev/practice-assistant-v2

pwd
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git status --short
git diff --stat
git diff --name-only
find . -type f -name "*.docx" -not -path "./node_modules/*"
shasum -a 256 /Users/to/Documents/practice-assistant-input/001687895.docx
```

開始基準：

- branch：`main`
- HEAD：`3c3acfb5f5a62de09b4631abce28640d56f8b787`
- origin/main：`3c3acfb5f5a62de09b4631abce28640d56f8b787`
- Level 4-A差分が未commitで残っている
- リポジトリ内docxなし
- 原本SHA-256：
  `b87253adeb29b593913c97fe972a4bb3afb8c36bac6dbb66bd70d08146963da8`

想定外の差分がある場合は停止してください。

---

## 4. AI Markdown資産

以下の構成を使用してください。

```text
docs/AI/
├── 00_Master/
│   ├── Gemini_Master_Instruction_v2.0.md
│   └── AI_Collaboration_Rules.md
├── 01_Project/
│   ├── Current_Status.md
│   ├── Architecture.md
│   ├── Decisions.md
│   ├── Progress_Log.md
│   └── Known_Issues.md
├── 02_Request/
│   └── L4B_Request.md
└── 03_Report/
    ├── Gemini_Report.md
    └── Human_Summary.md
```

### 4.1 既存ファイルがある場合

追記・更新してください。全置換は禁止です。

### 4.2 存在しない場合

今回の作業に必要な最小内容で新規作成してください。

### 4.3 各ファイルの責務

#### `Current_Status.md`

現在の正式状態だけを記載します。

最低限：

- 現在フェーズ
- HEAD / origin/main
- Git状態
- Level 4-A実装内容
- テスト件数・結果
- verify結果
- build / lint結果
- OutputVerifier結果
- DomSerializationVerifier結果
- 原本SHA-256
- 出力SHA-256
- Word人間確認結果
- 次のフェーズ

#### `Architecture.md`

今回確定した責務境界を記載します。

最低限：

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

#### `Decisions.md`

今回確定した設計判断だけを追記します。

最低限：

- verified / modifiedのみ出力
- unverified / rejectedは除外
- manualCheck / humanReviewは人間確認前に解除しない
- POSTでDTO返却、GETでdownloadId取得
- Verifier失敗時はdownloadIdを返さない
- MarkdownをAI間連携の正本とする

#### `Progress_Log.md`

Level 4-AからLevel 4-Bまでの実施履歴を簡潔に追記します。

#### `Known_Issues.md`

未解決事項のみを記載します。

既存lintなど今回対象外の問題がある場合は、今回変更由来ではないことを明記してください。

#### `Gemini_Report.md`

詳細な技術報告・証跡を記載します。

#### `Human_Summary.md`

人間向けに、以下だけを簡潔に記載してください。

```text
■ 実施
■ 結果
■ 要確認
■ 判断事項
■ 次工程
```

詳細説明は書かないでください。

---

## 5. 最終自動検証Gate

コード変更は原則禁止です。

ただし、Markdown作成・更新は実施してください。

以下を再実行してください。

```bash
node --test scripts/document-verification/tests/*.test.mjs
node scripts/document-verification/verify-career-up-form1.mjs
node scripts/document-verification/verify-hatarakikata-r8-form1.mjs
npm run build
npm run lint
find . -type f -name "*.docx" -not -path "./node_modules/*"
shasum -a 256 /Users/to/Documents/practice-assistant-input/001687895.docx
```

各コマンドについて、以下を`Gemini_Report.md`へ記録してください。

- Command
- Exit Code
- pass / fail / warning件数
- 結果
- 既存問題と今回変更由来問題の区別

今回変更由来のlint error / warningは0件であること。

---

## 6. Git差分監査Gate

以下を実行してください。

```bash
git status --short
git diff --stat
git diff --name-only
git diff
```

確認事項：

- 指示範囲外変更なし
- 不要なリファクタリングなし
- 一時ファイルなし
- リポジトリ内docxなし
- 実顧客情報なし
- 不適切な絶対パスなし
- テスト削除・skipなし
- Verifier弱体化なし
- manualCheck / humanReviewの不当解除なし

問題があればcommitせず停止してください。

---

## 7. stage・commit・push

すべてのGateが成功した場合のみ実施してください。

### 7.1 stage

`git add .`、`git add -A`は禁止です。

`git diff --name-only`と新規ファイル一覧を確認し、今回対象ファイルだけを個別にstageしてください。

### 7.2 staged監査

```bash
git diff --cached --stat
git diff --cached --name-only
git diff --cached
```

対象外ファイルが含まれる場合はcommit禁止です。

### 7.3 commit

推奨commit message：

```text
feat: integrate Word Document Engine with case delivery flow
```

### 7.4 push

```bash
git push origin main
```

push後に以下を確認してください。

```bash
git rev-parse HEAD
git rev-parse origin/main
git status --short
```

HEADとorigin/mainが一致し、working tree cleanであること。

---

## 8. 停止条件

以下の場合はcommit・pushせず停止してください。

- テスト失敗
- verify失敗
- build失敗
- 今回変更由来lint error / warning
- OutputVerifier失敗
- DomSerializationVerifier失敗
- 原本SHA-256不一致
- リポジトリ内docx存在
- 対象外差分
- staged内容に対象外ファイル
- 人間確認結果と実装結果の不一致
- Markdown資産に実測値と異なる記載
- push失敗

---

## 9. 完了後のMarkdown更新

commit・push成功後、以下を最終状態へ更新してください。

- `Current_Status.md`
- `Progress_Log.md`
- `Gemini_Report.md`
- `Human_Summary.md`

ただし、commit後にMarkdownを更新して未commit差分を残してはいけません。

したがって、最終HEAD・commit hash・push結果は、commit前に確定できない項目のみプレースホルダーにせず、次のいずれかで処理してください。

1. commit直前に記載可能な情報をすべて反映し、commit後のhashだけはチャット要点報告に記載する
2. どうしてもMarkdownへhash記載が必要な場合は、Markdown更新用の第2commitを明示し、対象ファイル限定stageで実施する

原則は1を採用してください。

---

## 10. 人間向けチャット報告

チャットには詳細を書かず、以下だけを列挙してください。

```text
■ 結論
■ commit hash
■ push結果
■ テスト
■ verify
■ build / lint
■ Word確認
■ Git状態
■ Markdown更新
■ 未解決事項
```

詳細は`docs/AI/03_Report/Gemini_Report.md`へ記録してください。

---

## 11. 完了チェックリスト

すべて実測値で確認してください。

```text
[ ] Master読込
[ ] Request読込
[ ] Current_Status読込
[ ] AI Markdown資産作成・更新
[ ] 全自動テスト成功
[ ] 既存様式verify成功
[ ] 第2様式verify成功
[ ] build成功
[ ] 今回変更由来lint 0
[ ] OutputVerifier成功
[ ] DomSerializationVerifier成功
[ ] 原本SHA-256一致
[ ] リポジトリ内docxなし
[ ] Git差分監査成功
[ ] 対象ファイル限定stage
[ ] staged差分監査成功
[ ] commit成功
[ ] push成功
[ ] HEAD = origin/main
[ ] working tree clean
[ ] Human_Summary.md更新
```

未達が1件でもある場合は「未完了」と記録し、commit・push前なら停止してください。
