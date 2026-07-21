# Phase 2-D 事前調査・設計報告

## 1. Executive Summary

- **Phase 2-Dで解決すべき問題**: Verification Runner (`verify-career-up-profile-driven.mjs`) およびテストにおいて、既存の `legacyMapping.fields` (`career-up-r8-form1.mapping.mjs`) を直接 `import` して Synthetic Profile へ注入している配線・データ依存の解消。
- **現状の主要依存**: Runner層が `legacyMapping` を参照し、それを `ProfileRegistry` に登録する Profile の `fieldDefinitions` へそのまま渡しています。
- **推奨する最小変更方針**: 真の Profile 独立性を証明するため、Runnerから `legacyMapping` の参照を削除し、フィールド定義を Profile 側の JSON として完全内包する方針（Option A）を推奨します。ただし、データモデルの二重管理が一時的に発生します。
- **実装可否**: 可能（二重管理を一時許容できる場合）。
- **停止条件の有無**: あり。データ二重管理の許容に関する合意が得られない場合、設計方針の再検討（Option C等）が必要です。

## 2. Current Architecture

```text
Verification Runner (verify-career-up-profile-driven.mjs)
  ├─> imports `legacyMapping.fields` (scripts/document-verification/config/career-up-r8-form1.mapping.mjs)
  ├─> Registers Profile to Profile Registry (src/profiles/registry/profile-registry.ts)
  │     └─ `fieldDefinitions: { fields: legacyMapping.fields }`
  ├─> Profile Resolver (src/profiles/resolution/profile-resolver.ts)
  ├─> CareerUpAdapter (src/profiles/resolution/adapter.ts)
  │     └─ Extracts `fields` directly from Profile
  └─> Word generation (scripts/document-verification/core/word-filler.mjs)
```

## 3. Confirmed Dependency on legacyMapping.fields

- **参照ファイル**: `scripts/document-verification/verify-career-up-profile-driven.mjs` および `src/profiles/tests/profile-driven-career-up-integration.test.ts`
- **参照行または周辺コード**: `import { careerUpR8Form1Mapping as legacyMapping } ...` および `fieldDefinitions: { fields: legacyMapping.fields }`
- **依存理由**: `MappingProfile` が保持すべきフィールド定義（locator, validationなど）を、動的に流用してRegistryへ登録するため。
- **依存を除去した場合の影響**: 代わりとなるフィールド定義データを Profile 側で静的（JSON等）に保持するか、Adapter層で遅延取得する仕組みが必要です。
- **単なる配線依存か、データモデル依存か**: データモデル依存。単なる ID 参照ではなく、データ構造そのもの（オブジェクトの配列）をそのまま利用しています。

## 4. Responsibility Matrix

| Responsibility | Current Owner | Proposed Owner | Reason |
|---|---|---|---|
| Field definition | legacyMapping | MappingProfile | Profile-drivenアーキテクチャにおいてProfileがメタデータの正本であるため |
| Word token mapping | legacyMapping | MappingProfile | 同上 |
| Transform | legacyMapping | MappingProfile or Adapter | Profile側でルールを定義しAdapterが解釈する |
| Validation | legacyMapping | MappingProfile | 同上 |
| Template selection | legacyMapping & Runner | FormProfile | FormProfileが使用すべき Template Hash 等を管理 |
| Profile resolution | Resolver | Resolver | 変更なし |
| Verification execution | Runner | Runner | 変更なし（共通化の準備を進める） |

## 5. Design Options

### Option A: Profileにfield定義を完全内包
- **概要**: `legacyMapping.fields` の内容を JSON 化し、Runner内の Synthetic Profile 定義、または独立したJSONファイルへ直接記述する。Runnerから legacyMapping のimportを完全に削除する。
- **変更ファイル**: `verify-career-up-profile-driven.mjs`, `profile-driven-career-up-integration.test.ts`
- **利点**: 外部への依存が完全に断ち切られ、真のProfile独立性が証明できる。
- **欠点**: `legacyMapping` との間でデータの二重管理が発生する。
- **既存互換性**: 維持可能
- **テスト容易性**: 高
- **移行コスト**: 中（JSON化作業）
- **将来のテンプレート追加コスト**: 低
- **推奨度**: ◎

### Option B: Profileから独立したMapping DefinitionをRegistryで参照
- **概要**: `fieldDefinitions` の実体を外部ファイル化し、Profileにはその参照IDだけを持たせ、Resolver時にロードする。
- **変更ファイル**: Profileスキーマ, Resolver
- **利点**: JSONの肥大化を防げる。
- **欠点**: データの二重管理リスクは解決せず、スキーマ変更とResolverの複雑化を招く。
- **推奨度**: △

