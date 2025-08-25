import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'chief') {
    return NextResponse.json({ message: 'Accès non autorisé' }, { status: 403 });
  }

  try {
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { restaurantId: session.user.restaurantId },
          { restaurantId: null },
        ],
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return NextResponse.json({ message: 'Une erreur est survenue lors de la récupération des catégories.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'chief') {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 403 });
  }

  try {
    const { name, type } = await request.json();

    if (!name || !type) {
      return NextResponse.json({ message: 'Nom et type de catégorie sont requis.' }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        type,
        restaurant: { connect: { id: session.user.restaurantId } },
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    return NextResponse.json({ message: 'Échec de la création de la catégorie.' }, { status: 500 });
  }
}