# Gemini向け Milestone 5-B Phase 2-A 限定品質修正指示書

## 1. 目的

Milestone 5-B Phase 2-Aの実装内容・仕様・責務を変更せず、Commitを阻害している品質上の問題だけを限定的に修正してください。

今回の対象は以下のみです。

1. `src/profiles/tests/profile-loader.test.ts` 内の新規Lintエラー
2. `git diff --check` が検出した末尾空白
3. changed-files lint失敗
4. `npm run ai:verify`失敗
5. 修正後のReview Context JSON更新

実装機能の追加、設計変更、リファクタリング、Phase 2-Bの着手は禁止です。

---

## 2. 必須参照文書

作業前に以下を最初から最後まで確認してください。

- `docs/AI/00_AI_Collaboration_Policy_and_Operating_History.json`
- `docs/AI/12_Milestone5B_Phase2_Design_Scope_Stop_Conditions.md`
- `docs/AI/13_Milestone5B_Phase2_PreImplementation_Research.md`
- `docs/AI/15_Gemini_Milestone5B_Phase2A_Profile_Loader_Implementation_Instruction.md`
- `docs/AI/15_Gemini_Milestone5B_Phase2A_Profile_Loader_Implementation_Report.md`
- `docs/AI/16_Milestone5B_Phase2A_Review_Context.json`
- `docs/AI/17_Gemini_Milestone5B_Phase2A_Review_Context_JSON_Generation_Instruction.md`

ファイル名が実際のリポジトリと異なる場合は、同一内容の正本を確認してください。推測で代替しないでください。

---

## 3. 作業開始前の状態確認

最初に以下を実行し、現在の状態を記録してください。

```bash
git status --short
git diff --stat
git diff --name-only
git diff --check
```

続いて、今回変更対象となっているファイルの差分を確認してください。

```bash
git diff -- src/profiles/tests/profile-loader.test.ts
git diff -- src/profiles/registry/profile-loader.ts
```

Review Context JSONおよび実装報告と実際のGit差分が一致しない場合は停止してください。

---

## 4. 修正対象

### 4.1 `any` の除去

`src/profiles/tests/profile-loader.test.ts` 内で、今回のPhase 2-A変更により追加された明示的または暗黙的な `any` を特定してください。

修正方針：

- 実際の戻り値・入力値に対応する具体的な型を使用する
- 必要に応じて `unknown` と型ガードを使用する
- 既存の公開型・Schema型・Loader戻り値型を優先して再利用する
- テストを通すためだけの型アサーション乱用は禁止
- `eslint-disable`、`@ts-ignore`、`@ts-expect-error` による回避は禁止
- 本番コードの型安全性やAPIを変更しない
- テストの期待値や検証内容を弱めない

### 4.2 末尾空白の除去

`git diff --check` が検出したファイルと行だけを修正してください。

禁止事項：

- 無関係な整形
- ファイル全体の自動フォーマット
- 改行コードの一括変換
- 意味のない差分拡大

### 4.3 changed-files lintの解消

今回変更したファイルだけを対象にLintを実行し、新規エラー・警告を解消してください。

対象候補：

```text
src/profiles/registry/profile-loader.ts
src/profiles/tests/profile-loader.test.ts
src/profiles/index.ts
src/profiles/registry/profile-registry.ts
src/profiles/registry/version-registry.ts
src/profiles/types/form-profile.ts
```

実際の変更ファイル一覧を `git diff --name-only` で確認し、その結果に基づいて対象を確定してください。

リポジトリ全体に既存Lint問題が存在する場合、それを今回の範囲で修正しないでください。

### 4.4 `npm run ai:verify`失敗の解消

上記修正後に `npm run ai:verify` を再実行してください。

失敗した場合は、出力を解析し、今回変更に直接起因する問題だけを修正してください。

以下に該当する場合は停止してください。

- Phase 2-Aの仕様変更が必要
- Loaderの公開API変更が必要
- Resolverの実装が必要
- Registry設計変更が必要
- 既存テスト期待値の変更が必要
- 今回範囲外の大規模修正が必要
- 原因を特定できない

---

## 5. 変更許可範囲

原則として変更を許可するのは以下のみです。

- `src/profiles/tests/profile-loader.test.ts`
- `git diff --check` が検出した今回変更中のファイル
- 今回の新規Lintエラーを解消するために不可欠なPhase 2-A対象ファイル
- `docs/AI/16_Milestone5B_Phase2A_Review_Context.json`
- 今回の限定修正報告書

本番コード変更が不要な場合は、テストおよび空白修正だけに留めてください。

本番コードを変更する必要が生じた場合は、変更前に以下を確認してください。

- 既存仕様を変えない
- Loaderの責務を変えない
- Resolver責務を追加しない
- 公開APIを変えない
- Registry構造を変えない
- 後方互換性を損なわない

これらを保証できない場合は停止してください。

---

## 6. 禁止事項

