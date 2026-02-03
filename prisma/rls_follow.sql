-- Follow テーブルの RLS ポリシー
-- Supabase Dashboard の SQL Editor で実行してください

-- RLSを有効化
ALTER TABLE "Follow" ENABLE ROW LEVEL SECURITY;

-- 自分のフォロー関係は閲覧可能
CREATE POLICY "Users can view their own follows"
ON "Follow"
FOR SELECT
USING (
  auth.uid()::text = "followerId"::text OR
  auth.uid()::text = "followingId"::text
);

-- 自分がフォローする関係のみ作成可能
CREATE POLICY "Users can create their own follows"
ON "Follow"
FOR INSERT
WITH CHECK (auth.uid()::text = "followerId"::text);

-- 自分のフォロー関係のみ削除可能
CREATE POLICY "Users can delete their own follows"
ON "Follow"
FOR DELETE
USING (auth.uid()::text = "followerId"::text);

-- Profile テーブルへの追加ポリシー（既存のポリシーに追加）
-- 全てのユーザーのプロフィールを閲覧可能（ユーザー検索用）
-- ※既存のポリシーで全員閲覧可能になっていない場合は以下を実行

-- プロフィール閲覧ポリシー（存在しない場合のみ）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'Profile' AND policyname = 'Anyone can view profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view profiles" ON "Profile" FOR SELECT USING (true)';
  END IF;
END
$$;

-- Book テーブルへの追加ポリシー
-- フォローしている人の本は閲覧可能
CREATE POLICY "Users can view followed users books"
ON "Book"
FOR SELECT
USING (
  auth.uid()::text = "userId"::text
  OR EXISTS (
    SELECT 1 FROM "Follow"
    WHERE "followerId"::text = auth.uid()::text
    AND "followingId"::text = "Book"."userId"::text
  )
);

-- 注意: 既存のBookのSELECTポリシーがある場合は、
-- そのポリシーを削除してからこの新しいポリシーを作成するか、
-- または既存のポリシーを更新してください
