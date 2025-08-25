import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('q');
    const restaurantId = searchParams.get('restaurantId');

    if (!searchTerm || searchTerm.length < 2) {
        return NextResponse.json({ products: [] });
    }

    if (!restaurantId) {
        return NextResponse.json({ error: 'Restaurant ID is required.' }, { status: 400 });
    }

    try {
        const products = await prisma.product.findMany({
            where: {
                name: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
                OR: [
                    { restaurantId: null },
                    { restaurantId: restaurantId }
                ]
            },
            take: 10, 
        });

        const uniqueProducts = [];
        const seenNames = new Set();

        for (const product of products) {
            if (!seenNames.has(product.name.toLowerCase())) {
                uniqueProducts.push(product);
                seenNames.add(product.name.toLowerCase());
            }
        }

        return NextResponse.json({ products: uniqueProducts });
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return NextResponse.json({ error: 'Failed to fetch products.' }, { status: 500 });
    }
}