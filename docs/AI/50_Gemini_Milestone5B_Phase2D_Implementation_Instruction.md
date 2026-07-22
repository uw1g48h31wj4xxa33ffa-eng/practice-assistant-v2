# Gemini実装指示書：Milestone 5-B / Phase 2-D Profile Field Definition独立化

## 目的

Claude監査で採用された **Option A2** に基づき、Profile-driven経路のfield定義を独立JSONファイルへ分離し、Runnerから`legacyMapping`依存を削除してください。

本指示書では、調査確認、最小実装、テスト、verify、build、lint差分確認、Git差分監査、対象ファイル限定stage、commit、push、完了報告までを、停止条件に該当しない限り一括で実施してください。

## 最重要ルール

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

- 推定で仕様を変更しないでください。
- 指示範囲外の実装をしないでください。
- エラーを握りつぶさないでください。
- 未確認事項を事実として断定しないでください。
- 既存legacy経路を変更・削除しないでください。
- 自動legacy fallbackを追加しないでください。
- RunnerまたはTestへfield定義JSONを直接ハードコードしないでください。
- テスト期待値を都合よく変更しないでください。
- manualCheck、humanReview、Verifier判定を緩和しないでください。
- 停止条件に該当した場合は、commit・pushを行わず停止してください。

## 対象ブランチ

```text
feature/milestone-5b-phase2c-career-up-integration
```

## 事前に読むファイル

最低限、以下を確認してください。

```text
docs/AI/48_Gemini_Milestone5B_Phase2D_PreImplementation_Investigation.md
docs/AI/48_Gemini_Milestone5B_Phase2D_PreImplementation_Investigation_Instruction.md
docs/AI/49_Claude_Milestone5B_Phase2D_Architecture_Audit.md
docs/AI/49_Claude_Milestone5B_Phase2D_Architecture_Audit_Instruction.md

scripts/document-verification/verify-career-up-profile-driven.mjs
scripts/document-verification/verify-career-up-form1.mjs
scripts/document-verification/config/career-up-r8-form1.mapping.mjs

src/profiles/tests/profile-driven-career-up-integration.test.ts
src/profiles/types/mapping-profile.ts
src/profiles/registry/profile-registry.ts
src/profiles/resolution/profile-resolver.ts
src/profiles/resolution/adapter.ts
src/profiles/resolution/execution-context-builder.ts
```

## 採用方針

**Option A2：Profile用field定義を独立した単一正本ファイルとして新設**

依存関係は次のとおりです。

```text
career-up-r8-form1-fields.json
  ├─> verify-career-up-profile-driven.mjs
  └─> profile-driven-career-up-integration.test.ts

legacyMapping
  ├─> verify-career-up-form1.mjs
  └─> integration test内のドリフト比較のみ
```

### Phase 2-Dで達成すること

- Profile-driven Runnerから`legacyMapping` importを削除
- Profile-driven用field定義を独立JSONへ分離
- RunnerとTestが同じProfile用JSONを参照
- legacy経路は変更しない
- legacy定義とProfile定義のドリフトを比較テストで検出
- 既存のWord生成停止条件とlegacy fallback禁止を維持
- 既存出力互換性を維持

## Gate 1：状態確認

最初に以下を実行してください。

```bash
git branch --show-current
git status -sb
git log -5 --oneline
```

確認事項：

- 対象ブランチであること
- 未追跡ファイルが次の4件であること、または内容的に同等であること

```text
docs/AI/48_Gemini_Milestone5B_Phase2D_PreImplementation_Investigation.md
docs/AI/48_Gemini_Milestone5B_Phase2D_PreImplementation_Investigation_Instruction.md
docs/AI/49_Claude_Milestone5B_Phase2D_Architecture_Audit.md
docs/AI/49_Claude_Milestone5B_Phase2D_Architecture_Audit_Instruction.md
```

上記以外にユーザー作業と思われる未追跡・変更ファイルがある場合は停止してください。

## Gate 2：JSON化可能性とimport方式の確認

