# Milestone 5-B Phase 2-A 未Commit AI文書 分類レポート

## A. 正本として保持
以下は、今後の開発・AI連携で継続参照される設計、方針、ルール、事前調査、正式指示書です。

### `docs/AI/00_AI_Collaboration_Policy_and_Operating_History.md`
- **purpose**: AI連携とガバナンス履歴の記録 (Markdown版)
- **status**: Valid
- **rationale**: 将来のポリシー参照用として有用
- **futureReference**: Yes
- **commitRecommendation**: Yes

### `docs/AI/00_External_Disclosure_Public_Markdown_Rule.md`
- **purpose**: 外部公開用Markdown作成ルール
- **status**: Valid
- **rationale**: プロジェクト標準の開示ルール
- **futureReference**: Yes
- **commitRecommendation**: Yes

### `docs/AI/03_AI_Collaboration_Governance_Commit_Report.json`
- **purpose**: ガバナンスに関する初期のCommit実行記録
- **status**: Valid
- **rationale**: AI開発体制の証跡として重要
- **futureReference**: Yes
- **commitRecommendation**: Yes

### `docs/AI/12_Milestone5B_Phase2_Design_Scope_Stop_Conditions.md`
- **purpose**: Phase 2 全体の設計とスコープ定義
- **status**: Valid
- **rationale**: Phase 2-B以降の設計・スコープ境界の参照必須資料
- **futureReference**: Yes
- **commitRecommendation**: Yes

### `docs/AI/13_Milestone5B_Phase2_PreImplementation_Research.md`
- **purpose**: Phase 2 実装前調査結果
- **status**: Valid
- **rationale**: 実装時の設計判断の根拠として保持
- **futureReference**: Yes
- **commitRecommendation**: Yes

### `docs/AI/14_Gemini_Milestone5B_Phase2_PreImplementation_Research_Instruction.md`
- **purpose**: Phase 2 調査指示書
- **status**: Valid
- **rationale**: 調査指示と結果のセットとして保管
- **futureReference**: Yes
- **commitRecommendation**: Yes

### `docs/AI/15_Gemini_Milestone5B_Phase2A_Profile_Loader_Implementation_Instruction.md`
- **purpose**: Phase 2-A 実装指示書
- **status**: Valid
- **rationale**: Phase 2-Aの要件と結果の突合用に保持
- **futureReference**: Yes
- **commitRecommendation**: Yes

## B. 実行履歴として保持
以下は、実装・検証・レビュー・Commit・Pushの過程を証跡として残す価値がある文書です。

### `docs/AI/17_Gemini_Milestone5B_Phase2A_Review_Context_JSON_Generation_Instruction.md`
- **purpose**: Phase 2-A レビュー用Context作成の指示
- **phase**: Phase 2-A 検証
- **evidenceValue**: High
- **futureReferenceRisk**: Low
- **commitRecommendation**: Yes

### `docs/AI/18_Gemini_Milestone5B_Phase2A_Limited_Quality_Fix_Instruction.md`
- **purpose**: 品質修正の指示
- **phase**: Phase 2-A 修正
- **evidenceValue**: High
- **futureReferenceRisk**: Low
- **commitRecommendation**: Yes

### `docs/AI/19_Copilot_Milestone5B_Phase2A_PreCommit_Review_Task_v3.json`
- **purpose**: Copilotへのレビュー指示（最新版）
- **phase**: Phase 2-A レビュー
- **evidenceValue**: High
- **futureReferenceRisk**: Low
- **commitRecommendation**: Yes

### `docs/AI/20_Gemini_Milestone5B_Phase2A_SelfContained_Copilot_Review_Bundle_Generation_Instruction.md`
- **purpose**: Copilot用バンドル生成指示
- **phase**: Phase 2-A レビュー準備
- **evidenceValue**: High
- **futureReferenceRisk**: Low
- **commitRecommendation**: Yes

### `docs/AI/21_Gemini_Milestone5B_Phase2A_Limited_Stage_and_Commit_Instruction.md`
- **purpose**: Phase 2-A 初期Commit指示
- **phase**: Phase 2-A Commit
- **evidenceValue**: High
- **futureReferenceRisk**: Low
- **commitRecommendation**: Yes

### `docs/AI/22_Gemini_Milestone5B_Phase2A_Trailing_Whitespace_Fix_and_Commit_Instruction.md`
- **purpose**: 報告書の末尾空白修正後Commit指示
- **phase**: Phase 2-A Commit
- **evidenceValue**: High
- **futureReferenceRisk**: Low
- **commitRecommendation**: Yes

