# Milestone 5-B Phase 2-B 設計決議書

**決議日:** 2026-07-20  
**対象:** Milestone 5-B Phase 2-B  
**前提:** Phase 2-A 完了、HEAD `f850acbb8e6a645ca3ce87dd4764fe1f2e6796b7`

---

## 1. 決議目的

Phase 2-B実装前に未確定だった以下を固定する。

1. effective-date source
2. Resolver input/output interfaces
3. ExecutionContext interface
4. feature activation
5. fallback方針
6. Git branch方針

本決議は、Phase 2-Aの公開契約および既存レガシー経路を破壊せず、Phase 2-Bを最小差分で実装するための正本とする。

---

## 2. Phase 2-A確定範囲

Phase 2-Aで完了済みの責務：

- JSONファイルの再帰探索
- JSON parse
- Schema validation
- ProfileRegistryへの登録
- duplicate拒否
- cross-profile referenceの存在・型確認
- load errorの全件集約
- `ProfileLoadReport`によるFail Batch
- `ProfileLoader.loadFromDirectory()`入口

Phase 2-Bへ残る責務：

- effectiveDateを用いたActive version解決
- ProfileResolver
- ExecutionContextBuilder
- Career-Up Form向けAdapter境界
- 明示的activation
- resolution evidence / warning / errorの構造化

---

## 3. 責務境界

| Component | Responsibility | Must not do |
|---|---|---|
| ProfileLoader | ファイル探索、parse、schema validation、Registry登録、静的参照検証、load error集約 | effectiveDate解決、version選択、ExecutionContext生成 |
| ProfileResolver | 指定effectiveDateでActive profileを解決し、必要な参照を連鎖解決する | ファイル読込、Registry変更、ExecutionContext生成 |
| ExecutionContextBuilder | ResolveResultを受け、下流向けのreadonly contextを構築する | Registry再参照、Resolver再実行、暗黙時刻生成 |
| Adapter | ExecutionContextを既存Career-Up Form互換入力へ変換する | Word/Document Engine本体変更、Registry直接参照 |
| FeatureActivation | 新しいprofile-driven経路を明示的に開始する | 既存レガシー経路の暗黙切替、default ON |

---

## 4. Effective-date決議

### 決議

- `effectiveDate`はApplication層または明示的な呼出元が必須で渡す。
- 型は`Date`。
- Resolver内部で`new Date()`、`Date.now()`を暗黙利用しない。
- `null`、`undefined`、Invalid Dateは拒否する。
- UTC基準で扱う。
- 既存`resolveActive(id, effectiveDate: Date)`契約を維持する。
- テストでは任意のDateを注入可能とする。

### 禁止

- 未指定時に現在日時を補完する
- ローカルタイム依存
- 日付未指定をfallback扱いする

---

## 5. Resolverインターフェース決議

### 入力

```ts
export interface ResolveRequest {
  readonly profileId: string;
  readonly profileType: ProfileType;
  readonly effectiveDate: Date;
}
```

Phase 2-B初期実装では、provider、tenant、client、case識別子、version overrideは追加しない。正本に必要性が明記されるまで対象外とする。

### 証跡

```ts
export interface ResolveEvidence {
  readonly profileId: string;
  readonly profileType: ProfileType;
  readonly version: string;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
}
```

### warning / error

```ts
export interface ResolveWarning {
  readonly code: string;
  readonly message: string;
  readonly profileId?: string;
}

export interface ResolveError {
  readonly code: string;
  readonly message: string;
  readonly profileId?: string;
  readonly cause?: unknown;
}
```

### 出力

```ts
export type ResolveResult<T extends Profile = Profile> =
  | {
      readonly ok: true;
      readonly profile: T;
      readonly evidenceChain: readonly ResolveEvidence[];
      readonly warnings: readonly ResolveWarning[];
    }
  | {
      readonly ok: false;
      readonly errors: readonly ResolveError[];
      readonly evidenceChain: readonly ResolveEvidence[];
    };
```

### 契約

- Registry内部の既存throw契約は変更しない。
- Resolver境界で例外を`ResolveResult`へ変換する。
- 失敗を`null`で返さない。
- 暗黙成功を禁止する。
- 循環参照は明示エラーとする。
- ambiguous resolutionは明示エラーとする。
- 証跡は解決順序を保持する。

---

## 6. Fallback決議

Phase 2-B初期実装では、自動fallbackを実装しない。

- 指定effectiveDateでActive profileが存在しない場合は失敗。
- 旧版、最新版、最寄り日付への自動fallbackは禁止。
- fallbackを示すwarningだけを出して成功扱いすることも禁止。
- 将来fallbackを追加できる型拡張は妨げない。
- fallback追加時は別の設計決議を必要とする。

---

## 7. ExecutionContext決議

### 型

```ts
export interface ExecutionContext {
  readonly effectiveDate: Date;
  readonly resolvedProfiles: Readonly<
    Record<string, ResolveResult<Profile>>
  >;
}
```

