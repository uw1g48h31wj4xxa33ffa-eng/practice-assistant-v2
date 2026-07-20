# Gemini向け Milestone 5-B Phase 2-A 限定Push指示書

## 1. 目的

Milestone 5-B Phase 2-Aの承認済みCommit `168e8b6` を、現在の `main` ブランチから `origin/main` へPushしてください。

今回は **Pushのみ** です。

以下は禁止です。

- ファイル変更
- stage
- 追加Commit
- amend
- rebase
- merge
- pull
- reset
- stash
- force push
- tag作成
- PR作成
- Phase 2-B着手

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

---

## 2. 前提確認済み事項

Push前最終確認では以下が確認済みです。

- HEAD：`168e8b6`
- Commit message：`feat(profiles): complete milestone 5B phase 2A profile loader`
- 現在ブランチ：`main`
- upstream：`origin/main`
- remote：`origin`
- ahead / behind：`ahead 1`
- Scope外混入：なし
- Phase 2-B混入：なし
- 機密情報：なし
- Push妨害要因：なし
- Push可否：可

ただし、Push直前に状態が変化していないことを再確認してください。

---

## 3. Push前の必須再確認

以下を実行してください。

```bash
git status -sb
git status --short
git branch --show-current
git log -1 --oneline
git rev-parse HEAD
git rev-parse --abbrev-ref --symbolic-full-name @{u}
git remote -v
```

以下を確認してください。

- 現在ブランチが `main`
- HEADが `168e8b6`
- 最新Commit messageが完全一致
- upstreamが `origin/main`
- `main` が `origin/main` よりahead 1
- detached HEADではない
- Push先が `origin main`
- 未Commit変更は存在しても、今回のCommitとは分離されている
- 新たなCommitが追加されていない
- branch、remote、upstreamが前回確認時から変わっていない

---

## 4. Remote差分の安全確認

Push前に、リモートの最新状態を取得するため、以下のみ実行して構いません。

```bash
git fetch origin
```

`fetch`後、以下を確認してください。

```bash
git status -sb
git rev-list --left-right --count origin/main...main
git log --oneline --decorate --graph -5 --all
```

期待値：

```text
0 1
```

すなわち、

- origin/main側だけの未取得Commit：0
- main側だけの未Push Commit：1

であることを確認してください。

### 注意

以下は禁止です。

- `git pull`
- merge
- rebase
- reset
- cherry-pick

`git fetch origin` 後にbehindが検出された場合はPushせず停止してください。

---

## 5. Push実行条件

以下をすべて満たした場合のみPushしてください。

- 現在ブランチが `main`
- HEADが `168e8b6`
- 最新Commit messageが一致
- upstreamが `origin/main`
- remoteが想定どおり
- `origin/main...main` が `0 1`
- Scope外Commitなし
- Phase 2-B Commitなし
- 機密情報なし
- detached HEADではない
- Push先が明確
- force不要
- Stop Condition非該当

---

## 6. Pushコマンド

以下を実行してください。

```bash
git push origin main
```

以下は禁止です。

```bash
git push --force
git push --force-with-lease
git push -f
```

---

## 7. Push後確認

Push成功後、以下を実行してください。

```bash
git status -sb
git log -1 --oneline
git rev-parse HEAD
git rev-parse origin/main
git rev-list --left-right --count origin/main...main
```

期待値：

- `HEAD`：`168e8b6`
- `origin/main`：`168e8b6`
- ahead / behind：`0 0`

必要に応じて以下も確認してください。

```bash
git branch -vv
```

---

## 8. 未Commit変更の扱い

未Commit変更や未追跡ファイルが存在しても、今回のPush対象Commitに含まれていない限り、そのまま残してください。

以下は禁止です。

- 修正
- 削除
- stage
- Commit
- stash
- clean

未Commit変更一覧はPush後報告に記載してください。

---

## 9. Stop Condition

以下の場合はPushせず停止してください。

- HEADが `168e8b6` ではない
- 最新Commit message不一致
- 現在ブランチが `main` ではない
- upstreamが `origin/main` ではない
- detached HEAD
- `git fetch origin` 後にbehindがある
- `origin/main...main` が `0 1` ではない
- Push先不明
- Remote URL不一致
- 新たなCommit混入
- Phase 2-B Commit混入
- 機密情報疑い
- non-fast-forwardが予想される
- Push失敗
- 認証エラー
- 権限エラー
- ネットワークエラー

停止時は以下を報告してください。

- 停止理由
- 実行コマンド
- exit code
- 重要stdout/stderr
- 現在ブランチ
- HEAD
- origin/main
- ahead / behind
- 人間判断が必要な点
- 推奨対応

---

## 10. 完了報告

以下の形式で簡潔に報告してください。

- Push前ブランチ確認：成功／失敗
- Push前HEAD確認：一致／不一致
- upstream確認：成功／失敗
- fetch：成功／失敗
- fetch後ahead / behind
- Push：成功／未実施／失敗
- Push先
- PushしたCommit hash
- Push後HEAD
- Push後origin/main
- Push後ahead / behind
- 未Commit変更：なし／あり
- 未Commit変更一覧
- ファイル変更：未実施
- stage：未実施
- 追加Commit：未実施
- force push：未実施
- PR作成：未実施
- Phase 2-B：未着手
- Stop Condition：非該当／該当
- 次工程：Phase 2-B開始準備

---

## 11. 最終指示

今回許可されているのは、承認済みCommit `168e8b6` を `origin/main` へ通常Pushすることだけです。

Push前後の状態を必ず証拠付きで確認してください。

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。
