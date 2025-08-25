import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { recipeId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'chief') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { recipeId } = await params;
  const { name, description, ingredients } = await request.json();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.recipe.update({
        where: { id: recipeId },
        data: {
          name,
          description,
        },
      });

      await tx.recipeIngredient.deleteMany({
        where: { recipeId: recipeId },
      });

      const ingredientsToCreate = ingredients.map((ing: any) => ({
        quantity: ing.quantity,
        productId: ing.productId,
        recipeId: recipeId,
      }));

      await tx.recipeIngredient.createMany({
        data: ingredientsToCreate,
      });
    });

    return NextResponse.json({ message: 'Recette mise à jour avec succès' }, { status: 200 });
  } catch (error) {
    console.error('Échec de la mise à jour de la recette :', error);
    return NextResponse.json({ message: 'Une erreur est survenue lors de la mise à jour de la recette' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { recipeId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'chief') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { recipeId } = await params;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.recipeIngredient.deleteMany({
        where: { recipeId },
      });
      
      await tx.recipe.delete({
        where: { id: recipeId },
      });
    });

    return NextResponse.json({ message: 'Recette supprimée avec succès' }, { status: 200 });
  } catch (error) {
    console.error('Échec de la suppression de la recette :', error);
    return NextResponse.json({ message: 'Une erreur est survenue lors de la suppression de la recette' }, { status: 500 });
  }
}