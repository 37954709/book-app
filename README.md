# Book App - 本管理アプリ

所持本・未読本・読書中・読了本を管理し、メモ/感想/評価/読了日を記録できる本管理アプリケーションです。
欲しい本（ウィッシュリスト）の管理もできます。

## 機能

- 本のCRUD（登録/編集/削除）
- 読書状態管理（未読/読書中/読了/欲しい）
- 表紙画像表示（ISBN自動取得 or 手動アップロード）
- タグ管理
- 検索・フィルタ・ソート
- ダッシュボード（統計情報）
- データのインポート/エクスポート（JSON）

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **バックエンド**: Next.js Route Handlers
- **データベース**: SQLite (Prisma ORM)
- **画像**: Open Library Covers API / ローカルアップロード

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. データベースの初期化

```bash
npx prisma migrate dev
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## その他のコマンド

```bash
# Prisma Studio（DBの直接閲覧・編集）
npm run db:studio

# シードデータの投入
npm run db:seed

# 本番ビルド
npm run build
npm run start
```

## ディレクトリ構成

```
book-app/
├── prisma/
│   ├── schema.prisma    # データベーススキーマ
│   └── seed.ts          # シードデータ
├── public/
│   └── uploads/         # アップロード画像保存先
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── api/         # API Routes
│   │   ├── books/       # 本の詳細・編集ページ
│   │   ├── dashboard/   # ダッシュボード
│   │   └── page.tsx     # 一覧ページ
│   ├── components/      # Reactコンポーネント
│   ├── lib/             # ユーティリティ
│   └── types/           # 型定義
└── package.json
```

## API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | /api/books | 本の一覧取得（検索・フィルタ対応） |
| POST | /api/books | 本の登録 |
| GET | /api/books/:id | 本の詳細取得 |
| PUT | /api/books/:id | 本の更新 |
| DELETE | /api/books/:id | 本の削除 |
| POST | /api/upload | 画像アップロード |
| GET | /api/tags | タグ一覧取得 |
| GET | /api/stats | 統計情報取得 |
| GET | /api/export | データエクスポート |
| POST | /api/import | データインポート |

## ライセンス

MIT
