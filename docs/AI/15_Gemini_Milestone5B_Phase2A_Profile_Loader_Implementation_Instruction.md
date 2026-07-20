# Milestone 5-B Phase 2-A 実装指示書

## 1. 目的

Milestone 5-B Phase 2-Aとして、Profile Loaderおよび参照検証のみを実装してください。

本指示書の対象はPhase 2-Aに限定します。

## 2. 必須参照文書

実装前に、以下を最初から最後まで確認してください。

- `docs/AI/00_AI_Collaboration_Policy_and_Operating_History.json`
- `docs/AI/12_Milestone5B_Phase2_Design_Scope_Stop_Conditions.md`
- `docs/AI/13_Milestone5B_Phase2_PreImplementation_Research.md`

上記文書間で矛盾がある場合は、実装せず停止してください。

## 3. 実装対象

今回の実装対象は以下のみです。

- Profile Loader
- Loaderに必要な型
- Loaderに必要なエラー型
- Profile読み込み時のJSON Schema検証
- Profile参照フィールドの存在検証
- Profile参照先の存在検証
- Profile種別と参照先種別の整合性検証
- 重複Profile IDまたは重複versionの拒否
- Loader単体テスト
- 既存Profile Registryとの接続に必要な最小限の変更
- 必要なexport整理
- 実装報告Markdownの作成

## 4. 実装対象外

以下には着手しないでください。

- Profile Resolver
- Execution Context Builder
- Career-Up Form Adapter
- Document Engine統合
- Word Engine統合
- UI変更
- API変更
- 既存Lintエラーの修正
- Phase 2-B
- Phase 2-C
- 指示範囲外のリファクタリング

## 5. 実装原則

- 既存Profile型、Schema、Registry、Version Registryを最大限再利用すること
- Loaderはファイル読み込み、構文解析、Schema検証、参照検証までを責務とすること
- Resolver相当の解決済みExecution Contextを生成しないこと
- 参照検証は調査報告書で確定したフィールド名とタイミングに従うこと
- 不正なProfileを黙って無視しないこと
- エラーは明示的かつ判別可能な形で返すこと
- `any`を使用しないこと
- 型アサーションの乱用を避けること
- 既存互換性を維持すること
- 既存のDocument Engine、Word Engine、Career-Up Formの挙動を変更しないこと

## 6. 必須テスト

最低限、以下を追加または確認してください。

### 正常系

- 単一Profileの読み込み成功
- 複数Profileの読み込み成功
- Schema検証成功
- 有効な参照先の検証成功
- 既存Registryへの登録成功
- version違いのProfile共存成功

### 異常系

- JSON構文エラー
- Schema不一致
- 未知のProfile種別
- 必須項目欠落
- 重複Profile ID
- 同一Profile ID・同一version重複
- 存在しない参照先
- 参照先種別不一致
- 不正version
- 空ディレクトリ
- 対象外ファイル混在時の期待挙動
- 読み込み途中で失敗した場合にRegistryが中途半端な状態にならないこと

## 7. 検証

実装後、以下を実行してください。

- Phase 2-A対象テスト
- 既存Profile関連テスト
- `npm run ai:verify`
- `npm run build`
- 変更対象ファイルのみのlint
- `git diff --check`
- `git status --short`
- 変更ファイル一覧確認
- 指示範囲外の差分がないことの確認

既存のリポジトリ全体Lintエラーは修正対象外です。
ただし、今回変更したファイルに新規Lintエラーまたは警告を追加してはいけません。

## 8. Git操作

実装、テスト、検証、報告書作成まで行ってください。

以下は、明示的な人間承認があるまで実施しないでください。

- Commit
- Push
- Pull Request
- Merge

既存の未追跡ファイルや無関係な差分をstageしないでください。

## 9. 実装報告書

詳細報告を以下へ保存してください。

`docs/AI/15_Milestone5B_Phase2A_Profile_Loader_Implementation_Report.md`

最低限、以下を記載してください。

- 実装概要
- 変更ファイル
- 新規ファイル
- Loaderの責務
- 参照検証仕様
- エラー仕様
- 既存Registryとの接続方法
- 後方互換性
- 実行したテスト
- 検証結果
- build結果
- changed-files lint結果
- 既存Lintエラーとの差分
- Git状態
- 未解決事項
- Stop Condition判定
- Phase 2-B開始可否
- Commit可否
- 推奨する次の作業

## 10. 停止条件

以下のいずれかに該当した場合は、実装または作業を停止してください。

- 参照文書間に重大な矛盾がある
- 調査報告書で確定した設計を実装できない
- LoaderとResolverの責務境界を維持できない
- 既存Profile構造の破壊的変更が必要
- Document EngineまたはWord Engineへの変更が必要
- Career-Up Formへの変更が必要
- 既存互換性を保証できない
- 指示範囲外の修正が必要
- 必須テストが実行できない
- 今回変更による新規Lintエラーを解消できない
- 未確認事項を推測しなければ実装できない

停止時は、理由、根拠、影響範囲、必要な人間判断を報告してください。

## 11. 禁止事項

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

以下を禁止します。

- 勝手な仕様変更
- 指示範囲外の実装
- Resolverの先行実装
- Context Builderの先行実装
- Adapterの先行実装
- エラーの握りつぶし
- テスト省略
- 未確認事項の断定
- 無関係なファイル変更
- 無関係なstage
- 人間承認前のCommit、Push、PR、Merge

## 12. ユーザー向け完了報告

ユーザー向け返答は要点のみとし、次の形式にしてください。

- Phase 2-A実装：完了／停止
- Loader：実装済／未実装
- 参照検証：実装済／未実装
- テスト：成功／失敗
- `npm run ai:verify`：成功／失敗
- build：成功／失敗
- changed-files lint：成功／失敗
- 新規Lintエラー：有／無
- Blocking Issue：有／無
- Stop Condition：該当／非該当
- Commit可否：可／不可
- Phase 2-B開始可否：可／不可／条件付き
- 推奨する次の作業
