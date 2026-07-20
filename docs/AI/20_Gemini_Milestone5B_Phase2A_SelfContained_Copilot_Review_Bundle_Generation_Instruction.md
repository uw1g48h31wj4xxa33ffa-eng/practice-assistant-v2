# Gemini向け Milestone 5-B Phase 2-A 自己完結型 Copilot Review Bundle 生成指示書

## 1. 目的

Milestone 5-B Phase 2-Aについて、Copilotが外部ファイル、リポジトリ、Git状態、別文書を直接参照できない環境でも、単一JSONファイルだけでCommit前レビューを完結できるようにしてください。

今回作成する成果物は、以下を1ファイルへ統合した自己完結型レビュー資料です。

- Review Task
- Review Context
- 重要な実装差分
- 検証Evidence
- 判定ルール
- Copilot出力スキーマ

Copilotに別ファイルの参照を要求してはいけません。

---

## 2. 出力先

以下のJSONを新規作成してください。

`docs/AI/20_Milestone5B_Phase2A_Copilot_Review_Bundle.json`

---

## 3. 必須参照文書

作業前に以下を最初から最後まで確認してください。

- `docs/AI/00_AI_Collaboration_Policy_and_Operating_History.json`
- `docs/AI/12_Milestone5B_Phase2_Design_Scope_Stop_Conditions.md`
- `docs/AI/13_Milestone5B_Phase2_PreImplementation_Research.md`
- `docs/AI/15_Gemini_Milestone5B_Phase2A_Profile_Loader_Implementation_Instruction.md`
- `docs/AI/15_Gemini_Milestone5B_Phase2A_Profile_Loader_Implementation_Report.md`
- `docs/AI/16_Milestone5B_Phase2A_Review_Context.json`
- `docs/AI/18_Gemini_Milestone5B_Phase2A_Quality_Fix_Report.md`
- `docs/AI/19_Copilot_Milestone5B_Phase2A_PreCommit_Review_Task_v3.json`

ファイル名が実際のリポジトリと異なる場合は、内容が一致する正本を確認してください。推測で代替してはいけません。

---

## 4. 作業開始前の確認

以下を実行し、最新の状態を取得してください。

```bash
git status --short
git diff --stat
git diff --name-only
git diff --check
```

続いて、Phase 2-A対象差分を確認してください。

```bash
git diff -- src/profiles/registry/profile-loader.ts
git diff -- src/profiles/tests/profile-loader.test.ts
git diff -- src/profiles/index.ts
git diff -- src/profiles/registry/profile-registry.ts
git diff -- src/profiles/registry/version-registry.ts
git diff -- src/profiles/types/form-profile.ts
```

実際の変更ファイル一覧に応じて対象を調整してください。

Review Context、Quality Fix Report、実際のGit差分が一致しない場合は停止してください。

---

## 5. 必須検証の再確認

以下を再実行してください。

### 5.1 changed-files lint

実際に変更された対象ファイルだけを指定してください。

```bash
npx eslint src/profiles/registry/profile-loader.ts src/profiles/tests/profile-loader.test.ts src/profiles/index.ts src/profiles/registry/profile-registry.ts src/profiles/registry/version-registry.ts src/profiles/types/form-profile.ts
```

### 5.2 Phase 2-Aテスト

```bash
npx tsx --test src/profiles/tests/profile-loader.test.ts
```

### 5.3 build

```bash
npm run build
```

### 5.4 AI検証

```bash
npm run ai:verify
```

### 5.5 whitespace検証

```bash
git diff --check
```

実行していない検証を成功扱いしてはいけません。

---

## 6. Bundle設計原則

作成するJSONは、Copilotがこの1ファイルだけを読んでレビューできる内容にしてください。

### 必須原則

- 別ファイルの参照を要求しない
- リポジトリ直接参照を前提にしない
- Gitコマンド実行を前提にしない
- 必要な情報はすべてJSON内へ埋め込む
- 検証結果はEvidence付きで記録する
- 巨大なdiff全文は埋め込まず、レビューに必要な重要差分だけを含める
- 重要差分は元コードと変更後コードの両方が分かる形式にする
- 自己申告と証拠を分離する
- Copilotが不足入力を理由に停止しない構造にする

---

## 7. 必須JSON構造

以下のトップレベル構造を必ず使用してください。

```json
{
  "metadata": {},
  "reviewTask": {},
  "projectContext": {},
  "scope": {},
  "sourceDocumentsSummary": {},
  "changedFiles": [],
  "implementationSummary": {},
  "importantDiffs": [],
  "tests": {},
  "verification": {},
  "lint": {},
  "backwardCompatibility": {},
  "knownConstraints": [],
  "unresolvedIssues": [],
  "stopCondition": {},
  "commitReadiness": {},
  "phase2BReadiness": {},
  "evidence": [],
  "reviewRules": [],
  "decisionRules": {},
  "requiredOutputSchema": {}
}
```

---

## 8. 各セクションの必須内容

### 8.1 metadata

以下を含めてください。

- taskId
- milestone
- phase
- bundleVersion
- generatedBy
- generatedAt
- repositoryState
- sourceCommit
- language
- selfContained

`selfContained` は `true` としてください。

### 8.2 reviewTask

以下を含めてください。

- reviewObjective
- reviewer
- mode
- prohibitedActions
- reviewAreas
- finalInstruction

`finalInstruction`には、以下の趣旨を明示してください。

- このJSONだけを根拠にレビューする
- 外部ファイルを要求しない
- コードを変更しない
- JSONのみで結果を返す

### 8.3 projectContext

Phase 2-Aの背景、目的、Loaderの責務、Phase 2-Bとの境界を簡潔に記載してください。

### 8.4 scope

以下を含めてください。

- included
- excluded
- stopConditions
- completionConditions

### 8.5 sourceDocumentsSummary

各参照文書について以下を要約してください。

- path
- purpose
- relevantRequirements
- relevantProhibitions

Copilotに元文書を要求しないでください。

### 8.6 changedFiles

各変更ファイルについて以下を記載してください。

- path
- changeType
- purpose
- scopeStatus
- summary
- riskLevel

### 8.7 implementationSummary

以下を含めてください。

- Loaderの責務
- 参照検証
- Registry統合
- Version Registry整合
- 型・Schema変更
- 公開API
- Resolverとの境界
- 後方互換性

### 8.8 importantDiffs

各重要差分について以下を含めてください。

- file
- area
- before
- after
- rationale
- expectedBehavior
- reviewRisk

巨大なファイル全文は入れないでください。

ただし、Copilotがロジックを判断できるだけの前後コードを含めてください。

### 8.9 tests

以下を含めてください。

- testFile
- cases
- assertions
- expectedCoverage
- result
- exitCode
- relevantOutput

### 8.10 verification

以下を含めてください。

- build
- aiVerify
- diffCheck
- gitStatus
- diffStat

各項目に以下を含めてください。

- command
- executedAt
- exitCode
- result
- relevantOutput

### 8.11 lint

以下を含めてください。

- command
- targetFiles
- executedAt
- exitCode
- result
- newErrors
- newWarnings
- existingIssuesExcluded
- relevantOutput

### 8.12 backwardCompatibility

以下を含めてください。

- publicApiChanged
- schemaBreakingChange
- registryCompatibility
- existingProfileCompatibility
- conclusion
- evidence

### 8.13 knownConstraints / unresolvedIssues

空の場合も必ず空配列を保持してください。

### 8.14 stopCondition

以下を含めてください。

- triggered
- applicableConditions
- conclusion
- evidence

### 8.15 commitReadiness

以下を含めてください。

- status
- rationale
- conditions
- blockers
- majors

### 8.16 phase2BReadiness

以下を含めてください。

- status
- rationale
- conditions

### 8.17 evidence

各Evidenceに以下を含めてください。

- id
- command
- executedAt
- exitCode
- result
- relevantOutput
- affectedFiles
- supports

### 8.18 reviewRules

最低限、以下を明示してください。

- JSON内の情報のみを使用
- 外部ファイルを要求しない
- 推測しない
- コード変更しない
- Commitしない
- Pushしない
- PR作成しない
- Findingsには根拠を付ける
- 自己申告とEvidenceが矛盾する場合はEvidenceを優先
- Evidence不足がある場合は該当項目のみNOT_VERIFIABLEとし、Bundle全体をINPUT_MISSINGにしない

### 8.19 decisionRules

Commit APPROVE条件：

- BLOCKER 0
- MAJOR 0
- 必須テスト成功
- build成功
- ai:verify成功
- changed-files lint成功
- git diff --check成功
- Scope内
- 重大な後方互換性問題なし
- Stop Condition非該当

Phase 2-B READY条件：

- Commit APPROVE
- Loader責務完了
- Resolver責務の先行実装なし
- 未解決BLOCKER/MAJORなし

### 8.20 requiredOutputSchema

Copilotの出力を以下のJSON構造に固定してください。

```json
{
  "metadata": {},
  "bundleAssessment": {
    "status": "COMPLETE | PARTIALLY_VERIFIABLE",
    "selfContained": true,
    "consistency": "CONSISTENT | INCONSISTENT"
  },
  "reviewSummary": "",
  "findings": [
    {
      "id": "",
      "severity": "BLOCKER | MAJOR | MINOR | SUGGESTION | NO_ISSUE",
      "area": "",
      "file": "",
      "title": "",
      "evidence": "",
      "impact": "",
      "recommendation": ""
    }
  ],
  "counts": {
    "blocker": 0,
    "major": 0,
    "minor": 0,
    "suggestion": 0
  },
  "verificationAssessment": {
    "tests": "PASS | FAIL | NOT_VERIFIABLE",
    "build": "PASS | FAIL | NOT_VERIFIABLE",
    "aiVerify": "PASS | FAIL | NOT_VERIFIABLE",
    "changedFilesLint": "PASS | FAIL | NOT_VERIFIABLE",
    "diffCheck": "PASS | FAIL | NOT_VERIFIABLE"
  },
  "commitDecision": {
    "status": "APPROVE | REJECT",
    "reason": "",
    "conditions": []
  },
  "phase2BDecision": {
    "status": "READY | NOT_READY | CONDITIONAL",
    "reason": "",
    "conditions": []
  },
  "nextAction": []
}
```

---

## 9. 重要差分の抽出基準

`importantDiffs`には最低限以下を含めてください。

- Profile Loader本体の主要ロジック
- 参照解決または参照検証
- Registry連携箇所
- Version Registry連携箇所
- 型・Schemaに影響する変更
- 公開export変更
- テストで追加された主要ケース
- `any`解消に関する差分

Copilotがロジックを判断できないほど短い要約は禁止です。

一方で、無関係な整形差分や全文貼付も禁止です。

---

## 10. 禁止事項

- ソースコード変更
- テストコード変更
- 仕様変更
- Phase 2-B着手
- 無関係なリファクタリング
- Commit
- Push
- PR作成
- stage
- 外部ファイル参照をCopilotへ要求
- リポジトリ参照をCopilotへ要求
- 不足資料をCopilotへ再要求させる構造
- 実行していない検証を成功扱い
- Evidenceの捏造
- 巨大diff全文の無制限埋め込み
- 機密情報、認証情報、環境変数、秘密鍵の埋め込み

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

---

## 11. セキュリティ確認

Bundle作成前に、以下が差分や出力へ含まれていないことを確認してください。

- APIキー
- アクセストークン
- パスワード
- Cookie
- 秘密鍵
- 個人情報
- 本番環境固有情報
- 内部URL
- 不要な絶対パス

検出した場合はBundleへ含めず、直ちに停止してください。

---

## 12. 完了条件

以下をすべて満たした場合のみ完了としてください。

- 自己完結型JSONを作成
- `selfContained: true`
- 別ファイル参照要求なし
- 必須セクション充足
- 重要差分を十分に収録
- Evidence充足
- 最新検証結果を反映
- Review Contextと実差分が整合
- 機密情報なし
- JSON構文が有効
- Copilot出力スキーマ内包
- コード変更なし
- Commit未実施
- Push未実施

---

## 13. JSON構文検証

作成後、少なくとも以下の方法でJSON構文を検証してください。

```bash
node -e "JSON.parse(require('fs').readFileSync('docs/AI/20_Milestone5B_Phase2A_Copilot_Review_Bundle.json','utf8')); console.log('VALID_JSON')"
```

exit codeとstdoutをEvidenceに記録してください。

---

## 14. 停止条件

以下に該当した場合は停止してください。

- 必須参照文書不足
- Review Contextと実差分の不一致
- 必須検証失敗
- Scope外変更検出
- 機密情報検出
- 重要差分を正確に抽出できない
- JSONサイズが過大でCopilotへ投入困難
- 正確なEvidenceを記録できない
- Bundleの自己完結性を保証できない

停止時は以下を報告してください。

- 停止理由
- 不足情報
- 関連ファイル
- 関連コマンド
- exit code
- 重要stdout
- 必要な人間判断
- 推奨対応

---

## 15. 実装報告書

以下へ報告書を作成してください。

`docs/AI/20_Gemini_Milestone5B_Phase2A_Copilot_Review_Bundle_Report.md`

必須項目：

1. 作業目的
2. 出力ファイル
3. Bundle構造
4. 収録した参照文書要約
5. 収録した変更ファイル
6. 重要差分一覧
7. 検証結果
8. Evidence一覧
9. 自己完結性確認
10. セキュリティ確認
11. JSON構文検証
12. Scope外変更有無
13. Stop Condition判定
14. Commit可否
15. Phase 2-B開始可否
16. Commit未実施確認
17. Push未実施確認

---

## 16. ユーザー向け完了報告

以下の形式で簡潔に報告してください。

- 自己完結型Bundle：作成済／停止
- 出力先
- selfContained：true／false
- 必須セクション：充足／不足
- 重要差分：収録済／不足
- Evidence：充足／不足
- JSON構文：有効／無効
- セキュリティ問題：有／無
- Review Context整合性：一致／不一致
- Scope外変更：有／無
- Stop Condition：該当／非該当
- Copilotレビュー実行可否：可／不可
- Commit可否：可／不可／不明
- Phase 2-B開始可否：可／不可／条件付き／不明
- Commit：未実施
- Push：未実施
