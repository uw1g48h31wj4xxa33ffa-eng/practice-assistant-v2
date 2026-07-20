# Gemini向け Milestone 5-B Phase 2-B 開始指示書

## 1. 目的

Milestone 5-B Phase 2-A完了後のクリーンな状態から、Phase 2-Bを安全に開始してください。

今回の基本方針は次のとおりです。

- 既存設計・既存実装・既存テストを正本として扱う
- 最初に現状調査とPhase 2-Bの対象範囲を確定する
- 対象範囲を確定する前に実装しない
- Phase 2-Aの互換性を壊さない
- 不具合・副作用・仕様逸脱を最優先で防止する
- 調査、設計確認、実装、検証、Git差分監査まで、可能な範囲で一括して進める
- ただし、重大な不明点・矛盾・設計不足があれば停止する

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

---

## 2. 開始基準

Phase 2-A最終状態：

```text
branch: main
HEAD: f850acbb8e6a645ca3ce87dd4764fe1f2e6796b7
origin/main: f850acbb8e6a645ca3ce87dd4764fe1f2e6796b7
ahead / behind: 0 0
working tree: clean
```

作業開始時に必ず再確認してください。

---

## 3. Phase 2-Bの開始原則

Phase 2-Bでは、Phase 2-Aで構築したProfile Loaderと既存の設定駆動構成を前提に、次の工程へ進みます。

ただし、Phase 2-Bの具体的な実装範囲は、リポジトリ内の正本文書と既存コードを確認して確定してください。

推測で次の機能を追加してはいけません。

- 新しいProvider
- 新しいProfile形式
- 新しい自動選択ロジック
- UI変更
- API変更
- Word Engine接続
- DTO追加
- Phase 3以降の先行実装

Phase 2-Bに明記されていない機能は対象外です。

---

## 4. 最初に読む正本文書

以下を優先して確認してください。

```text
docs/AI/00_AI_Collaboration_Policy_and_Operating_History.md
docs/AI/00_External_Disclosure_Public_Markdown_Rule.md
docs/AI/12_Milestone5B_Phase2_Design_Scope_Stop_Conditions.md
docs/AI/13_Milestone5B_Phase2_PreImplementation_Research.md
docs/AI/19_Copilot_Milestone5B_Phase2A_PreCommit_Review_Task_v3.json
docs/AI/25_Milestone5B_Phase2A_Uncommitted_AI_Documents_Classification_Report.md
```

加えて、Phase 2-B、Milestone 5-B、Profile、Loader、Provider、Registry、fallback、validationに関係する文書を検索してください。

推奨コマンド：

```bash
find docs -type f | sort
grep -RInE "Phase 2-B|Phase2-B|Milestone 5-B|Profile Loader|profile loader|profile|provider|registry|fallback|validation" docs src scripts tests 2>/dev/null
```

---

## 5. Gate 1：Git状態確認

以下を実行してください。

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

- branchが`main`
- HEADが`f850acbb8e6a645ca3ce87dd4764fe1f2e6796b7`
- origin/mainが同一hash
- ahead / behindが`0 0`
- working treeがclean
- staged変更なし

条件不一致の場合は停止してください。

---

## 6. Gate 2：Phase 2-A実装の現状把握

Phase 2-Aで追加・変更されたファイルを確認してください。

```bash
git show --stat --oneline 168e8b6f9f4de52f572fb4c86cd942b3b306c1e6
git show --name-only --format="" 168e8b6f9f4de52f572fb4c86cd942b3b306c1e6
git show --stat --oneline f850acbb8e6a645ca3ce87dd4764fe1f2e6796b7
```

次を把握してください。

- Profile Loaderの入口
- Profile定義
- 読込順序
- validation
- fallback
- error handling
- tests
- public API
- 既存呼出元
- Phase 2-Aで意図的に未実装とした項目
- Phase 2-Bへ引き継がれた項目

コードを変更する前に、依存関係を図式化できる程度に理解してください。

---

## 7. Gate 3：Phase 2-Bの対象範囲確定

次の形式で、Phase 2-Bの実装対象を明文化してください。

```text
Phase 2-Bの目的:
対象機能:
対象ファイル:
変更予定API:
変更しない範囲:
既存互換性:
追加テスト:
想定リスク:
停止条件:
完了条件:
```

対象範囲は、必ず正本文書と既存コードに根拠を持たせてください。

### 実装前停止条件

次のいずれかに該当する場合、実装せず停止してください。

- Phase 2-Bの目的が文書間で矛盾
- 対象範囲が特定できない
- Phase 2-Aの公開APIを変更する必要がある
- 既存テスト期待値の変更が必要
- fallbackやvalidationの仕様が不明
- ProviderやRegistryの責務が重複
- Phase 3以降の機能を先行しないと実装できない
- 大規模な共通化やアーキテクチャ変更が必要
- 既存データ形式を破壊する可能性がある
- セキュリティ上の不明点がある
- 正本文書の更新が先に必要

---

## 8. Gate 4：実装方針

Phase 2-Bの対象範囲が明確で、停止条件に該当しない場合のみ実装してください。

### 必須方針

