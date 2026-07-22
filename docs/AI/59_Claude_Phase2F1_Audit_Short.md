# Claude Short Audit - Phase 2-F1

## 目的

実装は禁止です。調査・監査のみ実施してください。

## 最重要

-   身勝手な推測や独断は絶対にしないでください。
-   コード変更禁止
-   commit禁止
-   push禁止

## 対象

現在のブランチの最新差分を監査してください。

## 重点監査

1.  JSONトップレベル変更が既存契約を壊していないか
2.  JsonProfileAdapterに固定値・推測値・二重定義が残っていないか
3.  JSON Single Sourceになっているか
4.  MappingProfile IDがJSON由来か
5.  Runner / Verifier / Profile契約変更有無
6.  legacyへの影響
7.  Phase2-F1指示書違反
8.  ai:verify / build / lint / git diff --check の実施証跡

## 出力

P0 / P1 / P2 / P3で分類してください。

各項目は - 問題 - 原因 - 修正方法 のみ記載してください。

コード全文は不要です。

## 最終判定

-   承認
-   差し戻し
