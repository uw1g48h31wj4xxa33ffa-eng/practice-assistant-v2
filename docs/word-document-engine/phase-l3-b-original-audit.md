# Word Document Engine Phase L3-B: 原本監査報告書

## 1. 監査日時
2026-07-15

## 2. 対象ファイル
`/Users/to/Documents/practice-assistant-input/001687895.docx`

## 3. SHA-256
`b87253adeb29b593913c97fe972a4bb3afb8c36bac6dbb66bd70d08146963da8`

## 4. 正式様式名
働き方改革推進支援助成金交付申請書 （様式第１号）

## 5. 制度・コース・年度
- **制度**: 働き方改革推進支援助成金
- **コース**: 労働時間短縮・年休促進支援コース
- **年度**: 令和8年度（R8）

## 6. Package構成
- 内部ファイル総数: 28ファイル
- XMLファイル総数: 27ファイル
- 外部リンク有無: なし
- 埋め込みオブジェクト有無: なし
- マクロ・ActiveX有無: なし

## 7. 構造集計
- **表（w:tbl）総数**: 16
- **SDT（w:sdt）総数**: 109
- **SDT論理グループ総数**: 45
- **監査対象論理フィールド総数 (A)**: 96
- ※ 最新の正確な集計結果は `docs/word-document-engine/phase-l3-final-report.md` を参照してください。

## 8. 差分是正事項（Phase L3-B 最終是正）
1. **繰返し表**: 既存Coreに配列行追加ロジックが存在しないことを実コードで確認し、E分類に変更しました。
2. **改行付き自由記述**: `WordFiller`に `w:br` 出力機能がないことを確認し、D分類に変更しました。
3. **混合SDT制約**: 必須選択部分と任意選択部分を論理分割しました。

## 9. 停止条件該当有無
なし。

## 10. Phase L3-C進行可否
進行可能。

## 11. Level 3 最終完了報告
※ 数値の整合性を確保した最終報告は `docs/word-document-engine/phase-l3-final-report.md` を参照してください。

### B. 検証
- **テスト総数**: 220件
- **pass/fail/skip/todo**: 220 / 0 / 0 / 0
- **verify結果**: 成功 (既存様式全パス、新様式パス)
- **build結果**: 成功
- **全体lint終了コード**: 1 (既存部分による失敗)
- **変更ファイル限定lint結果**: error 0 / warning 0
- **OutputVerifier結果**: 成功
- **DomSerializationVerifier結果**: 成功
- **原本SHA-256**: `b87253adeb29b593913c97fe972a4bb3afb8c36bac6dbb66bd70d08146963da8`
- **v3 SHA-256**: `7357ca119318cb6d92b77104014e635b0bdb56aad8a9bc7346e365c5488df4fb`
- **v3出力パス**: `/Users/to/Documents/practice-assistant-output/001687895_level3_final_human_verification_v3.docx`
- **リポジトリ内docx有無**: なし
- **Word修復警告**: なし（人間確認済）
- **重大レイアウト崩れ**: なし（人間確認済）
- **軽微な表示差の有無**: なし

### C. Word実アプリ確認結果
Microsoft Word実アプリで主要入力値、表、罫線、セル結合およびページ構造を確認した。明確な修復警告および重大なレイアウト崩れは確認されなかった。manualCheck／humanReview対象は自動入力せず、原本状態を維持した。

### D. 残存事項
- **manualCheck／humanReview項目**: 口座種類、改善事業①～⑨、追加成果目標④⑤、固定繰返し行、複数行自由記述
- **Level 4へ持ち越す事項**: 新規Core候補の実装評価（行追加・改行出力・同一段落複数SDT処理等）

