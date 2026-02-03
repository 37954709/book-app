# 本管理アプリ デプロイメントガイド

## 概要

このアプリはNext.js + Supabase + Prismaで構築されたPWA対応の本管理アプリです。

## 必要な環境

- Node.js 18以上
- npm または yarn
- Supabaseアカウント
- Vercelアカウント（推奨）

## 1. Supabase セットアップ

### 1.1 プロジェクト作成

1. [Supabase](https://supabase.com) にログイン
2. 「New Project」をクリック
3. プロジェクト名とデータベースパスワードを設定

### 1.2 認証設定

1. Authentication > Providers に移動
2. **Email** を有効化（確認メール送信を任意で設定）
3. **Google** を有効化する場合:
   - [Google Cloud Console](https://console.cloud.google.com) でOAuth 2.0クライアントを作成
   - 承認済みリダイレクトURI: `https://[your-project-ref].supabase.co/auth/v1/callback`
   - Client ID と Client Secret を Supabase に設定

### 1.3 Storage設定

1. Storage に移動
2. 「New Bucket」をクリック
3. 名前: `book-covers`
4. Public bucket: **有効**
5. バケットポリシーを設定:

```sql
-- アップロード許可（認証済みユーザー）
CREATE POLICY "Users can upload covers" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'book-covers' AND
  auth.role() = 'authenticated'
);

-- 読み取り許可（全員）
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'book-covers');

-- 削除許可（自分のファイルのみ）
CREATE POLICY "Users can delete own covers" ON storage.objects
FOR DELETE USING (
  bucket_id = 'book-covers' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 1.4 環境変数取得

Settings > API から以下を取得:
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Settings > Database から:
- Connection string (URI) → `DATABASE_URL`
- Direct connection → `DIRECT_URL`

## 2. ローカル開発

### 2.1 環境変数設定

`.env.local` を作成:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...

# Database (Prisma)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### 2.2 依存関係インストール

```bash
npm install
```

### 2.3 データベースマイグレーション

```bash
npx prisma generate
npx prisma db push
```

### 2.4 開発サーバー起動

```bash
npm run dev
```

## 3. Vercel デプロイ

### 3.1 プロジェクト接続

1. [Vercel](https://vercel.com) にログイン
2. 「Import Project」からGitHubリポジトリを選択
3. Framework Preset: Next.js（自動検出）

### 3.2 環境変数設定

Vercelの Settings > Environment Variables に以下を追加:

| 変数名 | 値 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `DATABASE_URL` | Supabase Connection String (Pooler) |
| `DIRECT_URL` | Supabase Direct Connection |

### 3.3 デプロイ

「Deploy」をクリック。自動的にビルド・デプロイされます。

### 3.4 本番URL設定

1. デプロイ完了後、本番URLをコピー
2. Supabase > Authentication > URL Configuration に移動
3. Site URL を本番URLに設定
4. Redirect URLs に以下を追加:
   - `https://your-app.vercel.app/**`

## 4. PWAアイコン生成

`public/icons/icon.svg` から各サイズのPNGを生成:

```bash
# ImageMagickを使用
convert public/icons/icon.svg -resize 72x72 public/icons/icon-72x72.png
convert public/icons/icon.svg -resize 96x96 public/icons/icon-96x96.png
convert public/icons/icon.svg -resize 128x128 public/icons/icon-128x128.png
convert public/icons/icon.svg -resize 144x144 public/icons/icon-144x144.png
convert public/icons/icon.svg -resize 152x152 public/icons/icon-152x152.png
convert public/icons/icon.svg -resize 192x192 public/icons/icon-192x192.png
convert public/icons/icon.svg -resize 384x384 public/icons/icon-384x384.png
convert public/icons/icon.svg -resize 512x512 public/icons/icon-512x512.png
```

または、オンラインツール（[PWA Asset Generator](https://www.pwabuilder.com/)等）を使用。

## 5. Row Level Security (RLS)

追加のセキュリティが必要な場合、SupabaseでRLSを設定:

```sql
-- Profileテーブル
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON "Profile"
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON "Profile"
FOR UPDATE USING (auth.uid() = id);

-- Bookテーブル
ALTER TABLE "Book" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own books" ON "Book"
FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own books" ON "Book"
FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own books" ON "Book"
FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own books" ON "Book"
FOR DELETE USING (auth.uid()::text = "userId");
```

## 6. トラブルシューティング

### ログインできない
- Supabaseの Site URL が正しく設定されているか確認
- Redirect URLs にVercelのURLが追加されているか確認

### 画像がアップロードできない
- Supabase Storage の `book-covers` バケットが存在するか確認
- バケットが Public に設定されているか確認
- ポリシーが正しく設定されているか確認

### データベースエラー
- `DATABASE_URL` と `DIRECT_URL` が正しいか確認
- Prisma マイグレーションを実行したか確認: `npx prisma db push`

### PWAがインストールできない
- HTTPS接続か確認（localhostは除く）
- `manifest.json` が正しく配信されているか確認
- Service Worker が登録されているか確認（開発者ツール > Application）

## 7. 更新手順

1. コード変更をコミット
2. GitHubにプッシュ
3. Vercelが自動的に再デプロイ

データベーススキーマ変更時:
```bash
npx prisma db push
```

## サポート

問題が発生した場合は、GitHubのIssueを作成してください。
