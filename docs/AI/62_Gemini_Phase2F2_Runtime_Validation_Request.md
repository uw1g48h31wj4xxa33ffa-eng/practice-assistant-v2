# Gemini向け実行指示書 — Phase 2-F2 Runtime Validation

# 役割

あなたは、Practice Assistant V2／Word Document Engineの実装担当Geminiです。

担当範囲は、承認済みの設計・指示に基づくリポジトリ調査、最小実装、テスト、検証、証跡作成、許可されたGit操作です。

次を厳守してください。

- 身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。
- アーキテクチャ、対象範囲、既存契約を勝手に変更しないでください。
- 完了や承認を独自に宣言しないでください。最終判断は人間が行います。
- チャット履歴ではなく、リポジトリ内の正本Markdownと実コードを基準にしてください。

# 目的

Phase 2-F1を正式に完了記録したうえで、Phase 2-F2として次の最小かつ安全な改善を実施してください。

> `JsonProfileAdapter.adapt(json: unknown)` の境界に明示的な実行時入力検証を追加し、不正なJSONをプロパティ参照前に決定論的に失敗させる。

この作業では、Phase 2-F1で確立したJSON Single Source設計と、既存のProfile／Runner／Verifier契約を維持してください。

# 前提・正本

作業開始前に、次の順序で必ず読んでください。

1. `docs/AI/00_AI_Development_Master_v4.0.md`
2. `docs/AI/01_AI_Package.md`
3. 最新のPhase 2-F1実装記録およびClaude再監査記録
4. 本指示書
5. 本作業に必要なソースファイルのみ

正本はリポジトリ内のMarkdown、実コード、Git履歴です。チャット履歴を正本として扱わないでください。

Phase 2-F1の承認済み前提は次のとおりです。

- 基準コミット：`3aea56f`
- 修正コミット：`dcdd108`
- Claude再監査結果：**承認**

ただし、これらを現在HEADの固定条件として扱わないでください。実装前に現在のリポジトリ状態を確認し、実際のHEADを記録してください。

# 対象範囲

## 対象

- `src/profiles/resolution/json-profile-adapter.ts`
- 最小かつ一貫した配置場所に置く、入力検証helperまたはType Guard
- Adapterの不正入力に対する限定テスト
- `docs/AI/01_AI_Package.md`へのPhase 2-F1完了承認およびPhase 2-F2進捗の記録
- リポジトリ標準で要求される検証証跡
- 全必須Gate通過後の、制御されたcommitおよびpush

## 対象外

- Profile schemaの再設計
- JSON field定義の再設計
- Runner、Registry、Verifier、Profile契約の変更
- legacy mappingの変更
- 無関係なlint修正
- UI変更
- Word出力変更
- 広範なリファクタリング
- 新規依存関係の追加

既存validatorを再利用できず、新規依存関係が必要と判断した場合は、インストールせず停止して報告してください。

# 実施内容

## 1. 状態確認

最初に以下を実行し、現在状態を記録してください。

```bash
pwd
git remote -v
git branch --show-current
git fetch origin
git rev-parse HEAD
git rev-parse origin/main
git status --short
git diff --stat
git diff --name-only
```

無関係な変更を安全に分離できない場合、または必要ファイルが存在しない場合は停止してください。

## 2. 実行時入力検証の実装

`adapt(json: unknown)` の境界で、最低限次を検証してください。

- 入力が`null`ではないobjectであること
- `template`が存在し、`null`ではないobjectであること
- Adapterが利用する必須template metadataが存在し、期待するprimitive typeであること
- `mappingProfileId`が存在し、空ではないstringであること
- `fields`が存在し、arrayであること
- 各fieldが、変換前にAdapterが必要とする最小プロパティを持つこと

`unknown`から明示的に型を絞り込んでください。

推奨形式は次のいずれかです。

```ts
function assertJsonProfileSource(value: unknown): asserts value is JsonProfileSource
```

または、同等の決定論的で読みやすいType Guardです。

エラーメッセージには、不正または欠落しているプロパティパスを含めてください。ただし、保護対象データを出力しないでください。

既存のoptional metadata向け互換fallbackは、F1承認済み挙動であり、かつ構造検証を通過した入力に限り維持して構いません。

## 3. テスト追加

最低限、以下の独立したテストを追加してください。

1. 現在の正しいJSONが正常にadaptされる
2. `null`入力を拒否する
3. array入力を拒否する
4. `template`欠落を拒否する
5. `mappingProfileId`欠落または不正を拒否する
6. `fields`欠落または非arrayを拒否する
7. 不正なfield entryをadapt前に拒否する
8. エラーが不正なプロパティパスを示す
9. 既存のfield数・ID集合・順序テストが変更されずPASSする
10. legacy verificationおよびprofile-driven verificationに回帰がない

## 4. AI_Package更新

`docs/AI/01_AI_Package.md`へ、少なくとも次を記録してください。

