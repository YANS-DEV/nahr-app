import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const ean = searchParams.get('ean');

    if (!ean) {
      return new NextResponse(JSON.stringify({ error: 'EAN is required' }), { status: 400 });
    }

    const productPackaging = await prisma.productPackaging.findUnique({
      where: { ean },
      include: { product: true },
    });

    if (!productPackaging) {
      return new NextResponse(JSON.stringify({ error: 'Product packaging not found' }), { status: 404 });
    }

    return NextResponse.json(productPackaging);
  } catch (error) {
    console.error('Error fetching product packaging:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}