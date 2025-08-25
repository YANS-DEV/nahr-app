import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        users: {
          where: {
            OR: [
              { restaurantId: { not: null } },
              { role: 'staff' }
            ],
            NOT: {
              role: 'admin'
            }
          },
        },
      },
    });

    return NextResponse.json(restaurants, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch restaurants and users:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email, password, role, restaurantId } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    if ((role === 'chief' || role === 'staff') && !restaurantId) {
      return NextResponse.json({ message: 'Restaurant ID is required for a chief or staff' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        restaurantId: (role === 'chief' || role === 'staff') ? restaurantId : null,
      },
    });

    return NextResponse.json({
      message: 'User registered successfully',
      user: newUser,
    }, { status: 201 });

  } catch (error) {
    console.error('User registration failed:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}