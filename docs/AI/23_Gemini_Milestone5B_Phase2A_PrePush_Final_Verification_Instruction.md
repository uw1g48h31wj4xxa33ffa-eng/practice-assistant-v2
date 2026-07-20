# Gemini向け Milestone 5-B Phase 2-A Push前最終確認指示書

## 1. 目的

Milestone 5-B Phase 2-AのCommit `168e8b6` について、Push前の最終確認を実施してください。

今回は確認のみです。

- ファイル変更禁止
- stage禁止
- Commit禁止
- Push禁止
- PR作成禁止
- Phase 2-B着手禁止

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

## 2. 確認対象

### Commit

```text
168e8b6
```

### Commit message

```text
feat(profiles): complete milestone 5B phase 2A profile loader
```

### 想定Commit対象

```text
src/profiles/registry/profile-loader.ts
src/profiles/tests/profile-loader.test.ts
src/profiles/index.ts
src/profiles/registry/profile-registry.ts
src/profiles/registry/version-registry.ts
src/profiles/schemas/form-profile.schema.json
src/profiles/types/form-profile.ts
docs/AI/15_Milestone5B_Phase2A_Profile_Loader_Implementation_Report.md
docs/AI/16_Milestone5B_Phase2A_Review_Context.json
docs/AI/18_Gemini_Milestone5B_Phase2A_Quality_Fix_Report.md
docs/AI/20_Milestone5B_Phase2A_Copilot_Review_Bundle_Report.md
docs/AI/20_Milestone5B_Phase2A_Copilot_Review_Bundle.json
```

## 3. 必須確認コマンド

以下を順に実行してください。

```bash
git status --short
git branch --show-current
git rev-parse --abbrev-ref --symbolic-full-name @{u}
git log -1 --oneline
git show --stat --oneline --summary 168e8b6
git show --name-status --format=fuller 168e8b6
git show --check 168e8b6
git diff 168e8b6^ 168e8b6 --stat
git diff 168e8b6^ 168e8b6 --name-only
```

upstream未設定の場合、`git rev-parse --abbrev-ref --symbolic-full-name @{u}` が失敗しても、それだけで異常とは断定しないでください。結果をそのまま報告してください。

## 4. Commit内容の確認

以下を確認してください。

- `HEAD` が `168e8b6` である
- Commit messageが完全一致する
- Commit対象ファイルが想定範囲内である
- Phase 2-Bの実装が含まれていない
- Scope外ファイルが含まれていない
- 意図しない削除がない
- バイナリや巨大生成物が含まれていない
- 機密情報が含まれていない
- trailing whitespaceやConflict markerがない
- Copilot承認済みのPhase 2-A内容と整合する

Commit差分全文も確認してください。

```bash
git show --format=fuller --find-renames 168e8b6
```

## 5. 未Commit変更の確認

`git status --short` に表示されるすべての未Commit変更・未追跡ファイルを分類してください。

各項目について以下を記載してください。

- path
- status
- 内容の要約
- Phase 2-Aとの関係
- Phase 2-Bとの関係
- Pushを妨げるか
- 推奨処理

分類は以下を使用してください。

```text
A: Phase 2-Aと無関係でPushを妨げない
B: Phase 2-B準備資料でPushを妨げない
C: 内容確認が必要
D: Push前に対応必須
```

未Commit変更を勝手に修正、削除、stage、Commitしてはいけません。

## 6. Remote・Push先確認

以下を確認してください。

```bash
git remote -v
git branch -vv
git status -sb
```

確認事項：

- 現在のブランチ名
- upstreamの有無
- ahead / behind状態
- 想定remote
- Push先候補
- detached HEADでない
- リモートとの差分に異常がない

Remote URLに認証情報や秘密情報が含まれる場合、報告にはマスキングしてください。

## 7. Push可否判定

### Push可

以下をすべて満たす場合：

- `HEAD` が `168e8b6`
- Commit messageが一致
- Commit対象がPhase 2-Aの承認済み範囲内
- Scope外変更がCommitに含まれていない
- Phase 2-B実装がCommitに含まれていない
- 機密情報なし
- Commit構造に異常なし
- 未Commit変更がPushを妨げない
- 現在ブランチとPush先が確認可能
- detached HEADではない
- 重大なbehind状態や競合リスクがない

### Push不可

以下のいずれかに該当する場合：

- `HEAD` が想定Commitと不一致
- Commit内容にScope外変更
- Phase 2-B実装混入
- 機密情報疑い
- 意図しない削除
- Push先不明
- detached HEAD
- リモート競合リスク
- 未Commit変更に重大な不明点
- Commit内容とCopilot承認内容が不一致

### 条件付き

軽微な未確認事項があり、人間確認後にPush可能な場合。

## 8. 禁止事項

- ファイル編集
- 自動整形
- stage
- Commit
- amend
- reset
- rebase
- merge
- pull
- fetch後の変更操作
- stash
- Push
- force push
- PR作成
- tag作成
- 未追跡ファイル削除
- Phase 2-B着手
- エラーの握りつぶし

今回は確認だけです。

## 9. Stop Condition

以下の場合は作業を停止し、Push不可または条件付きとしてください。

- Commit hash不一致
- Commit message不一致
- Scope外変更混入
- 機密情報疑い
- detached HEAD
- Push先不明
- リモート状態の判定不能
- 想定外のCommitがHEADに存在
- Commit内容に不明な変更
- 未Commit変更にPhase 2-Aの未反映修正がある
- Phase 2-B実装混入

## 10. 完了報告形式

以下の形式で簡潔に報告してください。

- HEAD確認：一致／不一致
- Commit hash
- Commit message：一致／不一致
- Commit対象ファイル：一致／不一致
- Scope外混入：なし／あり／不明
- Phase 2-B混入：なし／あり／不明
- 機密情報：なし／あり／不明
- Commit差分監査：成功／失敗
- 現在ブランチ
- upstream：設定済／未設定／不明
- remote
- ahead / behind
- 未Commit変更：なし／あり
- 未Commit変更分類
- Push妨害要因：なし／あり
- Push可否：可／不可／条件付き
- Push先候補
- Pushコマンド候補
- Stop Condition：非該当／該当
- ファイル変更：未実施
- stage：未実施
- Commit：未実施
- Push：未実施

## 11. 最終指示

Pushは絶対に実行しないでください。

Push前の事実確認と可否判定だけを行い、証拠となるコマンド結果に基づいて報告してください。

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。
