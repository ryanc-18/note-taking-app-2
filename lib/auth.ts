import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

export async function getDbUser() {
  const { userId } = await auth()
  if (!userId) return null

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (existing) return existing

  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null

  return prisma.user.upsert({
    where: { email },
    update: { clerkId: userId, name },
    create: { clerkId: userId, email, name },
  })
}
