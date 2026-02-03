import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

// POST /api/upload - 画像アップロード（Supabase Storage）
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // ファイルタイプのチェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '許可されていないファイル形式です。JPEG, PNG, GIF, WebPのみアップロードできます。' },
        { status: 400 }
      )
    }

    // ファイルサイズのチェック（5MB以下）
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'ファイルサイズが大きすぎます。5MB以下のファイルをアップロードしてください。' },
        { status: 400 }
      )
    }

    // ファイル名の生成（ユーザーID/タイムスタンプ-ランダム文字列.拡張子）
    const ext = file.name.split('.').pop() || 'jpg'
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const filename = `${user.id}/${timestamp}-${random}.${ext}`

    // ファイルをバッファに変換
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from('book-covers')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Supabase Storage error:', error)
      return NextResponse.json(
        { error: 'ファイルのアップロードに失敗しました' },
        { status: 500 }
      )
    }

    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from('book-covers')
      .getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      path: urlData.publicUrl,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
