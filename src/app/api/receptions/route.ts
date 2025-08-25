import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'chief') {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await req.json();
    const { type, data } = body;

    const { restaurantId } = data;
    
    const newInventory = await prisma.inventory.create({
      data: {
        restaurantId: restaurantId,
      },
    });

    if (type === 'existing') {
      const { productPackagingId, quantityReceived } = data;

      const productPackaging = await prisma.productPackaging.findUnique({
        where: { id: productPackagingId },
        include: { product: true },
      });

      if (!productPackaging) {
        return new NextResponse(JSON.stringify({ error: 'Product packaging not found' }), { status: 404 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.receptionLog.create({
          data: {
            productPackagingId,
            quantityReceived,
            restaurantId,
            inventoryId: newInventory.id,
          },
        });

        await tx.stock.upsert({
          where: { productId: productPackaging.productId },
          update: {
            quantity: {
              increment: productPackaging.quantity * quantityReceived,
            },
          },
          create: {
            productId: productPackaging.productId,
            quantity: productPackaging.quantity * quantityReceived,
            restaurantId,
          },
        });
      });

    } else if (type === 'new') {
      const { name, ean, quantity, productId, quantityReceived } = data;

      await prisma.$transaction(async (tx) => {
        const newPackaging = await tx.productPackaging.create({
          data: {
            name,
            ean,
            quantity,
            productId,
          },
        });

        await tx.receptionLog.create({
          data: {
            productPackagingId: newPackaging.id,
            quantityReceived,
            restaurantId,
            inventoryId: newInventory.id,
          },
        });

        await tx.stock.upsert({
          where: { productId },
          update: {
            quantity: {
              increment: quantity * quantityReceived,
            },
          },
          create: {
            productId,
            quantity: quantity * quantityReceived,
            restaurantId,
          },
        });
      });
    } else {
      return new NextResponse(JSON.stringify({ error: 'Invalid reception type' }), { status: 400 });
    }

    return NextResponse.json({ message: 'Reception recorded successfully' });
  } catch (error) {
    console.error('Error recording reception:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}