# 60_Gemini_Phase2F1_Audit_Followup

`<instruction>`{=html}.mdを読み、記載どおりに実行してください。

## 最重要

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

## 対応方針

Claude監査結果を反映し、Phase 2-F1を完了条件まで修正してください。

## 必須修正（優先順）

### P0

-   `as any` を撤廃してください。
-   全体lintを **baseline 56 errors以下** に戻してください。

### P1

-   Adapter内の固定値（schemaVersion, status, effectiveFrom, createdAt,
    updatedAt, version等）を見直してください。
-   JSON Single Sourceの方針に沿って整理してください。
-   `mappingProfileId`
    の推測ロジックを削除し、JSON必須項目としてください。不足時はエラーにしてください。

### P2

-   field数一致
-   field ID集合一致
-   field順序一致

以上を独立した自動テストとして追加してください。

## 完了条件

-   ai:verify PASS
-   build PASS
-   lint baseline非悪化
-   git diff --check PASS
-   全テストPASS
-   commit
-   push

最後に実施証跡を報告してください。
