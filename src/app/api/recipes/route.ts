import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'chief') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { name, description } = await request.json();

    const newRecipe = await prisma.recipe.create({
      data: {
        name,
        description,
        restaurant: { connect: { id: session.user.restaurantId } },
      },
    });

    return NextResponse.json(newRecipe, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la recette:', error);
    return NextResponse.json({ message: 'Échec de la création de la recette' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'chief') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const chiefId = session.user.restaurantId;

  try {
    const recipes = await prisma.recipe.findMany({
      where: {
        restaurantId: chiefId,
      },
      include: {
        ingredients: {
          include: {
            product: true,
          },
        },
      },
    });
    return NextResponse.json(recipes, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch recipes:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}