# Claude監査指示書：Milestone 5-B / Phase 2-E アーキテクチャ設計監査

## 目的

Geminiが作成した以下のPhase 2-E設計書を、実コードと既存方針に照らして厳密に監査してください。

```text
docs/AI/52_Gemini_Milestone5B_Phase2E_Architecture_Design.md
```

本監査の目的は、共通Profile Verification Runner実装へ進む前に、設計上の誤り・不足・過剰設計・既存方針との矛盾・検証抜けを特定し、次の実装Phaseで採用すべき最小かつ安全な設計を確定することです。

## 最重要ルール

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

- 実装しないでください。
- コードを変更しないでください。
- 設計書を無条件に追認しないでください。
- 実コードを確認せず、抽象論だけで判断しないでください。
- Geminiの自己申告を証拠として扱わないでください。
- 不明点を推測で埋めないでください。
- 重大な不整合がある場合は「条件付き承認」または「差戻し」としてください。
- legacy経路削除、自動fallback追加、Verifier省略を前提にしないでください。
- manualCheck / humanReview / Verifier / DTO返却要件を弱める判断は禁止です。
- 過剰な抽象化、DI container、plugin architecture、全面置換を推奨しないでください。

## 対象ブランチ

```text
feature/milestone-5b-phase2c-career-up-integration
```

## 事前確認

最初に以下を確認してください。

```bash
git branch --show-current
git status -sb
git log -5 --oneline
git rev-parse HEAD
```

期待：

```text
HEAD:
fa1574c docs: design phase 2e profile verification architecture
```

working treeがcleanでない場合、またはHEADが異なる場合は、その事実を明記して監査を停止してください。

## 必読資料

最低限、以下を実際に読んでください。

```text
docs/AI/01_AI_Package.md
docs/AI/48_Gemini_Milestone5B_Phase2D_PreImplementation_Investigation.md
docs/AI/49_Claude_Milestone5B_Phase2D_Architecture_Audit.md
docs/AI/50_Gemini_Milestone5B_Phase2D_Implementation_Instruction.md
docs/AI/51_Gemini_AI_Package_Phase2D_Update_Instruction.md
docs/AI/52_Gemini_Milestone5B_Phase2E_Architecture_Design_Instruction.md
docs/AI/52_Gemini_Milestone5B_Phase2E_Architecture_Design.md
```

## 必読コード

以下を必ず実コードで確認してください。

```text
scripts/document-verification/verify-career-up-profile-driven.mjs
scripts/document-verification/verify-career-up-form1.mjs
scripts/document-verification/config/career-up-r8-form1.mapping.mjs
scripts/document-verification/config/career-up-r8-form1-fields.json

src/profiles/types/form-profile.ts
src/profiles/types/mapping-profile.ts
src/profiles/types/execution-context.ts
src/profiles/registry/profile-registry.ts
src/profiles/resolution/profile-resolver.ts
src/profiles/resolution/adapter.ts
src/profiles/resolution/execution-context-builder.ts
src/profiles/tests/profile-driven-career-up-integration.test.ts
```

存在する場合は、以下も確認してください。

```text
GenerationResultDTO
Verifier関連Core
OutputVerifier
DomSerializationVerifier
Word generation entrypoint
Template Registry
他のprofile-driven runner
```

## 監査観点

## 1. Gemini設計書の事実確認

設計書の各主要主張について、実コードに根拠があるか確認してください。

最低限、以下を表形式で評価してください。

```text
主張
根拠ファイル
根拠箇所
判定
補足
```

判定は次のいずれかにしてください。

```text
正しい
一部正しい
誤り
根拠不足
```

特に以下を監査してください。

- 実行オーケストレーションが各様式固有Runnerにベタ書きされているか
- Profile-driven経路が「単一正本JSONの恩恵を受けている」という表現が正確か
- Registry、Resolver、Adapter、ExecutionContextBuilderの責務理解
- Word生成・Verifier呼出し順序
- failure時にWord生成が始まらない保証
- legacy fallbackが存在しないこと
- manualCheck / humanReviewの現行扱い
- DTO返却の現状
- Template hash検証の現状

## 2. 共通Runnerをクラスにする判断

Geminiは`ProfileVerificationRunner`クラスを推奨しています。

以下を比較してください。

### Option R1

```text
純粋関数
runProfileVerification(config)
```

### Option R2

```text
クラス
new ProfileVerificationRunner(dependencies).run(config)
```

### Option R3

```text
Factory + 純粋関数
createProfileVerificationRunner(dependencies)
```

比較軸：

- 現行コードとの整合性
- 状態保持の必要性
- テスト容易性
- DIの明示性
- 副作用分離
- concurrent execution安全性
- 将来拡張
- 過剰設計リスク
- 実装量
- thin wrapper化の容易さ

最終的に、次実装Phaseで採用すべき方式を1つ選んでください。

## 3. Registry外部注入の妥当性

Gemini案では`registry: ProfileRegistry`をconfigへ含めています。

