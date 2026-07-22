# 役割

あなたは、Practice Assistant V2／Word Document Engineプロジェクトにおける実装担当AIです。
本指示書の範囲では、Phase 2-F2の最終証跡を再確認する担当として行動してください。

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

# 目的

Phase 2-F2の正式完了承認に必要な最終証跡を、既存コード・文書・設定を変更せず、事実に基づいて再確認してください。

確認対象：

- HEADとoriginブランチの完全コミットハッシュ
- 前回報告されたコミットハッシュとの相違
- `npm run ai:verify` 本体の正確なEXIT code
- `ai:verify` 実行後のGit状態
- `docs/AI/06_Verification_Result.json` の差分有無
- 未追跡ファイルを含む作業ツリー状態の正確な表現

# 前提・正本

対象ブランチ：

```text
feature/milestone-5b-phase2c-career-up-integration
```

前回申告されたコミット：

```text
f3adedbd67e2a472c1c7df0e0a5c4dfed34d7bc1
```

直近確認されたコミット：

```text
f3adedb4d4f3dec21f70a2299cc6460d8632539f
```

上記2つは異なる完全ハッシュです。同一コミットと断定しないでください。

# 対象範囲

## 対象

- Git履歴、HEAD、originの確認
- HEADコミット内容の確認
- `npm run ai:verify` の単独実行
- `ai:verify` 直後のEXIT code取得
- 実行後のGit状態確認
- `docs/AI/06_Verification_Result.json` の差分確認
- `git diff --check`
- 証跡報告

## 対象外

- ソースコード、テスト、Markdown、JSON、設定の変更
- commit、amend、push
- stash、checkout、reset、clean
- 未追跡ファイルの削除・移動
- エラー発生時の修正

# 実施内容

以下を記載順に実行してください。

```bash
git log -3 --oneline --decorate
git rev-parse HEAD
git rev-parse origin/feature/milestone-5b-phase2c-career-up-integration
git show --stat --oneline HEAD
npm run ai:verify
echo "AI_VERIFY_EXIT:$?"
git status --short
git diff -- docs/AI/06_Verification_Result.json
git diff --check
echo "DIFF_CHECK_EXIT:$?"
```

`npm run ai:verify` はパイプへ渡さず、単独で実行してください。
`AI_VERIFY_EXIT` はその直後に取得してください。

# 禁止事項

- コード、文書、テスト、設定を変更しない
- commit、amend、pushをしない
- stash、checkout、reset、cleanをしない
- 未追跡ファイルを削除しない
- `npm run ai:verify` の出力を `tail`、`grep` 等へパイプしない
- 異なる完全ハッシュを同一コミットと扱わない
- 未追跡ファイルが存在する状態を「作業ツリーClean」と表現しない
- 実行結果を推測で補完しない
- EXIT codeを省略しない
- エラーを握りつぶさない
- 指示範囲外の調査・修正をしない

# 停止条件

次のいずれかが発生した場合は、その時点で停止し、修正せず報告してください。

- コマンドを実行できない
- 対象ブランチを確認できない
- `npm run ai:verify` が非ゼロ終了する
- 意図しないファイル変更が発生する
- HEADまたはoriginに新たな不整合が見つかる
- EXIT codeを正しく取得できない
- リポジトリ状態を安全に確認できない

# 検証方法

1. `git log -3 --oneline --decorate`
   - 直近3件、HEAD、originの位置を確認

2. `git rev-parse`
   - HEADとoriginの完全ハッシュ、一致・不一致を確認

3. `git show --stat --oneline HEAD`
   - HEADの件名、変更ファイル、差分統計を確認

4. `npm run ai:verify`
   - 本体の成否、直後のEXIT code、Required Gatesを確認

5. `git status --short`
   - 追跡変更、ステージ済み変更、未追跡ファイルを区別

6. `git diff -- docs/AI/06_Verification_Result.json`
   - `ai:verify` による追跡差分の有無を確認

7. `git diff --check`
   - whitespace errorとEXIT codeを確認

# 完了条件

- 全指定コマンドを記載順に実行している
- `npm run ai:verify` を単独実行している
- `AI_VERIFY_EXIT` を直後に取得している
- HEADとoriginの完全ハッシュを報告している
- 前回申告ハッシュとの差異を事実に基づいて説明している
- `ai:verify` 実行後のGit状態を報告している
- `06_Verification_Result.json` の差分有無を報告している
- 未追跡ファイルがある場合、作業ツリーCleanと表現していない
- コード・文書・設定等を変更していない
- 推測を含まず、証跡だけで報告している

# 出力・報告形式

## 1. 実行前提
- 対象ブランチ
- 前回申告コミット
- 現在確認対象のコミット

## 2. コマンド別結果
各コマンドについて以下を記載：
- 実行コマンド
- EXIT code
- stdout／stderrの要点
- 実行日時
- 判定

## 3. コミット整合性
- HEAD完全ハッシュ
- origin完全ハッシュ
- HEADとoriginの一致・不一致
- 前回申告ハッシュとの一致・不一致
- `git log` と `git show` に基づく事実

## 4. ai:verify結果
- 本体のEXIT code
- Required Gates
- 生成・更新されたファイルの有無

## 5. Git状態
- 追跡対象の未コミット変更
- ステージ済み変更
- 未追跡ファイル
- `docs/AI/06_Verification_Result.json` の差分
- 作業ツリーの正確な状態

## 6. 最終判定
次のいずれかのみ：
- `Evidence Confirmed`
- `Evidence Incomplete`
- `Stopped`

問題がある場合は修正せず、問題点と不足証跡のみ報告してください。
