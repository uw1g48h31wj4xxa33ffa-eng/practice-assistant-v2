# Gemini指示書：Phase 2-C完了内容をAI_Packageへ反映・Commit・Push

## 目的

Milestone 5-B / Phase 2-Cの完了内容を、正本である `docs/AI/AI_Package.md` に反映し、本指示書とともにcommit・pushしてください。

## 最重要ルール

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

- 実装コードは変更しないでください。
- `docs/AI/AI_Package.md` と本指示書以外は変更・stage・commitしないでください。
- 既存記録を削除・上書きせず、現在の構造と記法に合わせて必要最小限の追記・更新を行ってください。
- 未確認事項を完了扱いにしないでください。
- commit hash、検証結果、既知の課題は、以下に記載した事実だけを使用してください。
- `git add .`、`git add -A` は使用しないでください。
- 問題がある場合はcommit・pushせず停止してください。

## 対象ブランチ

```text
feature/milestone-5b-phase2c-career-up-integration
```

## 更新対象

```text
docs/AI/AI_Package.md
docs/AI/47_Gemini_Update_AI_Package_Phase2C_Completion.md
```

## AI_Packageへ反映する確定事項

### Phase

```text
Milestone 5-B / Phase 2-C
```

### 状態

```text
完了
```

### 実装内容

- Profile-driven verification pathを追加
- `scripts/document-verification/verify-career-up-profile-driven.mjs` を追加
- Profile解決成功後にのみWord生成へ進むオーケストレーションを導入
- Profile解決失敗時はエラーを伝播
- 自動legacy fallbackは行わない
- 既存legacy検証スクリプトは変更しない
- 実運用経路に対する統合テストを追加
- Word生成未呼出しおよびlegacy fallback未呼出しをspyで検証

### 主な対象ファイル

```text
scripts/document-verification/verify-career-up-profile-driven.mjs
src/profiles/tests/profile-driven-career-up-integration.test.ts
```

### 実装commit

```text
46b3be3bb080057bc3119ab1a328a6c4b7fa04a8
feat: add profile-driven career-up verification path
```

### 文書commit

```text
080cd435b99f413ee3df031ab6c440bc2d5f9338
docs: add Phase 2-C commit instructions
```

### 検証結果

以下は成功済みです。

```text
npx tsx --test src/profiles/tests/*.test.ts
node scripts/document-verification/verify-career-up-form1.mjs
npx tsx scripts/document-verification/verify-career-up-profile-driven.mjs
npx eslint src/profiles/tests/profile-driven-career-up-integration.test.ts scripts/document-verification/verify-career-up-profile-driven.mjs
npm run build
npm run ai:verify
git diff --check
```

### Lintベースライン

プロジェクト全体の `npm run lint` には、今回の変更範囲外にある既存問題が残っています。

```text
合計79件
Error 56件
Warning 23件
```

今回対象の新規2ファイルには、個別ESLintでエラー・警告はありません。

### 既知の技術的注意

- Registryは現時点で `legacyMapping.fields` を利用している
- 現段階の互換性テストは、完全なProfile独立性の証明ではなく配線互換性の確認に相当する
- Phase 2-Cの完了を妨げる問題ではない
- 次工程以降でProfile独立性を高める場合は別スコープとして扱う
- 全体Lintの既存79件は今回スコープ外であり、別課題として管理する

## 手順

### 1. 状態確認

```bash
git branch --show-current
git status -sb
git diff --check
```

次を確認してください。

- 対象ブランチである
- working treeには本指示書47番だけが未追跡である
- 既存追跡ファイルに未コミット変更がない
- `git diff --check` が成功する

条件を満たさない場合は停止してください。

### 2. AI_Packageの現状確認

`docs/AI/AI_Package.md` を読み、以下を確認してください。

- 現在の章構成
- Milestone / Phaseの記録位置
- Status、Decisions、Evidence、Known Issues等の既存記法
- append-onlyまたは履歴保持の方針

既存構造を壊さず、必要最小限の更新方法を選択してください。

### 3. AI_Package更新

上記「AI_Packageへ反映する確定事項」を、現在の構造に合わせて反映してください。

必須条件：

- Phase 2-Cを完了として記録
- 実装commitと文書commitを記録
- 成功した検証コマンドを記録
- 全体Lintの既存ベースラインを未解決事項として明記
- Registryの `legacyMapping.fields` 依存を技術的注意として残す
- 次工程を勝手に完了扱いにしない
- 既存の過去記録を削除しない

### 4. 更新後確認

```bash
git diff --check
git diff -- docs/AI/AI_Package.md
git status -sb
```

内容に事実誤認、重複、既存構造破壊、不要な大規模変更がないことを確認してください。

### 5. 対象限定stage

```bash
git add \
  docs/AI/AI_Package.md \
  docs/AI/47_Gemini_Update_AI_Package_Phase2C_Completion.md
```

### 6. staged監査

```bash
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
git status -sb
```

確認事項：

- stagedファイルが上記2ファイルだけ
- `git diff --cached --check` が成功
- 対象外ファイルなし
- AI_Packageの変更がPhase 2-C完了記録に限定されている

問題がある場合はcommitせず停止してください。

### 7. Commit

```bash
git commit -m "docs: record Phase 2-C completion in AI package"
```

### 8. Push

```bash
git push
```

### 9. 最終確認

```bash
git status -sb
git log -1 --oneline
git rev-parse HEAD
```

working treeがcleanであることを確認してください。

## 完了報告

次を簡潔に報告してください。

1. AI_Packageへ追加・更新した項目
2. 変更ファイル一覧
3. staged監査結果
4. commit hash
5. commit message
6. push結果
7. 最終 `git status -sb`
8. 残存する既知の課題
