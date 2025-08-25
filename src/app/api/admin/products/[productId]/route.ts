import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = await params;
  const { name, unitOfMeasure } = await request.json();

  if (!name || !unitOfMeasure) {
    return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
  }

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { name, unitOfMeasure },
    });
    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = await params;

  try {
    await prisma.product.delete({
      where: { id: productId },
    });
    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}