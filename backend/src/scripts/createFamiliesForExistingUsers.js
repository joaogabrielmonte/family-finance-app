import prisma from '../prismaClient.js';

async function assignFamiliesToExistingUsers() {
  const usersWithoutFamily = await prisma.user.findMany({
    where: { familyId: null },
  });

  for (const user of usersWithoutFamily) {
    const family = await prisma.family.create({
      data: {
        name: `${user.name.split(' ')[0]} Family`,
        ownerId: user.id,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { familyId: family.id },
    });

    await prisma.familyMember.create({
      data: {
        familyId: family.id,
        userId: user.id,
        name: user.name,
        role: 'owner',
      },
    });

    console.log(`✅ Família criada para ${user.name}`);
  }

  console.log('Concluído.');
}

assignFamiliesToExistingUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