- 最小差分
- 既存命名規則を維持
- 既存公開APIを維持
- 既存Profile形式との互換性維持
- 例外を握りつぶさない
- fallbackを暗黙化しない
- validation失敗を成功扱いしない
- 未知値を勝手に補完しない
- default値を独断で追加しない
- テスト期待値を実装に合わせて変更しない
- 既存テスト削除禁止
- manualCheckやhuman review相当の安全弁がある場合は解除禁止
- 対象外ファイルの整形禁止
- 無関係なリファクタリング禁止

### 実装順序

1. 型・契約
2. validation
3. core logic
4. adapter / loader / registry
5. error handling
6. unit test
7. integration test
8. documentation
9. verification

実際の構造が異なる場合は、既存アーキテクチャを優先してください。

---

## 9. テスト要件

Phase 2-Bで追加した仕様には、正常系・異常系・境界値を追加してください。

最低限確認する項目：

- 正常なProfile
- 必須項目欠落
- 型不一致
- 空文字
- 未知キー
- 不正なProvider
- 不正な参照先
- fallbackあり／なし
- 読込順序
- 重複定義
- 存在しないProfile
- parse失敗
- validation失敗
- 既存Profileの後方互換性
- Phase 2-A既存テストの全PASS

既存テストの期待値変更は禁止です。

既存仕様に誤りがあると判断した場合は、変更せず停止し、証拠を報告してください。

---

## 10. 検証コマンド

package.jsonと既存スクリプトを確認し、正式なコマンドを使用してください。

最低限：

```bash
npm test
npm run lint
npm run build
```

専用verifyスクリプトがある場合は必ず実行してください。

例：

```bash
npm run verify
```

実在しないコマンドを推測して実行しないでください。

各コマンドについて次を記録してください。

- command
- exit code
- 実行時刻
- stdout / stderr要約
- test件数
- PASS / FAIL / SKIP件数
- 失敗箇所

---

## 11. 差分監査

実装後、必ず以下を実行してください。

```bash
git status --short
git diff --stat
git diff --name-only
git diff --check
git diff
```

確認事項：

- 対象外ファイル変更なし
- debugコードなし
- TODOの放置なし
- console出力の追加なし
- コメントアウトによる回避なし
- エラー握りつぶしなし
- 不要なformat差分なし
- 秘密情報なし
- テスト期待値変更なし
- lockfileの不要変更なし
- generated fileの不要変更なし

---

## 12. Git操作

今回は、実装・検証・差分監査まで行ってください。

次の操作は禁止です。

- stage
- Commit
- Push
- PR作成
- amend
- reset
- rebase
- merge
- stash
- force操作
- branch作成・切替

実装完了後は未Commit差分のまま停止し、ChatGPTとユーザーのレビューを待ってください。

---

## 13. 完了条件

以下のすべてを満たした場合のみ、Phase 2-B実装完了候補です。

- Phase 2-Bの対象範囲が正本文書に基づき確定
- 対象外実装なし
- Phase 2-A互換性維持
- 必要な実装完了
- 正常系・異常系・境界値テスト追加
- 既存テスト全PASS
- lint PASS
- build PASS
- verify PASS（存在する場合）
- `git diff --check` PASS
- 対象外差分なし
- 秘密情報なし
- staged変更なし
- Commitなし
- Pushなし
- Phase 3以降未着手

---

## 14. 完了報告形式

以下の形式で報告してください。

### A. 開始状態

- branch
- HEAD
- origin/main
- ahead / behind
- working tree
- staged変更

### B. 調査結果

- 読んだ正本文書
- Phase 2-Aの構造
- Profile Loaderの入口
- validation
- fallback
- error handling
- tests
- Phase 2-Bへの引継ぎ事項

### C. Phase 2-B確定範囲

- 目的
- 対象機能
- 対象ファイル
- 変更API
- 変更しない範囲
- 既存互換性
- リスク
- 停止条件
- 完了条件
- 根拠文書

### D. 実装内容

- 変更ファイル一覧
- 各ファイルの変更概要
- 新規型・関数・クラス
- validation変更
- fallback変更
- error handling変更
- API互換性

### E. テスト・検証

各コマンドについて：

- command
- exit code
- 実行時刻
- test件数
- PASS
- FAIL
- SKIP
- stdout / stderr要約

### F. 差分監査

- `git status --short`
- `git diff --stat`
- `git diff --name-only`
- `git diff --check`
- 対象外差分
- 秘密情報
- debugコード
- TODO
- lockfile変更
- generated file変更

### G. Git状態

- stage：未実施
- Commit：未実施
- Push：未実施
- PR：未作成

### H. 最終判定

- Phase 2-B：完了候補／停止
- Stop Condition：非該当／該当
- 人間レビュー：必要
- 次工程：ChatGPTレビュー待ち

---

## 15. 最終指示

まず現状調査とPhase 2-Bの対象範囲確定を行ってください。

対象範囲が正本文書と既存コードから明確に確定できた場合のみ、最小差分で実装・テスト・verify・build・lint・差分監査まで一括して進めてください。

重大な不明点、仕様矛盾、既存互換性の破壊、対象外実装の必要性がある場合は、実装せず停止してください。

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。
