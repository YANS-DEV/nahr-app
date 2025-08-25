import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    const { name, ean, quantity, productId } = await request.json();
    
    try {
        const updatedPackaging = await prisma.productPackaging.update({
            where: { id },
            data: {
                name,
                ean,
                quantity,
                productId,
            },
        });
        return NextResponse.json(updatedPackaging);
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: "Échec de la mise à jour du conditionnement." }), { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    
    try {
        await prisma.productPackaging.delete({
            where: { id },
        });
        return new NextResponse(null, { status: 204 });
    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return new NextResponse(JSON.stringify({ message: 'Conditionnement non trouvé.' }), {
                    status: 404,
                });
            }
        }
        
        if (error instanceof Error) {
            return new NextResponse(JSON.stringify({ message: error.message }), {
                status: 500,
            });
        }
        
        return new NextResponse(JSON.stringify({ message: 'Une erreur interne est survenue.' }), {
            status: 500,
        });
    }
}