- Phase 2-Bの実装
- 機能追加
- 仕様変更
- Loader責務の拡大
- Resolver責務の先行実装
- 無関係なリファクタリング
- テスト期待値の弱体化
- テスト削除・skip化
- エラーの握りつぶし
- `eslint-disable` の追加
- `@ts-ignore` の追加
- `@ts-expect-error` の追加
- `any` を別の場所へ移すだけの対応
- 原因不明のまま成功報告
- Commit
- Push
- PR作成
- stage
- 無関係なファイル変更

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

---

## 7. 必須検証

修正後、以下を順番に実行してください。

### 7.1 Git差分検証

```bash
git status --short
git diff --stat
git diff --name-only
git diff --check
```

### 7.2 changed-files lint

実際の変更ファイルだけを指定して実行してください。

例：

```bash
npx eslint src/profiles/registry/profile-loader.ts src/profiles/tests/profile-loader.test.ts src/profiles/index.ts src/profiles/registry/profile-registry.ts src/profiles/registry/version-registry.ts src/profiles/types/form-profile.ts
```

変更されていないファイルは対象から除外して構いません。

### 7.3 Phase 2-Aテスト

```bash
npx tsx --test src/profiles/tests/profile-loader.test.ts
```

### 7.4 build

```bash
npm run build
```

### 7.5 AI検証

```bash
npm run ai:verify
```

必要に応じて既存のPhase 2-A関連テストも追加実行してください。ただし、テスト内容は変更しないでください。

---

## 8. 完了条件

以下をすべて満たした場合のみ完了としてください。

- `any` に起因する今回の新規Lintエラーがゼロ
- changed-files lint成功
- `git diff --check`成功
- Phase 2-Aテスト成功
- build成功
- `npm run ai:verify`成功
- 新規Lintエラーなし
- 新規Lint警告なし、または既存由来であることを証拠付きで明示
- Phase 2-Aの仕様・責務・公開APIに変更なし
- Scope外変更なし
- Stop Condition非該当
- Review Context JSON更新済み
- Commit未実施
- Push未実施

1項目でも満たせない場合は、Commit可とは判定しないでください。

---

## 9. Review Context JSONの更新

検証完了後、以下を更新してください。

`docs/AI/16_Milestone5B_Phase2A_Review_Context.json`

少なくとも以下を最新結果へ更新してください。

- `changedFiles`
- `diffSummary`
- `tests`
- `verification`
- `lint`
- `knownConstraints`
- `unresolvedIssues`
- `stopCondition`
- `commitReadiness`
- `phase2BReadiness`
- `evidence`

各Evidenceには以下を記録してください。

- `command`
- `executedAt`
- `exitCode`
- `result`
- `relevantOutput`
- `affectedFiles`

過去の失敗結果を削除せず、可能であれば履歴または補足として残し、今回の再実行結果が最新であることを明示してください。

---

## 10. 実装報告書

以下へ限定修正報告書を作成してください。

`docs/AI/18_Gemini_Milestone5B_Phase2A_Quality_Fix_Report.md`

必須項目：

1. 作業目的
2. 修正前の問題
3. 変更ファイル
4. 各変更の理由
5. `any` の具体的な解消方法
6. 末尾空白の修正箇所
7. changed-files lint結果
8. テスト結果
9. build結果
10. `npm run ai:verify`結果
11. `git diff --check`結果
12. 仕様・責務・公開APIの不変確認
13. Scope外変更の有無
14. Stop Condition判定
15. Commit可否
16. Phase 2-B開始可否
17. 未解決事項
18. 実行コマンド・時刻・exit code・重要stdout

---

## 11. 停止条件

以下のいずれかに該当した場合は直ちに停止してください。

- 必須参照文書が不足
- 実装報告とGit差分が不一致
- Scope外変更を検出
- 本番仕様変更が必要
- 公開API変更が必要
- Resolver実装が必要
- Registry設計変更が必要
- テスト期待値変更が必要
- 検証失敗の原因を特定できない
- 無関係な既存問題を直さなければ完了できない
- Git状態が不明確
- 正確なEvidenceを記録できない

停止報告には以下を含めてください。

- 停止理由
- 該当コマンド
- exit code
- 重要stdout
- 影響ファイル
- 人間による判断が必要な事項
- 推奨される次の対応

---

## 12. ユーザー向け完了報告

以下の形式で簡潔に報告してください。

- 限定品質修正：完了／停止
- 修正ファイル
- `any`：解消／未解消
- 末尾空白：解消／未解消
- changed-files lint：成功／失敗／未実行
- Phase 2-Aテスト：成功／失敗／未実行
- build：成功／失敗／未実行
- ai:verify：成功／失敗／未実行
- git diff --check：成功／失敗／未実行
- 新規Lintエラー：有／無／不明
- 仕様変更：有／無
- Scope外変更：有／無
- Stop Condition：該当／非該当
- Review Context JSON：更新済／未更新
- Commit可否：可／不可／不明
- Phase 2-B開始可否：可／不可／条件付き／不明
- Commit：未実施
- Push：未実施