実装前に必ず以下を確認してください。

### 2-1. field定義のJSON互換性

`career-up-r8-form1.mapping.mjs` の `fields` に以下が含まれていないか確認してください。

- 関数
- `undefined`
- `BigInt`
- `Symbol`
- 正規表現オブジェクト
- `Date`
- 循環参照
- class instance
- JSON化で情報欠落する特殊値

確認コマンド例：

```bash
node -e "
import('./scripts/document-verification/config/career-up-r8-form1.mapping.mjs').then(({ careerUpR8Form1Mapping }) => {
  const fields = careerUpR8Form1Mapping.fields;
  const json = JSON.stringify(fields);
  const parsed = JSON.parse(json);
  const assert = require('node:assert/strict');
  assert.deepStrictEqual(parsed, fields);
  console.log('JSON_ROUNDTRIP_OK', fields.length);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
"
```

既存モジュール形式で上記が動作しない場合は、プロジェクトに適合する同等コマンドへ調整してください。

**JSON round-tripで`deepStrictEqual`が成立しない場合は停止してください。**

### 2-2. JSON import方式

現在の以下を確認してください。

```text
package.json
tsconfig.json
Node.js version
tsx version
既存のJSON import使用例
```

その上で、次の実行環境すべてで動作する方式を採用してください。

- Nodeでの`.mjs`実行
- `tsx`によるTypeScript test
- ESLint
- Next.js build

次の構文を無条件で固定採用しないでください。

```js
assert { type: 'json' }
```

NodeバージョンやTypeScript設定によっては構文差異があるためです。

採用可能な例：

- `with { type: 'json' }`
- `assert { type: 'json' }`
- `createRequire`
- `readFileSync` + `JSON.parse`
- JSONをexportする薄い`.mjs`ラッパー

ただし、**重複データファイルを増やさず、単一JSON正本を維持すること**が必須です。

## Gate 3：最小実装

### 3-1. 新規作成

```text
scripts/document-verification/config/career-up-r8-form1-fields.json
```

内容：

- `career-up-r8-form1.mapping.mjs` の `fields` 配列を情報欠落なくJSON化したもの
- rootは配列
- 並び順を維持
- fieldId、labelText、locator、validation等を完全維持
- 手作業による再入力ではなく、可能なら既存定義から一時スクリプトで生成
- 一時スクリプトを作成した場合は成果物に含めず削除すること

生成後、必ず以下を確認してください。

```text
JSON.parse(JSON file) deepStrictEqual legacyMapping.fields
```

### 3-2. Runner変更

対象：

```text
scripts/document-verification/verify-career-up-profile-driven.mjs
```

変更内容：

1. `legacyMapping` importを削除
2. Profile用field定義JSONを読み込む
3. MappingProfile登録時に次を使用

```js
fieldDefinitions: {
  fields: careerUpFields
}
```

4. FormProfile登録に必要な値を`legacyMapping`から取得していた場合は、既存の確定値を明示的な定数へ置換
5. `resolveCareerUpMapping`等にある`legacyMapping`との直接比較を削除
6. 代わりにProfile-driven経路として必要な最小不変条件を検証

最低限の不変条件：

- fieldsが配列
- fieldsが空でない
- 各fieldに`fieldId`がある
- 重複fieldIdがない
- Adapterが期待する構造である

既存Validatorが同等以上を保証している場合は、重複検証を増やさず既存Validatorを利用してください。

### 3-3. Integration Test変更

対象：

```text
src/profiles/tests/profile-driven-career-up-integration.test.ts
```

変更内容：

1. Profile登録・Runner相当処理ではProfile用JSONを参照
2. `legacyMapping` importはドリフト比較テスト専用として維持
3. 既存の成功・失敗テストを維持
4. `legacyMapping.fields`をProfile登録へ渡さない
5. Test 2相当を次の目的へ明確化

```text
Profile用field定義とlegacyMapping.fieldsのドリフト検出
```

比較は原則：