- Phase 2-F1が人間承認済みであること
- Claude再監査結果
- Phase 2-F2の目的、対象範囲、実施結果
- 実際のHEAD、最終commit hash、主要証跡

## 5. Git監査・commit・push

commit前に以下を実行してください。

```bash
git status --short
git diff --stat
git diff --name-only
git diff --check
```

対象ファイルだけを明示的なpath指定でstageしてください。包括的stageは禁止です。

stage後に以下を確認してください。

```bash
git diff --cached --stat
git diff --cached --name-only
```

全必須検証がPASSした場合に限り、commitおよびpushを実施してください。

# 禁止事項

- `as any`の追加
- 必須値に対するsilent fallback
- `mappingProfileId`の推測または自動生成
- 不正入力の部分的adapt
- テスト期待値の弱体化
- 既存テストの削除、skip、緩和
- Profile／Runner／Registry／Verifierの公開契約変更
- 対象外ファイルの便乗修正
- 広範な共通化・リファクタリング
- エラーの握りつぶし
- 検証未実施でのcommitまたはpush
- `git add .`、`git add -A`などの包括的stage
- 人間承認の代行または宣言

# 停止条件

次のいずれかに該当した場合は、実装継続、commit、pushを行わず停止してください。

- 現在のリポジトリ状態が承認済みF1状態と重大に矛盾する
- runtime validationのためにProfile／Runner／Verifierの公開契約変更が必要になる
- 新規依存関係が必要で、既存validatorでは対応できない
- 無関係な未commit変更を安全に分離できない
- テストの弱体化が必要になる
- full lintが`56 errors / 23 warnings`を超えて悪化する
- changed-file lintが0 errors / 0 warningsにならない
- legacy verificationまたはprofile-driven verificationが失敗する
- `npm run ai:verify`、build、`git diff --check`のいずれかが失敗する
- 必要な正本、対象ファイル、検証scriptが欠落している

停止時は、推測で回避せず、阻害要因、実行コマンド、EXIT、該当差分を報告してください。

# 検証方法

最低限、以下を実行してください。

```bash
npx tsx --test src/profiles/tests/*.test.ts
node scripts/document-verification/verify-career-up-form1.mjs
node scripts/document-verification/verify-career-up-profile-driven.mjs
npm run build
npm run ai:verify
git diff --check
```

変更したすべてのsource、test、scriptファイルに対して、changed-file lintを明示的に実行してください。

また、full repository lintを実行し、承認済みbaselineと比較してください。

```text
56 errors / 23 warnings
```

判定基準は次のとおりです。

- changed-file lint：0 errors / 0 warnings必須
- full lint：baseline非悪化必須
- 新規エラー、新規warning、件数増加はblocking

各コマンドについて、以下を証跡として記録してください。

- 実行コマンド
- EXIT code
- PASS／FAIL／warning件数（取得可能な場合）
- stdoutの要点
- 実行時刻またはevidence timestamp
- 必要に応じてstdout digest

さらに、以下を確認してください。

- `as any`が対象変更ファイルに存在しない
- Runner／Registry／Verifier／Profile契約に差分がない
- legacy runnerに差分がない
- field数・ID集合・順序テストが維持されている
- JSON Single Sourceが維持されている
- `mappingProfileId`推測ロジックが再導入されていない

# 完了条件

以下をすべて満たした場合のみ、Gemini側の作業結果を`Completed`として報告してください。

- Phase 2-F1承認が`docs/AI/01_AI_Package.md`へ記録されている
- Adapter境界にruntime validationが実装されている
- 不正入力がunsafe property access前に決定論的に失敗する
- `as any`が追加されていない
- 必須値の推測またはsilent fallbackが追加されていない
- malformed-input向け限定テストがPASSする
- Profile全テストがPASSする
- legacy verificationがPASSする
- profile-driven verificationがPASSする
- `npm run ai:verify`がPASSする
- buildがPASSする
- changed-file lintが0 errors / 0 warningsである
- full lintが`56 errors / 23 warnings`を超えていない
- `git diff --check`がPASSする
- 承認対象ファイルのみがcommitおよびpushされている
- 最終リポジトリ状態とcommit hashが記録されている
- 未解決のblocking issueがない

上記を満たしても、人間による最終承認を宣言してはいけません。

# 出力・報告形式

実装結果は、正本Markdownまたは指定された報告ファイルへ詳細に記録し、ユーザー向けには次の順序で簡潔に報告してください。

1. 開始時baseline状態
2. 実際に変更したファイル
3. runtime validationの設計概要
4. 追加したテスト
5. 検証結果表
   - command
   - EXIT code
   - PASS／FAIL／warning件数
   - evidence timestamp
6. full lint baseline比較
7. Git差分監査結果
8. commit hashおよびpush結果
9. 未解決懸念
10. 最終結果：`Completed`または`Stopped`

`Completed`はGeminiの実行完了を意味するだけであり、人間承認を意味しません。
