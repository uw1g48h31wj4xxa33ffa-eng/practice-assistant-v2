# Claude監査報告：Milestone 5-B / Phase 2-D アーキテクチャ設計

監査日時: 2026-07-21
監査モデル: Claude Sonnet 4.6 (Thinking)
対象: Gemini作成 Phase 2-D 事前調査・設計報告 (48_Gemini_Milestone5B_Phase2D_PreImplementation_Investigation.md)

---

## 1. Executive Verdict

- **判定**: **条件付き承認**
- **推奨Option**: **Option A2**（Profile用field定義を独立した単一正本ファイルにする）
- **Phase 2-D実装開始可否**: **条件付き可能**
  - 条件: Option A2（独立JSONファイル化）を採用することに合意した場合
- **重大停止条件**:
  - Runner内またはTest内へのfield定義JSONの直接複製（Option A1）は許容しない
  - `scripts/document-verification/verify-career-up-form1.mjs` および `config/career-up-r8-form1.mapping.mjs` への変更は禁止

---

## 2. Findings

### 正しかった点

- `ProfileRegistry` 自体は `legacyMapping` へ依存していないという事実認識は正確である。
  - 実際に `profile-registry.ts` は `legacyMapping` を一切 import していない。
- 実際の依存主体が Runner (`verify-career-up-profile-driven.mjs`) と Test (`profile-driven-career-up-integration.test.ts`) である点は正確である。
- `CareerUpAdapter` が `fieldDefinitions.fields` を配列として取り出し `LegacyMappingFormat` へ変換している仕組みの理解は正確である。
- 「データモデル依存」であるという性格の分類は適切である。単なるID参照ではなく、オブジェクト配列そのものを参照している。
- Gemini の Option A/B/C の3案整理は正確に論点を整理できている。

### 不正確だった点・見落とし

- **Option A の実装案が不完全**: Gemini は「Runner と Test へ直接 JSON をハードコード (Option A1)」と、「独立 JSON ファイル化 (Option A2)」を混同している。報告書「7. Proposed API and Types」では Runner へのハードコードを示しているが、「11. Phase 2-D Scope」では独立ファイルの可能性（fields.json 等）に言及している。同一報告書内で方針が揺れており、合意なしに実装に入ると危険。
- **3重管理リスクの過小評価**: Option A1（Runner + Test へのハードコード）を採用した場合、legacyMapping / Runner / Test の3か所で同一フィールド定義が重複する。この3重管理に対する具体的な管理コスト・同期リスクが過小評価されている。
- **Option A2 の検討が不十分**: 独立 JSON ファイルを正本として両エントリポイントが参照する構成（Option A2）は、3重管理を2系統（legacy + Profile 定義）に抑えつつ Profile 独立性を証明できる最良の選択肢であるが、Gemini の報告書では Option A と B の中間的な位置づけで明示されていない。
- **Test 2（比較テスト）の位置づけが不明確**: `profile-driven-career-up-integration.test.ts` の Test 2 は、正本が統一された後も維持すべき回帰テストであるが、Gemini の Test Plan では「Profile独立性の証明」に重点が置かれており、この比較テストの今後の扱いが未定義。

### 技術的リスク

- `execution-context-builder.ts` が `deepFreeze` を適用するため、Registry に登録後の `fieldDefinitions` オブジェクトは freeze される。Option A2（独立ファイル）で対処すれば問題は生じないが、実装時に確認が必要。
- `MappingProfile.fieldDefinitions` が `Record<string, unknown>` 型のため、現行型定義のまま独立 JSON ファイルのデータを格納できる。**型変更は不要**。

### 過剰設計の有無

- Gemini の Option B（Mapping Definition Registry の導入）は Phase 2-D として過剰。Resolver の複雑化を招くため次フェーズへ送るべき。
- 「共通 Runner 化」については Gemini も明示的に含めないとしており、この判断は正しい。

---

## 3. Source-of-Truth Decision