### `docs/AI/23_Gemini_Milestone5B_Phase2A_PrePush_Final_Verification_Instruction.md`
- **purpose**: Push前最終確認指示
- **phase**: Phase 2-A Push前
- **evidenceValue**: High
- **futureReferenceRisk**: Low
- **commitRecommendation**: Yes

### `docs/AI/24_Gemini_Milestone5B_Phase2A_Limited_Push_Instruction.md`
- **purpose**: 限定Push実行指示
- **phase**: Phase 2-A Push
- **evidenceValue**: High
- **futureReferenceRisk**: Low
- **commitRecommendation**: Yes

### `docs/AI/25_Gemini_Milestone5B_Phase2A_Uncommitted_AI_Documents_Organization_and_Commit_Instruction.md`
- **purpose**: AI文書の整理とCommit指示 (本指示書)
- **phase**: Phase 2-A 後処理
- **evidenceValue**: High
- **futureReferenceRisk**: Low
- **commitRecommendation**: Yes

## C. 重複・旧版・廃止候補
以下は、旧版、形式重複、または運用ルールの変更により今後誤参照の原因になる文書です（今回はCommit対象外）。

### `docs/AI/16_Copilot_Milestone5B_Phase2A_PreCommit_Review_Instruction.json`
- **duplicateOf**: `docs/AI/19_Copilot_Milestone5B_Phase2A_PreCommit_Review_Task_v3.json`
- **obsoleteReason**: 古いレビュー指示書のv1版
- **riskIfRetained**: 古い条件でレビューを実行してしまうリスク
- **deletionRecommendation**: Yes
- **commitRecommendation**: No

### `docs/AI/16_Copilot_Milestone5B_Phase2A_PreCommit_Review_Instruction.md`
- **duplicateOf**: `docs/AI/19_Copilot_Milestone5B_Phase2A_PreCommit_Review_Task_v3.json`
- **obsoleteReason**: 旧フォーマット(Markdown)のレビュー指示書
- **riskIfRetained**: JSON形式の正式版との誤参照リスク
- **deletionRecommendation**: Yes
- **commitRecommendation**: No

### `docs/AI/16_Copilot_Milestone5B_Phase2A_PreCommit_Review_Instruction_v2.json`
- **duplicateOf**: `docs/AI/19_Copilot_Milestone5B_Phase2A_PreCommit_Review_Task_v3.json`
- **obsoleteReason**: 古いバージョンのレビュー指示書
- **riskIfRetained**: 誤参照リスク
- **deletionRecommendation**: Yes
- **commitRecommendation**: No

### `docs/AI/Copilot_Handoff_AI_Collaboration_Policy_Review.json`
- **duplicateOf**: 自己完結型バンドル方式への移行により不要化
- **obsoleteReason**: レガシーなHandoff文書
- **riskIfRetained**: 運用ルールの混乱
- **deletionRecommendation**: Yes
- **commitRecommendation**: No

### `docs/AI/Copilot_Handoff_AI_Collaboration_Policy_Review.md`
- **duplicateOf**: 自己完結型バンドル方式への移行により不要化
- **obsoleteReason**: レガシーなHandoff文書
- **riskIfRetained**: 運用ルールの混乱
- **deletionRecommendation**: Yes
- **commitRecommendation**: No

## D. `06_Verification_Result.json`
- **currentDiffSummary**: `generatedAt` タイムスタンプや一部のダイジェスト、`originHead` ハッシュが更新されただけの状態。
- **relationToPhase2A**: 各種テストとLintが成功しているという最新状態を示すが、Phase 2-Aのロジック変更自体ではない。
- **recommendedHandling**: 今回はAI文書整理にスコープを絞るためstage対象外とする。後日Phase 2-Bなど別のCommitの際に自然にコミットするのが適切。
- **commitRecommendation**: No

## E. 最終提案
- **今回Commit対象**: A分類・B分類の全15ファイル、および本分類レポート（計16ファイル）
- **今回Commit対象外**: C分類の廃止候補ファイル（5ファイル）、および `docs/AI/06_Verification_Result.json`
- **削除候補**: C分類に記載した5ファイル
- **保留候補**: `docs/AI/06_Verification_Result.json`
- **人間判断が必要な項目**: C分類の廃止候補ファイルの実際の削除実行可否
- **Phase 2-B開始前に残すべき正本**: A分類の7ファイル
