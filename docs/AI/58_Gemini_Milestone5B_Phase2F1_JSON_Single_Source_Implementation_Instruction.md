# Gemini指示書：Milestone 5-B / Phase 2-F1 JSON Single Source 実装

## 目的
Milestone 5-B / Phase 2-F1として、Form Profile・Mapping Profile・Field Definitionsに存在する重複定義を整理し、JSONをSingle Source of Truthとする最小実装を行ってください。

本作業では、既存のProfile Verification Runner、Verifier、Career-up wrapper、legacy runner、DTO契約を変更せず、データ定義の重複だけを安全に解消してください。

## 最重要ルール
身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

- 既存仕様を変更しないでください。
- Phase 2-F1の範囲を超えてRegistry再設計をしないでください。
- UI、API、Practice Assistant V2接続を行わないでください。
- legacy runner、legacy mapping、Verifier Coreを変更しないでください。
- 自動legacy fallbackを追加しないでください。
- `manualCheck`、`humanReview`、`inputsToFill`契約を変更しないでください。
- 既存テストを削除、skip、only化しないでください。
- 無関係なリファクタリングをしないでください。
- `git add .`、`git add -A`は禁止です。
- 予期しない差分、設計矛盾、検証失敗がある場合はcommit・pushせず停止してください。

## 対象ブランチ
`feature/milestone-5b-phase2c-career-up-integration`

## 期待HEAD
`e16951918b595cbdee531cc7f281b007c608d4ab`

commit message：
`docs: record phase 2e completion`

## 事前確認
```bash
git branch --show-current
git status -sb
git log -5 --oneline
git rev-parse HEAD
```

対象ブランチ、working tree clean、期待HEAD一致を確認してください。一致しない場合は停止してください。

## 必読資料
```text
docs/AI/01_AI_Package.md
docs/AI/53_Claude_Milestone5B_Phase2E_Architecture_Audit.md
docs/AI/55_Claude_Milestone5B_Phase2E_Implementation_Audit.md
docs/AI/56_Gemini_Milestone5B_Phase2E_Audit_Followup_Instruction.md
docs/AI/57_Gemini_AI_Package_Phase2E_Completion_Update_Instruction.md
```

加えて、以下を確認してください。
```text
src/profiles/**
scripts/document-verification/config/**
scripts/document-verification/verify-career-up-profile-driven.mjs
scripts/document-verification/verify-career-up-form1.mjs
```

# Phase 2-F1の対象

## 目的
以下に重複して存在する情報を特定し、JSONを唯一の正本へ寄せます。

- Form Profile
- Mapping Profile
- Field Definitions
- wrapper内の派生定義
- test fixture内の重複定義

## JSON Single Sourceの原則
1. 正本はJSON
2. TypeScript / MJS側はJSONを読み込んで利用
3. 同じfield ID、型、順序、属性を複数箇所に手書きしない
4. 実行時に既存契約へ変換するAdapterは許可
5. legacy runnerの既存定義は変更しない
6. Profile-driven経路だけを対象にする

# 最初に行う調査

## 1. 重複定義一覧
以下を整理してください。

- 定義内容
- 現在の所在
- 正本候補
- 重複先
- 削除可能か
- Adapterで変換すべきか
- legacy経路への影響

## 2. JSON候補
既存JSONのうち、Single Sourceにできるものを確認してください。

想定候補：
`scripts/document-verification/config/career-up-r8-form1-fields.json`

実際のリポジトリを確認し、推測で確定しないでください。

## 3. 既存読み込み経路
以下を確認してください。

- FormProfile登録時の読み込み
- MappingProfile登録時の読み込み
- Runnerからの参照
- wrapperからの参照
- Verifierへの渡し方
- test fixtureの作り方

## 4. 変更最小化案
調査結果から、最小差分でJSON Single Sourceを成立させる設計を決めてください。

# 実装方針

## 許可
- 既存JSONをimport / readしてProfile定義を生成
- JSONからFormProfile / MappingProfile / Field Definitions向けAdapterを生成
- 共通変換関数の最小追加
- Profile-driven test fixtureのJSON参照化
- JSONとProfile定義の整合性テスト追加

## 禁止
- legacy mappingの削除
- legacy field JSONの破壊的変更
- Registry API変更
- Runner API変更
- Verifier API変更
- CLI引数変更
- DTO変更
- UI/API追加
- feature flag追加
- fallback経路追加
- JSON schemaの大規模再設計
- Phase 2-F2相当のRegistry全面整理

# 必須成果物

## 1. JSON Single Source実装
Profile-driven経路では、同一field定義についてJSONを正本として利用してください。

最低限、以下の重複を削減してください。

- field ID
- field type
- field order
- field metadata
- manualCheck / humanReviewに必要な属性
- mappingに必要な参照情報

JSONに存在しない項目を無理に追加しないでください。不足する場合は最小限の追記に留めてください。

## 2. Adapter
JSONから既存契約へ変換するAdapterを必要最小限で実装してください。