以下を監査してください。

- configとdependencyの責務混在がないか
- registryを毎回渡すべきか
- dependenciesとexecution inputを分けるべきか
- Registryのmutable stateが並列実行へ影響しないか
- テスト用Registry差替え方法
- Registry内部生成の方が安全か
- 既存ProfileRegistry APIと整合するか

推奨インターフェースを示してください。

## 4. Word生成関数DIの妥当性

Gemini案：

```ts
startWordGeneration: (...) => Promise<void>
```

以下を監査してください。

- `Promise<void>`で十分か
- 実際のWord生成結果を受け取る必要があるか
- OutputVerifier / DomSerializationVerifierへの情報伝播が可能か
- DTO返却へ必要な情報が欠けないか
- 過渡期DIとして妥当か
- Runner内部へ固定すべきか
- dependency objectへ分離すべきか

推奨型を具体的に示してください。

## 5. Verifier任意化の是非

Gemini案：

```ts
runVerifier?: (...)
```

これは重点監査対象です。

以下を必ず判断してください。

- Verifierは必須依存か
- 任意化すると検証省略経路が生じるか
- `manualCheck`や`humanReview`判定に影響するか
- テスト専用に差替える方法は他にあるか
- Verifier失敗時の返却形式
- legacy runnerとの互換性
- OutputVerifier / DomSerializationVerifierを個別依存にするか
- composite verifierにするか

最終判定を明示してください。

## 6. throwとResult返却の境界

Geminiは致命的エラーをthrowし、manualCheck等をsuccess-with-reviewとしています。

以下を監査してください。

- 既存GenerationResultDTO方針と矛盾しないか
- UIへ返すエラー情報との整合性
- Runner Coreでthrowするか
- CLI wrapperでcatchするか
- application boundaryでResultへ変換するか
- retry可能性
- telemetry / evidence
- test期待値
- errorCode安定性

最低限、次のどれを採用すべきか判断してください。

### Option E1

```text
すべてResultで返す
```

### Option E2

```text
Coreはthrow、BoundaryでResult化
```

### Option E3

```text
予期可能な業務エラーはResult
予期不能なprogramming errorのみthrow
```

manualCheck / humanReviewはsystem errorではなくreview stateとして扱うべきかも明示してください。

## 7. API型の妥当性

Gemini案を実コードと照合し、必要な修正を示してください。

最低限、以下を監査してください。

```ts
type ProfileVerificationRunnerConfig = {
  formId: string;
  mappingId: string;
  effectiveDate: Date;
  inputData: Record<string, unknown>;
  templatePath: string;
  outputPath: string;
  registry: ProfileRegistry;
  startWordGeneration: (...);
  runVerifier?: (...);
};
```

論点：

- `formId`と`mappingId`だけで十分か
- `profileId` / version / effectiveDateの扱い
- `templatePath`はFormProfile由来ではないか
- `outputPath`はRunner責務かCLI責務か
- `inputData`の型
- `Date`のtimezone / serialization
- adapterの明示指定要否
- fieldDefinitionsの伝播
- hash検証入力
- evidence情報
- abort signal
- correlation id
- logger
- deterministic execution

ただし、Phase 2-E次実装で不要な項目は追加しないでください。

## 8. 単一正本化案S1の妥当性

Geminiは以下を推奨しています。

```text
Profile JSONを正本
↓
legacy互換mappingを静的生成
```

以下を監査してください。

- Profile JSONが本当にlegacy mapping全情報を保持できるか
- 関数・型・コメント・補助メタデータの欠落
- build-time generation導入コスト
- generated fileのレビュー性
- Git差分の可読性
- SHA / provenance
- generator不具合時の影響
- migration順序
- rollback
- legacy runnerのimport形態
- JSON単独正本が適切か
- M1維持との整合性
- Phase 2-F以降へ送るべきか

最終的に、S1を承認・条件付き承認・差戻しのいずれかで判定してください。

## 9. Exact Next Implementation Scopeの妥当性

Gemini案：

```text
- 共通Runner Coreの新規追加
- Career-up Runnerを薄いwrapperへ変更
- 既存テストを共通Runnerへ接続
- 新規様式追加なし
- Mapping Definition Registryなし
- 単一正本化なし
```

以下を判断してください。

- 一度の実装Phaseとして適切か
- さらに分割すべきか
- 新規Core追加だけを先にすべきか
- wrapper変更とテスト接続を同時に行うべきか
- legacy runnerは完全に触らないべきか
- evidence比較テストが必要か
- output byte compatibilityが必要か
- static import graph検査が必要か

最終的な最小安全スコープを明記してください。

## 10. 必須テスト監査

Gemini設計書のテスト計画に不足がないか確認してください。

最低限、以下を含めるべきか判断してください。

