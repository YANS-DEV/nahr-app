// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Accès non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const restaurantId = searchParams.get('restaurantId');

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { restaurantId: restaurantId },
          { restaurantId: null },
        ],
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return NextResponse.json({ message: 'Une erreur est survenue lors de la récupération des produits' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'chief') {
    return NextResponse.json({ message: 'Accès non autorisé' }, { status: 403 });
  }

  const { name, unitOfMeasure, categoryId } = await req.json();

  if (!name || !unitOfMeasure || !categoryId) {
    return NextResponse.json({ message: 'Nom, unité de mesure et catégorie sont requis.' }, { status: 400 });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        unitOfMeasure,
        category: {
          connect: {
            id: categoryId,
          },
        },
        restaurant: {
          connect: {
            id: session.user.restaurantId,
          },
        },
      },
      include: {
        category: true,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    return NextResponse.json({ message: 'Une erreur est survenue lors de la création du produit.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'chief') {
    return NextResponse.json({ message: 'Accès non autorisé' }, { status: 403 });
  }

  const { id, name, unitOfMeasure, categoryId } = await req.json();

  if (!id) {
    return NextResponse.json({ message: 'ID du produit manquant.' }, { status: 400 });
  }
  
  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ message: 'Produit introuvable.' }, { status: 404 });
    }

    if (existingProduct.restaurantId !== session.user.restaurantId) {
      return NextResponse.json({ message: 'Vous n\'êtes pas autorisé à modifier ce produit.' }, { status: 403 });
    }
    
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        unitOfMeasure,
        categoryId,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Erreur lors de la modification du produit:', error);
    return NextResponse.json({ message: 'Une erreur est survenue lors de la modification du produit' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'chief') {
    return NextResponse.json({ message: 'Accès non autorisé' }, { status: 403 });
  }

  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ message: 'ID du produit manquant.' }, { status: 400 });
  }

  try {
    const productToDelete = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!productToDelete) {
      return NextResponse.json({ message: 'Produit introuvable.' }, { status: 404 });
    }

    if (productToDelete.restaurantId !== session.user.restaurantId) {
      return NextResponse.json({ message: 'Vous n\'êtes pas autorisé à supprimer ce produit.' }, { status: 403 });
    }

    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Produit supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    return NextResponse.json({ message: 'Une erreur est survenue lors de la suppression du produit.' }, { status: 500 });
  }
}