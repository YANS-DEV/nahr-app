import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: Request, 
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId } = await params;
    const { password } = await request.json();

    if (!userId) {
        return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ message: 'Password is required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Password updated successfully', user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error('Failed to update password:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request, 
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId } = await params;

    if (!userId) {
        return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'User deleted successfully', user: deletedUser }, { status: 200 });

  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}