```text
正常系
FormProfile未登録
MappingProfile未登録
effectiveDate不一致
version不一致
profile validation失敗
adapter解決失敗
adapter実行失敗
template未存在
template hash不一致
Word生成失敗
Verifier失敗
manualCheck
humanReview
legacy fallback 0回
失敗時Word生成 0回
Verifier未実行禁止
output compatibility
deterministic output
concurrent execution
static import graph
JSON drift
legacy regression
build
lint
ai:verify
git diff --check
```

各テストについて優先度を次で分類してください。

```text
P0
P1
P2
将来
```

## 必須成果物

以下を新規作成してください。

```text
docs/AI/53_Claude_Milestone5B_Phase2E_Architecture_Audit.md
```

## 監査報告書の必須構成

```text
# Claude監査報告：Milestone 5-B / Phase 2-E Architecture Audit

## 1. Executive Verdict

## 2. Scope and Evidence Reviewed

## 3. Findings Summary

## 4. Factual Accuracy Audit

## 5. Common Runner Form Audit

## 6. Dependency Injection Audit

## 7. Verifier Requirement Audit

## 8. Error Model Audit

## 9. Runner API Audit

## 10. Single Source of Truth Audit

## 11. Test Strategy Audit

## 12. Exact Next Implementation Scope

## 13. Required Corrections to Gemini Design

## 14. Stop Conditions

## 15. Final Recommendation
```

## Executive Verdict

以下のいずれかを明示してください。

```text
承認
条件付き承認
差戻し
```

条件付き承認または差戻しの場合は、実装開始前に必要な修正を列挙してください。

## Required Corrections

Gemini設計書に修正が必要な場合、次の形式で具体化してください。

```text
Correction ID
Severity
Current Design
Problem
Required Change
Evidence
Implementation Impact
```

Severity：

```text
Critical
High
Medium
Low
```

## 実装用の確定案

監査報告の最後に、次実装Phaseへそのまま渡せる粒度で以下を示してください。

```text
採用Runner形態
Dependencies型
Execution Config型
Result型
Error型
Verifier必須性
Registry注入方法
Word生成依存の型
manualCheck / humanReviewの扱い
最小変更ファイル
変更禁止ファイル
必須テスト
commit前検証
停止条件
```

## 変更対象

原則として新規作成を許可するのは以下のみです。

```text
docs/AI/53_Claude_Milestone5B_Phase2E_Architecture_Audit.md
```

本指示書をrepositoryへ配置した場合は以下も許可します。

```text
docs/AI/53_Claude_Milestone5B_Phase2E_Architecture_Audit_Instruction.md
```

上記以外の差分が発生した場合は停止してください。

## 検証

```bash
git diff --check
git status -sb
git diff --stat
git diff --name-only
git diff -- docs/AI/53_Claude_Milestone5B_Phase2E_Architecture_Audit.md
```

AI文書検証が存在する場合：

```bash
npm run ai:verify
```

`docs/AI/06_Verification_Result.json`が変更された場合は、内容確認後、今回の成果物でなければstageせず元に戻してください。

## Git操作

全検証通過後のみ実施してください。

```bash
git add \
  docs/AI/53_Claude_Milestone5B_Phase2E_Architecture_Audit.md \
  docs/AI/53_Claude_Milestone5B_Phase2E_Architecture_Audit_Instruction.md
```

本指示書がrepositoryに存在しない場合は、監査報告書のみstageしてください。

`git add .`は禁止です。

```bash
git diff --cached --check
git diff --cached --stat
git diff --cached --name-only
git diff --cached
```

commit：

```bash
git commit -m "docs: audit phase 2e profile verification architecture"
```

push：

```bash
git push origin feature/milestone-5b-phase2c-career-up-integration
```

最終確認：

```bash
git status -sb
git log -2 --oneline
git rev-parse HEAD
```

## 完了条件

- 実コードを根拠に監査
- Gemini設計書の事実精度を評価
- Runner形態を確定
- DI境界を確定
- Verifier必須性を確定
- throw / Result境界を確定
- API型修正案を提示
- S1案を評価
- 次実装Phaseの最小安全スコープを提示
- 必須テスト優先度を提示
- 実装コードを変更していない
- `git diff --check` PASS
- `ai:verify` PASS
- 対象限定commit
- push成功
- working tree clean

## 停止条件

以下の場合はcommit・pushせず停止してください。

1. working treeがcleanではない
2. HEADが期待commitと一致しない
3. 必読コードを確認できない
4. GenerationResultDTOやVerifier境界を確認できない
5. 設計判断に必要な根拠が不足
6. 監査報告書以外に予期しない差分が発生
7. `git diff --check`失敗
8. `ai:verify`失敗

## 完了報告

以下を簡潔に報告してください。

1. 監査報告書パス
2. Executive Verdict
3. Critical / High指摘
4. 採用Runner形態
5. Verifier必須性
6. Error / Result境界
7. Registry注入方式
8. Word生成DI方式
9. S1案の判定
10. 次実装Phaseの最小範囲
11. 必須テスト
12. `ai:verify`結果
13. `git diff --check`結果
14. commit hash
15. push結果
16. 最終`git status -sb`