```js
assert.deepStrictEqual(careerUpFields, legacyMapping.fields)
```

JSON import方式によりreadonly差異やmodule wrapperが生じる場合は、データ本体を正しく比較してください。

### 3-4. 変更禁止

以下は変更しないでください。

```text
scripts/document-verification/verify-career-up-form1.mjs
scripts/document-verification/config/career-up-r8-form1.mapping.mjs
src/profiles/registry/profile-registry.ts
src/profiles/resolution/profile-resolver.ts
src/profiles/resolution/adapter.ts
src/profiles/resolution/execution-context-builder.ts
src/profiles/types/mapping-profile.ts
```

変更が不可避だと判明した場合は停止してください。

## Gate 4：Test

最低限、以下をすべて実行してください。

### 4-1. JSON正本比較

```bash
node -e "<Profile用JSONとlegacyMapping.fieldsのdeepStrictEqual比較>"
```

期待：

```text
PASS
```

### 4-2. Profile関連テスト

```bash
npx tsx --test src/profiles/tests/*.test.ts
```

期待：

- 全PASS
- 既存テスト件数を減らさない
- failure-path testを維持
- Word generation 0回
- legacy fallback 0回

### 4-3. Legacy回帰

```bash
node scripts/document-verification/verify-career-up-form1.mjs
```

期待：

- exit 0
- 既存Verifier結果を維持
- manualCheck等の判定を緩和しない

### 4-4. Profile-driven経路

```bash
npx tsx scripts/document-verification/verify-career-up-profile-driven.mjs
```

プロジェクト上の正式実行方法が別にある場合は、既存package scriptまたはPhase 2-Cで使った正式コマンドを使用してください。

期待：

- exit 0
- Profile用JSONのみで実行
- Runnerが`legacyMapping`をimportしない
- Word生成とVerifierが正常完了

## Gate 5：静的依存確認

Runnerにlegacy依存が残っていないことを確認してください。

```bash
rg -n "legacyMapping|career-up-r8-form1\.mapping" scripts/document-verification/verify-career-up-profile-driven.mjs
```

期待：

```text
該当なし
```

Integration Testでは、ドリフト比較用importのみ許容します。

また、Runner・Testへfield定義本体が直接複製されていないことを確認してください。

## Gate 6：verify・build・lint

### 6-1. AI verify

```bash
npm run ai:verify
```

期待：

```text
exit 0
```

### 6-2. Build

```bash
npm run build
```

期待：

```text
exit 0
```

### 6-3. 対象ファイルLint

新規・変更対象のみ実行してください。

例：

```bash
npx eslint \
  scripts/document-verification/verify-career-up-profile-driven.mjs \
  src/profiles/tests/profile-driven-career-up-integration.test.ts
```

JSONはESLint対象外で構いません。

期待：

- 新規error 0
- 新規warning 0

### 6-4. 全体Lintベースライン確認

既存ベースライン：

```text
Error 56件
Warning 23件
```

全体Lintを実行し、件数が増えていないことを確認してください。

```bash
npm run lint
```

期待：

```text
既存ベースラインを超えない
```

lint scriptが存在しない場合は、既存の正式lintコマンドを使用してください。

## Gate 7：差分監査

以下を実行してください。

```bash
git diff --check
git status -sb
git diff --stat
git diff --name-only
git diff
```

変更対象として許可するファイル：

```text
scripts/document-verification/config/career-up-r8-form1-fields.json
scripts/document-verification/verify-career-up-profile-driven.mjs
src/profiles/tests/profile-driven-career-up-integration.test.ts

docs/AI/48_Gemini_Milestone5B_Phase2D_PreImplementation_Investigation.md
docs/AI/48_Gemini_Milestone5B_Phase2D_PreImplementation_Investigation_Instruction.md
docs/AI/49_Claude_Milestone5B_Phase2D_Architecture_Audit.md
docs/AI/49_Claude_Milestone5B_Phase2D_Architecture_Audit_Instruction.md
```

さらに、本指示書をrepositoryへ配置した場合は次も許可します。

