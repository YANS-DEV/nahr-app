import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface BatchItemData {
  recipeId: string;
  quantity: number;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user?.role !== 'chief' && session.user?.role !== 'staff')) {
      return new NextResponse('Accès non autorisé', { status: 403 });
    }

    const { recipes } = await request.json();

    if (!recipes || !Array.isArray(recipes)) {
      return new NextResponse('Données de recettes invalides', { status: 400 });
    }

    const restaurantId = session.user.restaurantId;
    const userId = session.user.id;

    if (!restaurantId || !userId) {
      return new NextResponse('Informations utilisateur/restaurant non trouvées dans la session.', { status: 400 });
    }

    const allstockItems = await prisma.stock.findMany({
      where: { restaurantId },
      include: { product: true },
    });

    const ingredientsToDeduct: { [productId: string]: number } = {};
    const batchItemsToCreate: BatchItemData[] = [];

    for (const recipe of recipes) {
      const { recipeId, quantity } = recipe;
      if (quantity <= 0) continue;

      const fullRecipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
        include: { ingredients: true },
      });

      if (!fullRecipe) {
        console.error(`Recette non trouvée : ${recipeId}`);
        continue;
      }

      batchItemsToCreate.push({
        recipeId: fullRecipe.id,
        quantity: quantity,
      });

      for (const ingredientItem of fullRecipe.ingredients) {
        const productId = ingredientItem.productId;
        const totalQuantity = ingredientItem.quantity * quantity;

        if (!ingredientsToDeduct[productId]) {
          ingredientsToDeduct[productId] = 0;
        }
        ingredientsToDeduct[productId] += totalQuantity;
      }
    }

    for (const productId in ingredientsToDeduct) {
      const needed = ingredientsToDeduct[productId];
      const stockItem = allstockItems.find(item => item.productId === productId);

      if (!stockItem) {
        return new NextResponse(`Le produit avec l'ID ${productId} n'est pas dans l'inventaire.`, { status: 404 });
      }

      if (stockItem.quantity < needed) {
        return new NextResponse(`Stock insuffisant pour le produit : ${stockItem.product.name}. Nécessaire : ${needed}, En stock : ${stockItem.quantity}`, { status: 400 });
      }
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const newBatch = await tx.batch.create({
        data: {
          userId,
          restaurantId,
          batchItems: {
            create: batchItemsToCreate,
          },
        },
      });

      const stockUpdates = Object.entries(ingredientsToDeduct).map(([productId, quantity]) =>
        tx.stock.update({
          where: { productId },
          data: {
            quantity: {
              decrement: quantity,
            },
          },
        })
      );

      await Promise.all(stockUpdates);

      return newBatch;
    });

    return new NextResponse(JSON.stringify({ message: 'Fournée lancée avec succès et stock mis à jour !', batch: transaction }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur lors du lancement de la fournée :', error);
    return new NextResponse('Erreur interne du serveur.', { status: 500 });
  }
}