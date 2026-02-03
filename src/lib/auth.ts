import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Profileがなければ作成
  let profile = await prisma.profile.findUnique({
    where: { id: user.id },
  })

  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.email?.split('@')[0],
        avatarUrl: user.user_metadata?.avatar_url,
      },
    })
  }

  return {
    id: user.id,
    email: user.email!,
    name: profile.name,
    avatarUrl: profile.avatarUrl,
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}
