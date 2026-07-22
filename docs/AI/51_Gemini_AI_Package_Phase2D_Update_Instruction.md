# Gemini指示書：AI_PackageへMilestone 5-B / Phase 2-D完了内容を反映

## 目的

Milestone 5-B / Phase 2-Dの完了内容を、現在の正本である`AI_Package.md`へ反映してください。

本作業は文書更新のみです。実装コード、テストコード、設定ファイル、既存検証スクリプトは変更しないでください。

## 最重要ルール

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

- 実装しないでください。
- 既存コードを変更しないでください。
- テスト期待値を変更しないでください。
- commit履歴を推測で補完しないでください。
- 未確認事項を完了扱いしないでください。
- `AI_Package.md`の既存構造・frontmatter・履歴ルールを壊さないでください。
- 既存内容を不用意に削除・要約しすぎないでください。
- Phase 2-Dと無関係な記述を変更しないでください。
- 停止条件に該当した場合はcommit・pushせず停止してください。

## 対象ブランチ

```text
feature/milestone-5b-phase2c-career-up-integration
```

## 事前確認

最初に以下を実行してください。

```bash
git branch --show-current
git status -sb
git log -5 --oneline
```

確認事項：

- 対象ブランチであること
- working treeがcleanであること
- 最新commitが以下であること

```text
d30da80 feat: decouple profile fields from legacy mapping
```

完全hashも確認してください。

```bash
git rev-parse HEAD
```

上記と異なる場合は停止してください。

## 読み込む対象

最低限、以下を確認してください。

```text
docs/AI/AI_Package.md
docs/AI/48_Gemini_Milestone5B_Phase2D_PreImplementation_Investigation.md
docs/AI/49_Claude_Milestone5B_Phase2D_Architecture_Audit.md
docs/AI/50_Gemini_Milestone5B_Phase2D_Implementation_Instruction.md

scripts/document-verification/config/career-up-r8-form1-fields.json
scripts/document-verification/verify-career-up-profile-driven.mjs
src/profiles/tests/profile-driven-career-up-integration.test.ts
```

必要に応じて、Phase 2-C完了記録や既存Milestone 5-B節も確認してください。

## AI_Package frontmatterの扱い

`AI_Package.md`のfrontmatterに`head`がある場合、その意味は次のとおりです。

```text
AI_Package更新直前までに記録対象となった最新commit
```

したがって、今回の更新では`head`をPhase 2-D完了commitへ更新してください。

```text
d30da80
```

完全hash形式で管理されている場合は、`git rev-parse HEAD`で確認した完全hashを使用してください。

自己参照commitを作ろうとしないでください。

## 反映する確定事実

以下の内容を、`AI_Package.md`の既存構造に合わせて反映してください。

### 1. Phase 2-Dの状態

```text
Milestone 5-B / Phase 2-D: 完了
```

### 2. 採用設計

```text
Option A2
```

内容：

- Profile-driven用field定義を独立した単一JSONファイルへ分離
- RunnerとIntegration Testが同一JSONを参照
- Profile-driven Runnerから`legacyMapping`直接依存を削除
- legacy経路は変更せず維持
- legacy定義とProfile定義の差異を比較テストで検出

### 3. 新規・変更ファイル

```text
新規:
scripts/document-verification/config/career-up-r8-form1-fields.json

変更:
scripts/document-verification/verify-career-up-profile-driven.mjs
src/profiles/tests/profile-driven-career-up-integration.test.ts
```

### 4. 変更していない重要領域

```text
scripts/document-verification/verify-career-up-form1.mjs
scripts/document-verification/config/career-up-r8-form1.mapping.mjs
src/profiles/registry/profile-registry.ts
src/profiles/resolution/profile-resolver.ts
src/profiles/resolution/adapter.ts
src/profiles/resolution/execution-context-builder.ts
src/profiles/types/mapping-profile.ts
```

### 5. JSON読み込み方式

```text
fs.readFileSync + JSON.parse
```

理由：

- Node.jsネイティブ実行
- tsx
- ESLint
- Next.js build

の構文差異を避けるため。

### 6. 検証結果

以下を事実として反映してください。

```text
JSON round-trip:
PASS
31 fields
情報欠落なし

Profile tests:
48 / 48 PASS

Legacy verification:
PASS

Profile-driven verification:
PASS

ai:verify:
PASS

build:
PASS

対象Lint:
新規error 0
新規warning 0

全体Lint:
56 errors
23 warnings
既存ベースライン維持

git diff --check:
PASS
```

### 7. Git情報

```text
commit:
d30da80

message:
feat: decouple profile fields from legacy mapping

push:
origin/feature/milestone-5b-phase2c-career-up-integration へ完了

working tree:
clean
```

完全commit hashは実際の`git rev-parse HEAD`結果を記録してください。

