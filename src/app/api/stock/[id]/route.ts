import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const { alertThreshold } = await req.json();

  if (isNaN(alertThreshold) || alertThreshold < 0) {
    return NextResponse.json({ message: 'Seuil d\'alerte invalide.' }, { status: 400 });
  }

  try {
    const updatedStock = await prisma.stock.update({
      where: { id: id },
      data: { alertThreshold: Number(alertThreshold) },
    });
    return NextResponse.json(updatedStock, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du seuil:', error);
    return NextResponse.json({ message: 'Erreur lors de la mise à jour.' }, { status: 500 });
  }
}