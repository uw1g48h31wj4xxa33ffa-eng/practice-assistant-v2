# Gemini向け Milestone 5-B Phase 2-A 限定Stage・Commit指示書

## 1. 目的

CopilotのCommit前レビューで `APPROVE`、Phase 2-B開始判定で `READY` が確認されたため、Milestone 5-B Phase 2-Aに属する承認済み変更だけを限定的にstageし、1回のCommitとして記録してください。

今回は **stageとCommitまで** です。Push、PR作成、Phase 2-B実装、追加修正は禁止です。

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

## 2. 前提

- Bundle Assessment：COMPLETE
- Consistency：CONSISTENT
- BLOCKER：0
- MAJOR：0
- Tests：PASS
- Build：PASS
- `npm run ai:verify`：PASS
- changed-files lint：PASS
- `git diff --check`：PASS
- Commit Decision：APPROVE
- Phase 2-B Decision：READY

## 3. 許可範囲

1. Git状態確認
2. Phase 2-A対象差分の最終確認
3. 機密情報・Scope外変更確認
4. 承認済み対象ファイルだけをstage
5. staged diff監査
6. 1回のCommit
7. Commit後確認
8. 完了報告

## 4. 禁止事項

- ソース、テスト、文書内容の修正
- 自動整形
- Phase 2-B実装
- Resolver実装
- Execution Context Builder実装
- 無関係なリファクタリング
- `git add .`
- `git add -A`
- `git commit -a`
- amend、rebase、reset、stash
- Push、PR作成、tag作成
- Scope外ファイルのstage
- エラーの握りつぶし

新たな修正が必要と判明した場合は、修正せず停止してください。

## 5. 作業開始前確認

```bash
git status --short
git diff --stat
git diff --name-only
git diff --check
git branch --show-current
git diff --name-only --diff-filter=U
```

以下を確認してください。

- Copilot承認後にソース差分が変わっていない
- Scope外変更が混在していない
- 機密情報がない
- `git diff --check` 成功
- コンフリクトなし
- detached HEADではない

## 6. Commit対象候補

実際に変更され、Phase 2-Aに属するものだけを対象にしてください。

### 実装候補

```text
src/profiles/registry/profile-loader.ts
src/profiles/tests/profile-loader.test.ts
src/profiles/index.ts
src/profiles/registry/profile-registry.ts
src/profiles/registry/version-registry.ts
src/profiles/types/form-profile.ts
```

### 証跡文書候補

```text
docs/AI/15_Gemini_Milestone5B_Phase2A_Profile_Loader_Implementation_Report.md
docs/AI/16_Milestone5B_Phase2A_Review_Context.json
docs/AI/18_Gemini_Milestone5B_Phase2A_Quality_Fix_Report.md
docs/AI/20_Milestone5B_Phase2A_Copilot_Review_Bundle.json
docs/AI/20_Gemini_Milestone5B_Phase2A_Copilot_Review_Bundle_Report.md
```

Copilotレビュー結果JSONがリポジトリ内に保存済みで、今回の承認結果と一致する場合に限り、そのファイルも含めて構いません。

以下は対象外です。

- 一時ファイル、ログ、キャッシュ、build生成物
- `node_modules`
- 個人設定、IDE設定
- 認証情報、秘密情報
- Phase 2-B関連
- 今回のCommit指示書そのもの
- 内容不明の未追跡ファイル

判断できないファイルがある場合はstageせず停止してください。

## 7. stage方法

対象ファイルを1つずつ明示してください。

```bash
git add -- <対象ファイル>
```

`git add .`、`git add -A`は禁止です。

## 8. staged差分監査

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

- stagedファイルがPhase 2-Aのみ
- Scope外変更なし
- 意図しない削除なし
- 機密情報なし
- trailing whitespaceなし
- コンフリクトマーカーなし
- Phase 2-B実装なし
- 巨大バイナリなし

grepの誤検出がある場合は内容を確認し、判断できなければ停止してください。

## 9. Commit条件

以下をすべて満たした場合のみCommitしてください。

- Copilot判定APPROVE
- BLOCKER 0、MAJOR 0
- staged対象がPhase 2-Aのみ
- `git diff --cached --check` 成功
- コンフリクトなし
- 機密情報なし
- Scope外変更なし
- staged diff全文確認済み
- Commit対象が空ではない

## 10. Commitメッセージ

```text
feat(profiles): complete milestone 5B phase 2A profile loader
```

実行：

```bash
git commit -m "feat(profiles): complete milestone 5B phase 2A profile loader"
```

既存規約に明確に反する場合のみ、規約に合わせて最小限変更してください。

## 11. Commit後確認

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

未Commit変更が残る場合、勝手に追加Commitせず報告してください。

## 12. Stop Condition

以下の場合はCommitせず停止してください。

- Copilot承認後に実装差分が変化
- 必須対象不足
- Scope外変更混在
- 不明なstaged差分
- 機密情報疑い
- `git diff --check` または `git diff --cached --check` 失敗
- コンフリクト
- detached HEAD
- Commit対象空
- Commit Hook失敗
- Commit失敗
- Phase 2-B変更検出
- 承認内容との不一致

停止時は、理由、該当ファイル、コマンド、exit code、重要stdout/stderr、人間判断点、推奨対応を報告してください。

## 13. 完了報告

- 事前Git確認：成功／失敗
- 対象Scope確認：成功／失敗
- 機密情報確認：問題なし／問題あり／不明
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
- 次工程：Commit内容確認後にPush可否判断

## 14. 最終指示

一回で完了できる範囲は一回で完了させてください。ただし、安全性と対象限定を最優先とし、承認済みPhase 2-A以外は絶対にCommitしないでください。

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。
