import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userRole = session.user.role;
    const userRestaurantId = session.user.restaurantId;

    let products;
    if (userRole === 'admin') {
      products = await prisma.product.findMany();
    } else if (userRole === 'chief' || userRole === 'staff') {
      products = await prisma.product.findMany({
        where: {
          OR: [
            { restaurantId: null },
            { restaurantId: userRestaurantId },
          ],
        },
      });
    } else {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, unitOfMeasure, restaurantId } = await request.json();

    if (!name || !unitOfMeasure) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const whereClause: any = { name };
    if (restaurantId) {
      whereClause.restaurantId = restaurantId;
    } else {
      whereClause.restaurantId = null;
    }

    const existingProduct = await prisma.product.findFirst({
      where: whereClause,
    });
    
    if (existingProduct) {
      return NextResponse.json({ message: 'Product with this name already exists' }, { status: 409 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        unitOfMeasure,
        restaurantId: restaurantId || null,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });

  } catch (error) {
    console.error('Failed to create new product:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}