### Builder契約

```ts
export interface ExecutionContextBuilder {
  build(
    effectiveDate: Date,
    results: readonly ResolveResult<Profile>[]
  ): ExecutionContext;
}
```

### 決議

- Resolver入力型とは別型とする。
- `createdAt`、`resolvedAt`等の暗黙時刻はPhase 2-Bでは持たない。
- 不完全または失敗を含むResolveResultからはcontextを構築しない。
- BuilderはRegistryを参照しない。
- BuilderはResolverを再実行しない。
- 外部へmutable参照を公開しない。
- 下流固有構造への変換はAdapterの責務。

---

## 8. Feature activation決議

### 採用方式

明示的呼出API方式。

### 契約

- 既存レガシー経路は変更しない。
- profile-driven経路は新しい明示的入口からのみ実行する。
- 環境変数による暗黙切替は採用しない。
- default OFF相当とする。
- 既存verify scriptや既存Word/Document Engine経路を自動的に置換しない。
- 実際のクラス名、関数名、配置は既存アーキテクチャ調査後に決定する。
- Phase 2-Bでは新経路の独立テストを行う。

---

## 9. Adapter決議

- 最初のintegration targetはCareer-Up Form。
- AdapterはExecutionContextを既存`careerUpR8Form1Mapping`互換入力へ変換する。
- AdapterはRegistryを参照しない。
- AdapterはResolverを呼び出さない。
- Word Engine / Document Engine本体は変更しない。
- 既存レガシーmappingを削除・置換しない。
- 互換性が確認できない場合は停止する。

---

## 10. Phase 2-B実装対象

対象：

- `ProfileResolver`
- `ResolveRequest`
- `ResolveResult`
- `ResolveEvidence`
- `ResolveWarning`
- `ResolveError`
- `ExecutionContext`
- `ExecutionContextBuilder`
- Career-Up Form向けAdapter
- 新profile-driven経路の明示的入口
- 正常系・異常系・境界値テスト

対象外：

- 新規Provider
- tenant/client/case固有コンテキスト
- UI変更
- API変更
- Word Engine本体変更
- Document Engine本体変更
- 自動fallback
- 環境変数feature flag
- Phase 3以降の機能
- 大規模リファクタリング

---

## 11. Git branch決議

Phase 2-Bは以下のfeature branchで実施する。

```text
feature/milestone-5b-phase2-profile-resolution
```

手順：

1. `main`がcleanであることを確認
2. `HEAD == origin/main`
3. `ahead / behind == 0 0`
4. feature branchを作成
5. 設計決議書、実装、テスト、証拠文書を同一branchで管理
6. 実装完了後は未Commit差分でレビュー
7. 承認後のみstage / commit / push

---

## 12. 検証要件

最低限：

```bash
npx tsx --test
npm run lint
npm run build
npm run ai:verify
git diff --check
```

実在する正式なscript名を`package.json`で確認してから実行する。

必須テスト：

- 有効な単一profile解決
- 連鎖解決
- effectiveDate境界
- Active profileなし
- ambiguous
- Invalid Date
- profile type不一致
- 循環参照
- Registry例外のResult変換
- evidence順序
- warning/error構造
- ExecutionContextのreadonly性
- 失敗結果を含むcontext構築拒否
- Adapter互換性
- 既存Phase 2-Aテスト全PASS
- 既存レガシー経路無変更

---

## 13. Stop Conditions

次の場合は実装を停止する。

- 既存Profile型と本決議型が整合しない
- `ProfileType`が実在しない、または意味が異なる
- 既存Registryのthrow契約変更が必要
- ProfileLoaderの公開API変更が必要
- Word/Document Engine本体変更が必要
- 既存テスト期待値変更が必要
- 自動fallbackが必要になる
- feature activationのため既存経路変更が必要
- 循環参照仕様が既存文書と矛盾
- Adapter互換形式が特定できない
- 対象外の大規模リファクタリングが必要
- 正本文書間で矛盾がある

---

## 14. 完了条件

- feature branch上で作業
- 本決議に準拠
- 対象外実装なし
- Phase 2-A互換性維持
- 既存レガシー経路無変更
- 自動fallbackなし
- 必要な型と責務実装
- 必要テスト追加
- 全テストPASS
- lint PASS
- build PASS
- ai:verify PASS
- `git diff --check` PASS
- 対象外差分なし
- staged変更なし
- Commitなし
- Pushなし
- 人間レビュー待ち

---

## 15. 人間承認

以下を承認済みとする。

- explicit effectiveDate injection
- Resolver境界のdiscriminated Result型
- ExecutionContextのreadonly最小構成
- 自動fallback禁止
- 明示的activation
- 既存レガシー経路非変更
- feature branch利用

**承認者:** ユーザー + ChatGPT  
**承認日:** 2026-07-20
