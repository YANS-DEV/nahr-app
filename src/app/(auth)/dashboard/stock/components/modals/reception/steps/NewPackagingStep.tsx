'use client';

import { useState, useCallback, useEffect } from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { Product } from '@prisma/client';
import ProductSearchInput from '@/app/(auth)/dashboard/stock/components/ProductSearchInput';
import { formatUnits } from '@/utils/formatUnits';

interface NewPackagingStepProps {
    data: { name: string; quantity: number; ean: string };
    onDataChange: (data: any) => void;
    quantityReceived: number;
    onQuantityChange: (quantity: number) => void;
    onConfirm: (e: React.FormEvent, selectedProductId: string) => void;
    onError: (message: string) => void;
    restaurantId: string;
}

export default function NewPackagingStep({ data, onDataChange, quantityReceived, onQuantityChange, onConfirm, onError, restaurantId }: NewPackagingStepProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const handleConfirmSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) {
            onError('Veuillez sélectionner un produit.');
            return;
        }
        onConfirm(e, selectedProduct.id);
    };

    return (
        <form onSubmit={handleConfirmSubmit} className="space-y-4">
            <div className="flex items-center mb-4 text-red-400">
                <XCircleIcon className="h-6 w-6 mr-2" />
                <h3 className="text-xl font-bold">Nouveau produit</h3>
            </div>
            <p className="text-gray-300 mb-4">Ce code EAN n'est pas reconnu. Veuillez l'associer à un produit existant.</p>

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nom du conditionnement</label>
                <input
                    type="text"
                    id="name"
                    value={data.name}
                    onChange={(e) => onDataChange({ ...data, name: e.target.value })}
                    placeholder="Ex: Paquet de lait 1L"
                    required
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
                />
            </div>
            <ProductSearchInput
                restaurantId={restaurantId}
                initialProduct={null}
                onProductSelect={setSelectedProduct}
                onError={onError}
            />
            <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">Quantité de produit contenue</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                        type="number"
                        id="quantity"
                        value={data.quantity}
                        onChange={(e) => onDataChange({ ...data, quantity: Number(e.target.value) })}
                        min="0"
                        required
                        className="block w-full pr-12 pl-2 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        disabled={!selectedProduct}
                    />
                    {selectedProduct && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 sm:text-sm">
                                {selectedProduct.unitOfMeasure}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <div>
                <label htmlFor="quantityReceived" className="block text-sm font-medium text-gray-300">Nombre d'unités reçues</label>
                <input
                    type="number"
                    id="quantityReceived"
                    value={quantityReceived}
                    onChange={(e) => onQuantityChange(Number(e.target.value))}
                    min="1"
                    required
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
                />
            </div>
            <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" disabled={!selectedProduct}>
                    Enregistrer et confirmer
            </button>
        </form>
    );
}