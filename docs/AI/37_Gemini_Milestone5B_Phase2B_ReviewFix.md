# Gemini Milestone 5-B Phase 2-B Review Fix

## 目的

前回レビューで指摘された事項のみ修正すること。
設計変更・仕様追加・独自判断は禁止。

## 修正対象

### 1. 型定義

承認済み設計（34_Milestone5B_Phase2B_Design_Decision.md）に合わせて復元する。

-   ResolveRequest
-   ResolveResult
-   ResolveWarning
-   ResolveError
-   ExecutionContext
-   readonly
-   ProfileType
-   ResolveEvidence

### 2. resolvedCache

Profile IDだけではなく型整合性も保証すること。

### 3. Dependency失敗

依存Profileが失敗した場合、親Profileを正常終了として扱わないこと。
設計変更が必要な場合は停止し報告すること。

### 4. effectiveDate

ExecutionContextのimmutabilityを保証すること。
設計変更が必要な場合は停止し報告すること。

### 5. Adapter

実在のMappingとの互換性を厳密に確認すること。

確認対象 - template - fields - deepStrictEqual - field順序

### 6. テスト

ambiguousテストは公開APIのみ使用すること。
内部実装への直接アクセスは禁止。

## 検証

-   Tests
-   Lint
-   Build
-   ai:verify
-   git diff --check

## 禁止事項

-   git add
-   git add -N
-   Stage
-   Commit
-   Push
-   PR

## 提出物

-   git status -sb
-   git diff --stat
-   git diff --name-only
-   修正ファイル全文
-   テスト結果
-   Verification結果

## 停止条件

-   設計変更が必要
-   承認済み設計と矛盾する
-   Mapping互換性が確保できない

身勝手な推測や独断は絶対にしないでください。
承認済み設計を忠実に守ってください。
