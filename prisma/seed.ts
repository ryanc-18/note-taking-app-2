import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: 'postgresql://chinny18@localhost:5432/notetaking' })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Create a dev user
  const user = await prisma.user.upsert({
    where: { email: 'dev@local.com' },
    update: {},
    create: {
      email: 'dev@local.com',
      name: 'Ryan Chin',
    },
  })

  console.log('Dev user created:', user)

  // Create some starter folders
  const personalFolder = await prisma.folder.upsert({
    where: { id: 'f-personal' },
    update: {},
    create: {
      id: 'f-personal',
      name: 'Personal',
      userId: user.id,
    },
  })

  const workFolder = await prisma.folder.upsert({
    where: { id: 'f-work' },
    update: {},
    create: {
      id: 'f-work',
      name: 'Work',
      userId: user.id,
    },
  })

  // Create a starter note
  await prisma.note.upsert({
    where: { id: 'n-getting-started' },
    update: {},
    create: {
      id: 'n-getting-started',
      title: 'Getting Started',
      content: '# Getting Started\n\nWelcome to your workspace.',
      userId: user.id,
      folderId: personalFolder.id,
    },
  })

  console.log('Seed complete.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
