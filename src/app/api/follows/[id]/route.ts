import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// DELETE /api/follows/[id] - フォロー解除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const followId = parseInt(id)

    if (isNaN(followId)) {
      return NextResponse.json(
        { error: 'Invalid follow ID' },
        { status: 400 }
      )
    }

    // フォロー関係が存在し、自分のフォローであることを確認
    const follow = await prisma.follow.findUnique({
      where: { id: followId },
    })

    if (!follow) {
      return NextResponse.json(
        { error: 'Follow not found' },
        { status: 404 }
      )
    }

    if (follow.followerId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this follow' },
        { status: 403 }
      )
    }

    await prisma.follow.delete({
      where: { id: followId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting follow:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to delete follow' },
      { status: 500 }
    )
  }
}
