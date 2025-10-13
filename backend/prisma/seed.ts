import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create a test user profile (references Supabase Auth user)
  const user = await prisma.userProfile.upsert({
    where: { email: 'admin@wongsa.com' },
    update: {},
    create: {
      email: 'admin@wongsa.com',
      password: '$2b$10$rQZ8K9XvY7wE8tN5sP6kCOQZ8K9XvY7wE8tN5sP6kCOQZ8K9XvY7wE8tN5sP6kCO', // Hashed password for 'password123'
      firstName: 'Admin',
      lastName: 'User',
      avatarUrl: 'https://via.placeholder.com/150',
    },
  })

  console.log('✅ Created user profile:', user.email)

  // Create a test workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo-workspace' },
    update: {},
    create: {
      name: 'Demo Workspace',
      slug: 'demo-workspace',
      description: 'A demo workspace for testing',
      isActive: true,
      members: {
        create: {
          userId: user.id,
          role: 'owner',
        },
      },
    },
  })

  console.log('✅ Created workspace:', workspace.name)

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
