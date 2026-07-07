# Practice Assistant V2

---

## 概要

- 社労士向け業務支援AIプラットフォーム
- AIを安全に活用するための業務フロー管理
- AIは補助、人間が最終判断する設計

---

## 主な機能

- ダッシュボード
- 案件管理
- 業務フロー管理
- AIヒアリング整理
- AIタスクガイド
- Evidence管理
- Human Review
- 補助金業務フロー
- スマホ対応

---

## システム構成

```mermaid
flowchart TD
    User([User / Client]) --> NextJS[Next.js App Router]
    NextJS --> React[React Components]
    React <--> LocalStorage[(localStorage)]
```

> **重要**: バックエンドなし、DBなし、認証なし、AI API連携なしの構成です。データはすべて `localStorage` を利用するデモ用途の設計となっています。

---

## 技術スタック

- Next.js
- React
- TypeScript
- Tailwind CSS
- localStorage
- Vercel
- GitHub

---

## ディレクトリ構成

```text
src/
├── app/
├── components/
│   ├── ui/
│   └── features/
├── hooks/
├── types/
└── config/
```

---

## 共通コンポーネント

| コンポーネント | 役割 |
| --- | --- |
| `CompletionActionArea` | 工程の完了ボタン・一時保存と進捗ステータスを管理 |
| `StatusBadge` | 確認・修正・却下などのステータスをアイコン付きで統一表示 |
| `Chip` | 優先度や状態などを柔軟な色・サイズで表示する汎用バッジ |
| `Button` | 画面全体で共通のプライマリ・セカンダリボタンスタイルを提供 |
| `HumanApprovalBadge` | 担当者や専門家による承認ステータスの表示・切り替え |

---

## 開発で重視した点

- AIを過信しない設計
- Evidence管理
- Human Review
- Presentational Component
- 責務分離
- 共通コンポーネント化
- スマホ対応
- 自動スクロール

---

## セットアップ

```bash
npm install
npm run dev
npm run build
```

---

## デモ

Vercel限定公開で動作確認済み

---

## 今後予定している改善

- 各画面のUI・UXのさらなるブラッシュアップ
- クラウドデータベースとの接続（本番運用向け）
- ユーザー認証および権限管理の導入
