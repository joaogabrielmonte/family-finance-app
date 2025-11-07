import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando seed...");  // <- linha para debug
  await prisma.menu.create({
    data: {
      name: 'Dashboard',
      icon: 'Home',
      path: '/dashboard',
      orderIndex: 1,
    },
  });

  const adminMenu = await prisma.menu.create({
    data: {
      name: 'Administração',
      icon: 'Settings',
      orderIndex: 2,
      role: 'admin',
    },
  });

  await prisma.menu.createMany({
    data: [
      { name: 'Usuários', icon: 'Users', path: '/admin/users', parentId: adminMenu.id },
      { name: 'Configurações', icon: 'Sliders', path: '/admin/config', parentId: adminMenu.id },
    ],
  });

  console.log("✅ Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
  })
  .finally(() => prisma.$disconnect());
