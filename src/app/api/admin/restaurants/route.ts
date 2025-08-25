import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const restaurants = await prisma.restaurant.findMany();
    return NextResponse.json(restaurants, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch restaurants:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { restaurantName } = await request.json();

    if (!restaurantName) {
      return NextResponse.json({ message: 'Restaurant name is required' }, { status: 400 });
    }

    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { name: restaurantName },
    });

    if (existingRestaurant) {
      return NextResponse.json({ message: 'Restaurant already exists' }, { status: 409 });
    }

    const newRestaurant = await prisma.restaurant.create({
      data: {
        name: restaurantName,
      },
    });

    return NextResponse.json({
      message: 'Restaurant created successfully',
      restaurant: newRestaurant,
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create restaurant:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}