```text
docs/AI/50_Gemini_Milestone5B_Phase2D_Implementation_Instruction.md
```

上記以外の差分がある場合は停止してください。

### 必須差分確認

- legacy script未変更
- legacy mapping未変更
- Registry未変更
- Resolver未変更
- Adapter未変更
- 型定義未変更
- 自動fallback追加なし
- failure-path test削除なし
- JSON定義の直接複製なし
- テスト期待値の不正変更なし

## Gate 8：対象限定stage・commit・push

全Gate通過後のみ実行してください。

### 8-1. stage

許可対象のみ明示的にstageしてください。

```bash
git add \
  scripts/document-verification/config/career-up-r8-form1-fields.json \
  scripts/document-verification/verify-career-up-profile-driven.mjs \
  src/profiles/tests/profile-driven-career-up-integration.test.ts \
  docs/AI/48_Gemini_Milestone5B_Phase2D_PreImplementation_Investigation.md \
  docs/AI/48_Gemini_Milestone5B_Phase2D_PreImplementation_Investigation_Instruction.md \
  docs/AI/49_Claude_Milestone5B_Phase2D_Architecture_Audit.md \
  docs/AI/49_Claude_Milestone5B_Phase2D_Architecture_Audit_Instruction.md
```

本指示書がrepository内に存在する場合は追加してください。

```bash
git add docs/AI/50_Gemini_Milestone5B_Phase2D_Implementation_Instruction.md
```

`git add .`は禁止です。

### 8-2. staged差分確認

```bash
git diff --cached --check
git diff --cached --stat
git diff --cached --name-only
git diff --cached
```

### 8-3. commit

```bash
git commit -m "feat: decouple profile fields from legacy mapping"
```

### 8-4. push

```bash
git push origin feature/milestone-5b-phase2c-career-up-integration
```

### 8-5. 最終確認

```bash
git status -sb
git log -1 --oneline
git rev-parse HEAD
```

期待：

- working tree clean
- remote追跡先との差分なし
- commit hash取得済み

## 完了条件

以下をすべて満たした場合のみ完了としてください。

- Profile用field定義JSONが単一正本として新設された
- JSON round-tripで情報欠落がない
- Runnerから`legacyMapping` importが削除された
- TestのProfile登録がProfile用JSONを参照する
- legacyとの比較テストがPASS
- failure-path testがPASS
- Word生成未呼出しが証明される
- legacy fallback未呼出しが証明される
- legacy経路が回帰PASS
- Profile-driven経路がPASS
- `npm run ai:verify`がPASS
- buildがPASS
- 対象Lintで新規問題なし
- 全体Lintが既存ベースラインを超えない
- `git diff --check`がPASS
- 許可対象のみcommit
- push成功
- 最終working tree clean

## 停止条件

以下の場合はcommit・pushせず停止してください。

1. JSON round-tripで情報欠落が発生
2. JSON import方式がNode、tsx、buildのいずれかで成立しない
3. legacyMappingとの`deepStrictEqual`が不一致
4. legacy scriptまたはlegacy mapping変更が必要
5. Registry、Resolver、Adapter、型定義の変更が必要
6. failure-path testが壊れる
7. Word generation 0回またはlegacy fallback 0回を証明できない
8. 対象ファイルに新規lint error/warningが発生
9. 全体Lintが既存ベースラインを超える
10. buildまたはai:verify失敗
11. 指示範囲外の差分が存在
12. 出力互換性またはVerifier判定が悪化
13. ユーザー作業と推定される未確認差分が存在

## 完了報告

以下を簡潔に報告してください。

1. 実装した構成
2. JSON import方式
3. JSON round-trip結果
4. 変更ファイル一覧
5. Profile test結果
6. Legacy回帰結果
7. Profile-driven実行結果
8. ai:verify結果
9. build結果
10. 対象Lint結果
11. 全体Lint件数
12. `git diff --check`結果
13. commit hash
14. push結果
15. 最終`git status -sb`
16. 残存リスク
