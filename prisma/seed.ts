import { PrismaClient } from '@prisma/client';
import { Role } from '../src/common/enums/role.enum';
const prisma = new PrismaClient();

async function main() {
  const roleValues = Object.values(Role);
  for (const roleName of roleValues) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
      },
    });
  }
  console.log('Create role success');
}
main()
  .catch((e) => console.error('Error: ' + e))
  .finally(() => {
    void prisma.$disconnect();
  });
