import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'chief') {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return new NextResponse(JSON.stringify({ error: 'Restaurant ID is required' }), { status: 400 });
    }

    const stock = await prisma.stock.findMany({
      where: { restaurantId },
      include: { product: true },
    });

    return NextResponse.json(stock);
  } catch (error) {
    console.error('Error fetching stock:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}