### Option C: Adapter層でlegacyMappingを段階的に変換
- **概要**: Registryには `mappingType: 'legacy', mappingId: 'career-up-r8-form1'` などのメタデータだけを持たせ、`CareerUpAdapter` の中で `legacyMapping` を import して利用する。
- **変更ファイル**: `verify-career-up-profile-driven.mjs`, `src/profiles/resolution/adapter.ts`
- **利点**: データの二重管理を完全に回避できる。Runnerからは依存が消える。
- **欠点**: 結局 Adapter 層にレガシー依存が残り、「Profileが完全に独立したメタデータである」ことの証明にはならない。
- **推奨度**: 〇

## 6. Recommended Design

**推奨案: Option A (Profileにfield定義を完全内包)**
理由: Phase 2-Dの目的は「Profile独立性の証明」にあります。Option CのようなAdapterへの隠蔽ではメタデータ駆動の証明になりません。データ二重管理のリスクはありますが、「既存経路を壊さず自動fallbackしない」というルールの下で完全独立性を証明する最小かつ唯一の手段です。

## 7. Proposed API and Types

```typescript
// src/profiles/types/mapping-profile.ts
export interface MappingProfile extends BaseProfile {
  profileType: 'mapping';
  formProfileId: string;
  fieldDefinitions: Record<string, unknown>; // <--- ここに配列またはオブジェクトでJSONデータを直接格納
}

// scripts/document-verification/verify-career-up-profile-driven.mjs
// import legacyMapping は削除
registry.register({
  id: 'career-up-map1',
  profileType: 'mapping',
  // ...
  fieldDefinitions: {
    fields: [
      {
        fieldId: "business_owner_name",
        labelText: "①事業主名",
        locator: { type: "adjacent-cell", matchMode: "exact-cell-text" },
        // ... (JSONとして直接定義)
      }
      // ...
    ]
  }
});
```

## 8. File Change Plan

- **新規**: なし（または `fields.json` などのデータファイル）
- **変更**:
  - `scripts/document-verification/verify-career-up-profile-driven.mjs` (import削除、JSONハードコード)
  - `src/profiles/tests/profile-driven-career-up-integration.test.ts` (import削除、JSONハードコード)
- **変更不要**: `src/profiles/registry/profile-registry.ts`, `src/profiles/resolution/adapter.ts`, `src/profiles/resolution/profile-resolver.ts`
- **絶対に変更しない**: `scripts/document-verification/verify-career-up-form1.mjs`, `scripts/document-verification/config/career-up-r8-form1.mapping.mjs`

## 9. Test Plan

- 正常系: JSON化されたProfile定義のみでWord生成が完了すること。
- Registry未登録 / Profile未登録 / Mapping未登録 / ProfileとMappingのfield不整合時のエラーハンドリング。
- Word生成未呼出し / legacy fallback未呼出し。
- 既存legacy検証の回帰テスト成功。
- Career-up既存出力の互換性（Hash一致）。
- **Profile独立性の証明**（`legacyMapping` を一切使わずに正しく実行されること）。

## 10. Risks and Stop Conditions

- **データモデル二重管理**: `legacyMapping` とProfileのJSONで設定が重複します。
- **停止条件**: 上記の「データ二重管理の一時的な許容」について合意が得られない場合は実装を停止し、Option C（Adapter層への依存移譲）へ設計を変更する必要があります。

## 11. Proposed Phase 2-D Scope

- **Phase 2-Dに含める**: RunnerとTestから `legacyMapping` への直接依存を削除し、ProfileへJSONとして内包する。Profile独立性のテスト。
- **Phase 2-Dに含めない**: 既存 legacy 経路の廃止。データ二重管理の根本解決。共通 Runner の完全な汎用クラス化（引数パース等）。
- **将来候補**: `legacyMapping` を廃止するか、逆に `legacyMapping` が Profile JSON を読み込む仕組みへ変更する。

## 12. Implementation Gates

```text
Gate 1: 状態確認
Gate 2: 型・Registry設計
Gate 3: 最小実装
Gate 4: Unit / Integration Test
Gate 5: legacy回帰確認
Gate 6: build / ai:verify / lint差分確認
Gate 7: Git差分監査
Gate 8: commit / push
```

## 13. Final Recommendation

- **実装開始可否**: **停止条件（データモデル二重管理の許容）について確認が必要。許容できる場合は実装開始可能。**
- **推奨案**: Option A
- **推奨実装順序**: Gate 1 -> Gate 8
- **Claude監査が必要か**: はい（二重管理のリスク判断およびアーキテクチャ合意のため）
- **追加確認が必要な事項**: Option A（二重管理許容）か、Option C（Adapter移譲）かの選択
- **次のGemini指示書に含めるべき項目**: 選択された Option に基づく具体的な変更ファイルと実装指示
