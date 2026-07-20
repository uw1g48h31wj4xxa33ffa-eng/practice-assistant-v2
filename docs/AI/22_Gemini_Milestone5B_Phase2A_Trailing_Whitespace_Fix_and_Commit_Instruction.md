# Gemini向け Milestone 5-B Phase 2-A 報告書末尾空白限定修正・再監査・Commit指示書

## 1. 目的

前回の限定Stage・Commit作業では、以下の理由でCommitを停止しました。

```text
docs/AI/15_Milestone5B_Phase2A_Profile_Loader_Implementation_Report.md:3: trailing whitespace
docs/AI/15_Milestone5B_Phase2A_Profile_Loader_Implementation_Report.md:4: trailing whitespace
docs/AI/15_Milestone5B_Phase2A_Profile_Loader_Implementation_Report.md:56: trailing whitespace
```

今回は、上記報告書の末尾空白だけを除去し、既にstage済みのPhase 2-A対象一式を再監査した上で、条件を満たす場合に限りCommitしてください。

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

---

## 2. 許可する変更

変更を許可するのは、次の1ファイルに存在する末尾空白の除去だけです。

```text
docs/AI/15_Milestone5B_Phase2A_Profile_Loader_Implementation_Report.md
```

対象行：

- 3行目
- 4行目
- 56行目

実際の行番号が変動している場合も、`git diff --cached --check` が指摘する末尾空白だけを除去してください。

Markdownの本文、見出し、語句、改行構造、意味、記載内容は変更してはいけません。

---

## 3. 禁止事項

- ソースコード変更
- テストコード変更
- JSON変更
- 他のMarkdown変更
- 文章修正
- 表現変更
- 見出し変更
- 改行追加または削除
- 自動整形による広範囲変更
- Phase 2-B着手
- 対象外ファイルのstage
- `git add .`
- `git add -A`
- `git commit -a`
- amend
- rebase
- reset
- stash
- Push
- PR作成
- tag作成
- Commitを複数回行うこと

---

## 4. 現在のstage状態確認

最初に以下を実行してください。

```bash
git status --short
git diff --cached --name-only
git diff --cached --check
```

前回stageした対象が維持されていることを確認してください。

想定stage対象：

```text
src/profiles/registry/profile-loader.ts
src/profiles/tests/profile-loader.test.ts
src/profiles/index.ts
src/profiles/registry/profile-registry.ts
src/profiles/registry/version-registry.ts
src/profiles/types/form-profile.ts
src/profiles/schemas/form-profile.schema.json
docs/AI/15_Milestone5B_Phase2A_Profile_Loader_Implementation_Report.md
docs/AI/16_Milestone5B_Phase2A_Review_Context.json
docs/AI/18_Gemini_Milestone5B_Phase2A_Quality_Fix_Report.md
docs/AI/20_Milestone5B_Phase2A_Copilot_Review_Bundle.json
docs/AI/20_Gemini_Milestone5B_Phase2A_Copilot_Review_Bundle_Report.md
```

差異や不明なstage対象がある場合は停止してください。

---

## 5. 末尾空白の限定修正

対象ファイルだけに対し、末尾空白を除去してください。

例：

```bash
sed -i '' -e 's/[[:space:]]*$//' docs/AI/15_Milestone5B_Phase2A_Profile_Loader_Implementation_Report.md
```

ただし、この処理により意図しない広範囲差分が発生しないことを必ず確認してください。

修正後：

```bash
git diff -- docs/AI/15_Milestone5B_Phase2A_Profile_Loader_Implementation_Report.md
```

確認事項：

- 変更は末尾空白除去だけ
- 本文変更なし
- 行削除なし
- 見出し変更なし
- 意味変更なし

---

## 6. 対象ファイルだけ再stage

```bash
git add -- docs/AI/15_Milestone5B_Phase2A_Profile_Loader_Implementation_Report.md
```

他のファイルを再stageする必要はありません。

---

## 7. Commit前再監査

以下を順に実行してください。

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

- `git diff --cached --check` がexit code 0
- stage対象がPhase 2-Aのみ
- 末尾空白なし
- コンフリクトマーカーなし
- 機密情報なし
- 意図しない削除なし
- Phase 2-B変更なし
- 前回Copilot承認内容との不一致なし

grepが説明文等を誤検出した場合は内容を確認してください。判断できなければ停止してください。

---

## 8. Commit条件

以下をすべて満たす場合のみCommitしてください。

- 修正対象が報告書の末尾空白だけ
- stagedファイル一覧が想定どおり
- `git diff --cached --check` 成功
- Scope外変更なし
- 機密情報なし
- コンフリクトなし
- Phase 2-B変更なし
- staged diff全文確認済み

---

## 9. Commit

Commitメッセージ：

```text
feat(profiles): complete milestone 5B phase 2A profile loader
```

実行：

```bash
git commit -m "feat(profiles): complete milestone 5B phase 2A profile loader"
```

---

## 10. Commit後確認

```bash
git status --short
git log -1 --oneline
git show --stat --oneline --summary HEAD
git show --name-status --format=fuller HEAD
```

確認事項：

- Commit成功
- Commit hash取得
- Commit message正確
- 対象ファイルだけがCommitされた
- Push未実施
- Phase 2-B未着手

未Commit変更が残っている場合は、勝手に修正・stage・追加Commitせず、そのまま報告してください。

---

## 11. Stop Condition

以下の場合はCommitせず停止してください。

- 報告書以外に新たな変更が発生
- 末尾空白以外の差分が発生
- staged対象が想定と不一致
- `git diff --cached --check`失敗
- Scope外変更あり
- 機密情報の疑い
- コンフリクトあり
- Phase 2-B変更検出
- Commit Hook失敗
- Commit失敗

停止時は、理由、対象ファイル、コマンド、exit code、重要stdout/stderr、人間判断点、推奨対応を報告してください。

---

## 12. 完了報告

- 事前stage確認：成功／失敗
- 末尾空白限定修正：成功／失敗
- 修正対象ファイル
- 本文変更：なし／あり
- 再stage：成功／失敗
- staged diff監査：成功／失敗
- `git diff --cached --check`：成功／失敗
- 機密情報確認：問題なし／問題あり／不明
- Commit：成功／未実施／失敗
- Commit hash
- Commit message
- Commit対象ファイル
- Commit後の未Commit変更：なし／あり
- Push：未実施
- Phase 2-B：未着手
- Stop Condition：非該当／該当
- 次工程：Commit内容確認後にPush可否判断