| Data | Current Source | Phase 2-D Source | Future Source | Reason |
|---|---|---|---|---|
| Field definition | legacyMapping.fields | 独立JSONファイル (career-up-r8-form1-fields.json等) | MappingProfile JSON / DB | Phase 2-D では Profile-driven 経路向けの独立正本を作成。legacy 経路は従来の legacyMapping を継続使用。 |
| Locator | legacyMapping.fields[].locator | 同上（独立JSONファイル内） | 同上 | Field definition に含まれるため同じ正本に従う。 |
| Validation | legacyMapping.fields[].validation | 同上 | 同上 | 同上。 |
| Transform | legacyMapping.fields[].transform（現状なし） | 同上 | 同上 | 現在未使用。将来 Transform ルール追加時は同正本に含める。 |
| Template selection | FormProfile (templateHash, formVersion) | FormProfile（変更なし） | FormProfile | Phase 2-C 時点で既に FormProfile が管理しており変更不要。 |
| Profile metadata | ProfileRegistry | ProfileRegistry（変更なし） | ProfileRegistry | Phase 2-C から継続。変更不要。 |

---

## 4. Option Comparison

| Option | 概要 | 二重管理 | Profile独立性 | Phase 2-D適合性 | 推奨順位 |
|---|---|---|---|---|---|
| **A2** | Profile用field定義を独立JSONファイルとして新設。Runner・Testは同ファイルを参照。legacyは継続。 | 2系統（比較テストで管理） | ○ 配線独立・データ正本独立 | 最小変更 | **1位** |
| A1 | Runner・Testへfield定義JSONを直接ハードコード | 3系統（管理不能） | 独立しているが自己確認リスク | 管理コスト高 | 4位 |
| B | 独立Mapping Definition Registry導入 | 2系統 | 責務分離が最も明確 | Phase 2-Dとして変更範囲過大 | 3位 |
| C | Adapter層へlegacyMapping依存を移す | 1系統（重複なし） | Adapter依存でProfile独立性不成立 | 変更は最小だが目的未達 | 2位 |

---

## 5. Recommended Phase 2-D Architecture

```
【独立正本ファイル】
scripts/document-verification/config/career-up-r8-form1-fields.json
  （fieldId, labelText, locator, validation等を JSON で定義）

                  ↓ import

【Profile-driven 経路】
verify-career-up-profile-driven.mjs
  ├─> import career-up-r8-form1-fields.json
  ├─> Registers MappingProfile(fieldDefinitions: {fields: <imported>})
  ├─> ProfileRegistry
  ├─> ProfileResolver
  ├─> CareerUpAdapter
  └─> Word generation

【Integration Test】
profile-driven-career-up-integration.test.ts
  ├─> import career-up-r8-form1-fields.json（Runner と同じ正本）
  └─> 比較テスト: careerUpFields deepStrictEqual legacyMapping.fields

【Legacy 経路（変更しない）】
verify-career-up-form1.mjs
  └─> import legacyMapping (career-up-r8-form1.mapping.mjs) ← 変更禁止
```

---

## 6. Exact Phase 2-D Scope

### 変更する
- `scripts/document-verification/verify-career-up-profile-driven.mjs`
  - `import legacyMapping` を削除
  - `import careerUpFields from './config/career-up-r8-form1-fields.json'` へ変更
  - FormProfile 登録データ（version, templateHash）は定数として明記
  - MappingProfile 登録の `fieldDefinitions.fields` を独立 JSON から参照
  - `resolveCareerUpMapping` 内の legacyMapping との比較アサーション（L71-74）を削除し基本チェックへ置換

- `src/profiles/tests/profile-driven-career-up-integration.test.ts`
  - `import legacyMapping` は**維持**（比較テスト用として残す）
  - `import careerUpFields from '../../../scripts/document-verification/config/career-up-r8-form1-fields.json'` を追加
  - `fieldDefinitions: { fields: legacyMapping.fields }` を `fieldDefinitions: { fields: careerUpFields }` に変更
  - Test 2 を「careerUpFields vs legacyMapping.fields の比較テスト」として整理

### 新規作成する
- `scripts/document-verification/config/career-up-r8-form1-fields.json`
  - `career-up-r8-form1.mapping.mjs` の `fields` プロパティをそのままシリアライズ

### 変更しない
- `src/profiles/registry/profile-registry.ts`
- `src/profiles/resolution/profile-resolver.ts`
- `src/profiles/resolution/adapter.ts`
- `src/profiles/resolution/execution-context-builder.ts`
- `src/profiles/types/mapping-profile.ts`（型変更不要）

### 次フェーズへ送る
- Mapping Definition Registry の導入（Option B）
- 共通 Runner クラスへの汎用化
- legacyMapping の廃止 / Profile JSON への統合
- データ二重管理の根本解決

