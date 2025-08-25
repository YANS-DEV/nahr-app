// src/app/api/products/global/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 403 });
  }

  try {
    const globalProducts = await prisma.product.findMany({
      where: {
        restaurantId: null,
      },
      include: {
        category: true,
      },
    });
    return NextResponse.json(globalProducts, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits globaux:', error);
    return NextResponse.json({ message: 'Échec de la récupération des produits globaux.' }, { status: 500 });
  }
}