- Runner契約を変更しない
- MappingProfile契約を変更しない
- FormProfile契約を変更しない
- Verifier入力契約を変更しない
- Career-up固有処理を共通層へ混入させない

## 3. 整合性テスト
最低限、以下を追加または強化してください。

- JSON上のfield数とProfile-driven field数が一致
- field ID集合が一致
- field順序が一致
- Mapping参照先が全てJSONに存在
- JSON未定義fieldがProfile側に存在しない
- Profile-only重複定義が残っていない
- legacy verificationが非影響

## 4. 既存契約維持
以下を確認してください。

- `runVerifier`必須
- `inputsToFill`伝播
- `manualCheck`
- `humanReview`
- legacy fallback 0
- Career-up wrapper正常動作
- Core throw / CLI Result境界

# 変更許可範囲
```text
src/profiles/**
scripts/document-verification/config/**
scripts/document-verification/verify-career-up-profile-driven.mjs
src/profiles/tests/**
docs/AI/58_Gemini_Milestone5B_Phase2F1_JSON_Single_Source_Implementation_Instruction.md
```

原則変更禁止：
```text
scripts/document-verification/verify-career-up-form1.mjs
既存legacy mapping
既存Verifier Core
Word生成Core
UI
API
Practice Assistant V2画面
docs/AI/01_AI_Package.md
```

# 実装前停止条件
以下の場合は、実装せず調査報告だけ残して停止してください。

1. JSON正本化にlegacy runner変更が必要
2. Runner API変更が必要
3. Verifier API変更が必要
4. MappingProfile契約変更が必要
5. FormProfile契約変更が必要
6. 既存JSONが正本として利用不能
7. 大規模schema変更が必要
8. 3ファイル以上の共通Core再設計が必要
9. Phase 2-F2相当のRegistry再設計が不可避
10. UI/API変更が必要

# 必須検証

## 対象テスト
```bash
npx tsx --test src/profiles/tests/profile-verification-runner.test.ts
npx tsx --test src/profiles/tests/profile-driven-career-up-integration.test.ts
npx tsx --test src/profiles/tests/*.test.ts
```

## legacy verification
`package.json`を確認し、実在する正しいcommandを使用してください。

想定：
```bash
node scripts/document-verification/verify-career-up-form1.mjs
```

## Profile-driven verification
```bash
npx tsx scripts/document-verification/verify-career-up-profile-driven.mjs
```

## 全体検証
```bash
npm run ai:verify
npm run build
```

## 対象限定lint
```bash
npx eslint <変更したTS/MJSファイル>
```

0 errors / 0 warningsを必須とします。

## 全体lint
```bash
npm run lint
```

既存baseline：
```text
56 errors
23 warnings
```

今回差分で悪化させないでください。

## 差分検証
```bash
git diff --check
git status -sb
git diff --stat
git diff --name-only
git diff
```

# 完了条件
- Profile-driven経路のfield定義がJSON Single Source化
- 同一field定義の手書き重複削減
- JSONから既存契約へのAdapter実装
- Runner / Verifier / MappingProfile / FormProfile API変更なし
- legacy runner変更なし
- legacy fallback 0
- JSONとProfile定義のfield数一致
- field ID集合一致
- field順序一致
- Mapping参照整合性PASS
- Runner単体テストPASS
- Career-up統合テストPASS
- Profile全テストPASS
- legacy verification PASS
- profile-driven verification PASS
- ai:verify PASS
- build PASS
- 対象限定lint 0 errors / 0 warnings
- 全体lint baseline非悪化
- git diff --check PASS
- 対象限定stage
- commit・push成功
- working tree clean

# 停止条件
branch・HEAD・clean状態の不一致、AI_Packageとの矛盾、legacy/Runner/Verifier/Profile契約変更の必要、大規模schema変更、Registry再設計、テスト・verification・build・lint・diff-check失敗、予期しない差分発生時はcommit・pushせず停止してください。

# Git操作
全検証通過後のみ実施してください。

```bash
git add <変更ファイルを個別指定>
git diff --cached --check
git diff --cached --stat
git diff --cached --name-only
git diff --cached
git commit -m "refactor: establish profile json single source"
git push origin feature/milestone-5b-phase2c-career-up-integration
git status -sb
git log -2 --oneline
git rev-parse HEAD
```

# 完了報告
1. 調査した重複定義
2. Single Sourceに採用したJSON
3. 変更ファイル
4. 削除した重複
5. 追加したAdapter
6. JSON schema変更有無
7. Runner / Verifier / MappingProfile / FormProfile契約変更なし確認
8. legacy runner変更なし確認
9. legacy fallback 0確認
10. JSONとProfileのfield数
11. field ID集合一致結果
12. field順序一致結果
13. Mapping参照整合性結果
14. Runner単体テスト件数・結果
15. 統合テスト件数・結果
16. Profile全テスト件数・結果
17. legacy verification結果
18. profile-driven verification結果
19. ai:verify結果
20. build結果
21. 対象限定lint結果
22. 全体lint baseline比較
23. git diff --check結果
24. commit hash
25. push結果
26. 最終git status
27. Phase 2-F1完了可否