### 8. 残存リスク

以下を明記してください。

```text
legacyMappingとcareer-up-r8-form1-fields.jsonは、現時点では2系統の正本として残る。
Integration TestのdeepStrictEqual比較によりドリフトを検出する。
いずれかのfield定義変更時は両ファイルの更新が必要。
根本的な単一正本化は将来フェーズへ送る。
```

### 9. 次フェーズ候補

次候補として、以下を「未着手」「候補」と明示してください。

```text
- 共通Profile Verification Runner
- Mapping Definition Registry
- legacyMappingとProfile JSONの単一正本化
- 新規Wordテンプレート追加コストの削減
```

完了済みとして記載しないでください。

## 既存構造への反映方針

`AI_Package.md`内に既存の以下に相当する節がある場合、重複節を新設せず更新してください。

- Current Status
- Milestone 5-B
- Recent Commits
- Architecture Decisions
- Verification Evidence
- Risks / Known Issues
- Next Actions
- Decisions Log
- Evidence Log

既存の書式、見出し階層、表形式、append-onlyルールに従ってください。

## Decisions Log

append-onlyのDecisions Logが存在する場合は、次の決定を追記してください。

```text
Decision:
Phase 2-DではOption A2を採用し、Profile-driven field definitionを独立JSONへ分離する。

Reason:
Runner/Testへの直接複製による3重管理を避けながら、Profile-driven経路の配線独立性を確立するため。

Constraint:
legacy経路は変更しない。
自動fallbackは追加しない。
二重管理の根本解消は将来フェーズへ送る。
```

既存Decisionを上書きしないでください。

## Evidence記録

Evidence欄が存在する場合、最低限以下を記録してください。

```text
branch
commit hash
commit message
test command
test result
build result
ai:verify result
lint baseline
git status
```

実際に確認した値のみ記録してください。

## 変更対象

原則として変更を許可するのは次のみです。

```text
docs/AI/AI_Package.md
```

本指示書をrepositoryへ配置した場合は次も許可します。

```text
docs/AI/51_Gemini_AI_Package_Phase2D_Update_Instruction.md
```

上記以外の差分が発生した場合は停止してください。

## 検証

更新後、以下を実行してください。

```bash
git diff --check
git status -sb
git diff --stat
git diff --name-only
git diff -- docs/AI/AI_Package.md
```

さらに、JSONとして埋め込まれたコードブロックやfrontmatterに構文破損がないことを確認してください。

AI_Packageの検証スクリプトが存在する場合は実行してください。

例：

```bash
npm run ai:verify
```

期待：

```text
exit 0
```

## Git操作

全検証通過後のみ実施してください。

### stage

```bash
git add docs/AI/AI_Package.md
```

本指示書がrepository内に存在する場合のみ追加してください。

```bash
git add docs/AI/51_Gemini_AI_Package_Phase2D_Update_Instruction.md
```

`git add .`は禁止です。

### staged差分確認

```bash
git diff --cached --check
git diff --cached --stat
git diff --cached --name-only
git diff --cached
```

### commit

```bash
git commit -m "docs: record phase 2d completion"
```

### push

```bash
git push origin feature/milestone-5b-phase2c-career-up-integration
```

### 最終確認

```bash
git status -sb
git log -2 --oneline
git rev-parse HEAD
```

## 完了条件

以下をすべて満たした場合のみ完了としてください。

- AI_PackageへPhase 2-D完了を反映
- frontmatter `head`を更新
- commit `d30da80`の内容を正確に記録
- 検証結果を正確に記録
- 残存リスクを記録
- 次フェーズ候補を未着手として記録
- Decisions Logをappend-onlyで更新
- AI_Package以外の既存ファイルを変更していない
- `git diff --check` PASS
- `ai:verify` PASS
- 対象限定commit
- push成功
- working tree clean

## 停止条件

以下の場合はcommit・pushせず停止してください。

1. working treeがcleanではない
2. HEADがPhase 2-D完了commitと一致しない
3. AI_Packageの正本パスが不明
4. frontmatterの意味・形式が既存ルールと矛盾
5. append-only履歴を壊す必要がある
6. 記載すべき検証結果を確認できない
7. Phase 2-D以外の内容変更が必要
8. AI_Package以外に予期しない差分が発生
9. `git diff --check`失敗
10. `ai:verify`失敗

## 完了報告

以下を簡潔に報告してください。

1. 更新したAI_Packageのパス
2. 更新した主要セクション
3. frontmatter `head`
4. Phase 2-D記録内容
5. Decisions Log追記内容
6. Evidence記録内容
7. `ai:verify`結果
8. `git diff --check`結果
9. commit hash
10. push結果
11. 最終`git status -sb`
12. 次フェーズ候補