### 禁止する
- `scripts/document-verification/verify-career-up-form1.mjs` への変更
- `scripts/document-verification/config/career-up-r8-form1.mapping.mjs` への変更
- Runner・Test への field 定義 JSON の直接ハードコード（Option A1）
- 自動 legacy fallback の追加

---

## 7. Required Tests

### P1（必須）
1. **Profile定義だけで正常実行**: `career-up-r8-form1-fields.json` を参照した Profile-driven 経路が `legacyMapping` を import せずに実行できること
2. **Word生成未呼出し（失敗時）**: Profile/Mapping 未登録・型不一致・dependency 失敗時に `startWordGeneration` が 0 回呼ばれること（既存 Test 6,7,8 の維持）
3. **legacy fallback未呼出し**: いかなる失敗時も `legacyFallback` が 0 回呼ばれること
4. **legacy経路回帰**: `verify-career-up-form1.mjs` による既存シナリオが影響を受けないこと

### P2（重要）
5. **legacyMappingとProfile定義の一致比較**: `career-up-r8-form1-fields.json` 由来の fields 配列と `legacyMapping.fields` が `deepStrictEqual` で一致すること（ドリフト検出）
6. **Career-up出力互換性**: Profile-driven 経路の出力ファイルが legacy 経路の出力と一致すること

### P3（将来）
7. **import グラフ検査**: Runner 内に `legacyMapping` の import が存在しないことの静的検証

---

## 8. Stop Conditions

以下のいずれかに該当した場合、実装を停止して報告すること。

1. **Runner内のlegacyMapping import削除後、FormProfileのメタデータ取得が困難な場合**
   - 対処: FormProfile 登録値を定数として Runner 内に明記する（version: "R8.4.8", hash: "d46f03b16e9eda461275acbef2c127b22cbc2c1e321b27465f59e2181cb43092"）。
2. **career-up-r8-form1-fields.json の JSON シリアライズが deepStrictEqual 比較で失敗する場合**
   - 確認済み事項: career-up-r8-form1.mapping.mjs に `=>` 記法や `function` キーワードが存在しないことを確認済み。JSON シリアライズは安全と判断するが、実装時に要確認。
3. **legacyMappingとProfilefields定義の比較テストが失敗し、原因不明の場合**
4. **ProfileValidator.validate() が独立 JSON 由来の Profile を拒否する場合**
5. **実装後の `npm run build` や `npx eslint` で対象ファイルに新規エラーが発生した場合**

---

## 9. Final Instruction for Gemini

### 採用方針: Option A2

#### 新規作成: `scripts/document-verification/config/career-up-r8-form1-fields.json`
- `career-up-r8-form1.mapping.mjs` の `fields` プロパティをシリアライズした JSON ファイル。
- `legacyMapping` ファイル自体は変更しない。

#### 変更: `scripts/document-verification/verify-career-up-profile-driven.mjs`
1. `import { careerUpR8Form1Mapping as legacyMapping } ...` を削除
2. `import careerUpFields from './config/career-up-r8-form1-fields.json' assert { type: 'json' };` を追加
3. FormProfile 登録の `version` と `templateHash` は定数として明記（"R8.4.8" / "d46f03b16e9eda461275acbef2c127b22cbc2c1e321b27465f59e2181cb43092"）
4. MappingProfile の `fieldDefinitions` を `{ fields: careerUpFields }` へ変更
5. `resolveCareerUpMapping` 内の legacyMapping との一致比較アサーション（L71-74）を削除し、基本的なチェックへ置換

#### 変更: `src/profiles/tests/profile-driven-career-up-integration.test.ts`
1. `import { careerUpR8Form1Mapping as legacyMapping }` は**維持**
2. `import careerUpFields from '../../../scripts/document-verification/config/career-up-r8-form1-fields.json' assert { type: 'json' };` を追加
3. `fieldDefinitions: { fields: legacyMapping.fields }` を `{ fields: careerUpFields }` に変更
4. Test 2 を「Profile定義 vs legacy定義の比較テスト」として整理（`assert.deepStrictEqual(careerUpFields, legacyMapping.fields)` を含める）

#### 検証順序（実装後）
```
1. npx tsx --test src/profiles/tests/*.test.ts
2. node scripts/document-verification/verify-career-up-form1.mjs
3. npx tsx scripts/document-verification/verify-career-up-profile-driven.mjs
4. npx eslint <対象ファイル>
5. npm run build
6. npm run ai:verify
7. git diff --check
```
