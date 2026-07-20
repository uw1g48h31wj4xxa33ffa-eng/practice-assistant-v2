# Gemini向け Milestone 5-B Phase 2-B 設計決議反映・実装開始指示書

## 1. 目的

承認済みのPhase 2-B設計決議書に基づき、feature branchを作成し、Phase 2-Bを最小差分で実装・検証してください。

身勝手な推測や独断は絶対にしないでください。指示書と設計決議書を忠実に守ってください。

---

## 2. 最初に読む正本

必ず以下を読むこと。

```text
docs/AI/12_Milestone5B_Phase2_Design_Scope_Stop_Conditions.md
docs/AI/13_Milestone5B_Phase2_PreImplementation_Research.md
docs/AI/34_Milestone5B_Phase2B_Design_Decision.md
```

加えて既存実装：

```text
src/profiles/registry/profile-loader.ts
src/profiles/registry/profile-registry.ts
src/profiles/registry/version-registry.ts
src/profiles/tests/profile-loader.test.ts
```

---

## 3. Gate 1：開始状態確認

以下を直列に確認し、条件成立前にbranch作成しないこと。

```bash
git status -sb
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git rev-list --left-right --count origin/main...main
git diff --name-only
git diff --cached --name-only
```

開始条件：

- branch=`main`
- HEAD=`f850acbb8e6a645ca3ce87dd4764fe1f2e6796b7`
- origin/main同一
- ahead / behind=`0 0`
- 設計決議書と本指示書以外に未Commit差分なし
- staged変更なし

不一致なら停止。

---

## 4. Gate 2：feature branch作成

条件成立後、次を別コマンドで実行。

```bash
git switch -c feature/milestone-5b-phase2-profile-resolution
```

作成後確認：

```bash
git branch --show-current
git status -sb
```

---

## 5. Gate 3：既存型・API整合性確認

実装前に確認：

- `Profile`
- `ProfileType`
- `ProfileRegistry.resolveActive`
- `VersionRegistry.resolveActive`
- 既存error class
- 既存naming convention
- 既存test framework
- Career-Up Form mapping型
- Adapter候補配置
- 既存verify経路

設計決議書の型名・型構造が既存実装と衝突する場合、独断で変更せず停止して報告すること。

---

## 6. 実装範囲

実装対象：

- ResolveRequest
- ResolveEvidence
- ResolveWarning
- ResolveError
- ResolveResult
- ProfileResolver
- ExecutionContext
- ExecutionContextBuilder
- Career-Up Form向けAdapter
- profile-driven経路の明示的入口
- unit/integration tests

必須契約：

- effectiveDate必須
- Invalid Date拒否
- Resolver内部で現在日時を生成しない
- Registryの既存throw契約を変更しない
- Resolver境界で例外をResult型へ変換
- `null`失敗禁止
- 自動fallback禁止
- ambiguousを明示失敗
- 循環参照を明示失敗
- evidence順序保持
- ExecutionContextはreadonly
- BuilderはRegistry/Resolverへ再アクセスしない
- AdapterはRegistry/Resolverへアクセスしない
- 既存レガシー経路は変更しない
- 環境変数feature flagを追加しない
- 新経路は明示的入口からのみ呼び出す

---

## 7. 対象外

- 新規Provider
- tenant/client/case識別子
- version override
- UI変更
- API変更
- Word Engine本体変更
- Document Engine本体変更
- 自動fallback
- legacy path切替
- Phase 3以降
- 大規模共通化
- 無関係リファクタリング
- 既存テスト期待値変更

---

## 8. 実装順序

1. 既存構造調査
2. 型・契約
3. Resolver
4. error/result変換
5. ExecutionContextBuilder
6. Adapter
7. 明示的入口
8. unit test
9. integration test
10. 全体verify
11. Git差分監査
12. 証拠付き報告

---

## 9. テスト要件

最低限追加：

- 単一profile正常解決
- 連鎖解決
- effectiveDate開始境界
- effectiveDate終了境界
- Active versionなし
- ambiguous
- Invalid Date
- profile type不一致
- 循環参照
- Registry throwのResult変換
- evidence順序
- warning/error内容
- fallbackされないこと
- context readonly
- 失敗結果からcontext構築拒否
- Adapter変換
- legacy path無変更
- Phase 2-A既存テスト全PASS

既存期待値変更禁止。

---

## 10. 検証

package.jsonで正式なscriptを確認し、最低限以下を実行。

```bash
npx tsx --test
npm run lint
npm run build
npm run ai:verify
git diff --check
```

存在しないscriptを推測しない。

各コマンドについて記録：

- command
- startedAt
- finishedAt
- exit code
- stdout/stderr要約
- test件数
- PASS/FAIL/SKIP

---

## 11. Git差分監査

```bash
git status --short
git diff --stat
git diff --name-only
git diff --check
git diff
git diff --cached --name-only
```

確認：

- 対象外差分なし
- staged変更なし
- debug codeなし
- TODO放置なし
- console出力なし
- error握りつぶしなし
- lockfile不要変更なし
- generated file不要変更なし
- secretsなし
- legacy path変更なし
- 既存期待値変更なし

---

## 12. Git操作制限

今回は以下まで実施可能：

- feature branch作成
- ファイル編集
- テスト
- verify
- build
- lint
- 差分監査

禁止：

- stage
- Commit
- Push
- PR
- merge
- rebase
- reset
- stash
- amend
- force操作

---

## 13. Stop Conditions

以下に該当したら即停止：

- 設計決議書と既存型が矛盾
- ProfileTypeが存在しない、または意味不一致
- 既存Registry契約変更が必要
- ProfileLoader公開API変更が必要
- Word/Document Engine本体変更が必要
- legacy path変更が必要
- 自動fallbackが必要
- 既存テスト期待値変更が必要
- Adapter互換形式が特定不能
- 循環参照仕様が不明
- 対象外大規模リファクタリングが必要
- 正本文書間矛盾
- 設計決議書・本指示書以外の開始前差分が存在

停止時はコード変更を最小限に戻し、証拠付き報告を行うこと。破壊的Git操作は禁止。

---

## 14. 完了報告形式

### A. 開始状態
- branch
- HEAD
- origin/main
- ahead/behind
- working tree
- staged

### B. branch作成
- command
- result
- current branch

### C. 既存構造確認
- Profile/ProfileType
- Registry API
- error model
- mapping型
- test framework
- verify commands

### D. 実装
- 変更ファイル
- 型
- Resolver
- Result変換
- ExecutionContextBuilder
- Adapter
- 明示的入口
- legacy compatibility

### E. テスト
- 追加test一覧
- command
- exit code
- 件数
- PASS/FAIL/SKIP

### F. 検証
- lint
- build
- ai:verify
- diff check

### G. 差分監査
- status
- diff stat
- file list
- staged
- 対象外差分
- secrets
- debug/TODO
- legacy path変更

### H. Git状態
- stage未実施
- Commit未実施
- Push未実施
- PR未作成

### I. 最終判定
- Phase 2-B完了候補 / 停止
- Stop Condition
- 人間レビュー要否
- 次工程

---

## 15. 最終指示

設計決議書を正本として扱い、feature branch上で最小差分実装を行ってください。

不明点を独断で補完しないでください。

一回で完了可能な範囲は、調査、実装、テスト、verify、build、lint、差分監査、証拠付き報告まで一括で進めてください。

ただしStop Conditionに該当する場合は、実装せず停止してください。

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。
