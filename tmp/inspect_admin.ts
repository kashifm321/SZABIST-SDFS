import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Fetching latest ADMIN account details from DB...')
  
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'desc' }
  })
  
  if (!admin) {
    console.log('No ADMIN account found in the database.')
    return
  }
  
  console.log('--- Current Admin from DB ---')
  console.log(`ID: ${admin.id}`)
  console.log(`Email: ${admin.email}`)
  console.log(`Name (Raw string from DB): "${admin.name}"`)
  console.log('----------------------------')
}

main()
  .catch((e) => {
    console.error('Error fetching admin:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
