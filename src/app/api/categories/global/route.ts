// src/app/api/categories/global/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'chief') {
    return NextResponse.json({ message: 'Accès non autorisé' }, { status: 403 });
  }

  try {
    const globalCategories = await prisma.category.findMany({
      where: {
        restaurantId: null,
      },
    });

    return NextResponse.json(globalCategories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories globales:', error);
    return NextResponse.json({ message: 'Une erreur est survenue lors de la récupération des catégories globales.' }, { status: 500 });
  }
}