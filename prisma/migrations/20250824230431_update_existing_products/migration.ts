// prisma/migrations/[timestamp]/migration.ts (ou un fichier de script séparé)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Créez une catégorie par défaut s'il n'en existe pas déjà
  const defaultCategory = await prisma.category.upsert({
    where: { name_restaurantId_type: { name: 'Général', restaurantId: null, type: 'food' } },
    update: {},
    create: { name: 'Général', type: 'food' },
  });

  // Mettez à jour tous les produits existants pour leur attribuer la catégorie par défaut
  await prisma.product.updateMany({
    where: { categoryId: null },
    data: { categoryId: defaultCategory.id },
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });