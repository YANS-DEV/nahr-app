'use client';

import { useState, useEffect } from 'react';
import { ProductPackagingWithProduct } from '@/app/types/prisma';
import ProductSearchInput from '@/app/(auth)/dashboard/stock/components/ProductSearchInput';
import { formatUnits } from '@/utils/formatUnits';
import { Product } from '@prisma/client';

interface EditPackagingStepProps {
    packaging: ProductPackagingWithProduct;
    restaurantId: string;
    onSave: (data: any) => void;
    onError: (message: string) => void;
}

export default function EditPackagingStep({ packaging, restaurantId, onSave, onError }: EditPackagingStepProps) {
    const [name, setName] = useState(packaging.name);
    const [ean, setEan] = useState(packaging.ean || '');
    const [quantity, setQuantity] = useState(packaging.quantity);
    const [selectedProduct, setSelectedProduct] = useState(packaging.product);

    useEffect(() => {
        setName(packaging.name);
        setEan(packaging.ean || '');
        setQuantity(packaging.quantity);
        setSelectedProduct(packaging.product);
    }, [packaging]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, ean, quantity, productId: selectedProduct.id });
    };

    const handleProductSelect = (product: Product | null) => {
        if (product) {
            setSelectedProduct(product);
        } else {
            setSelectedProduct(null); // Gérer le cas où le produit est désélectionné
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nom du conditionnement</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nom du conditionnement"
                    required
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
                />
            </div>
            <div>
                <label htmlFor="ean" className="block text-sm font-medium text-gray-300">Code EAN</label>
                <input
                    type="text"
                    id="ean"
                    value={ean}
                    onChange={(e) => setEan(e.target.value)}
                    placeholder="Code EAN (optionnel)"
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
                />
            </div>
            <ProductSearchInput
                restaurantId={restaurantId}
                initialProduct={packaging.product} // L'initialProduct est toujours le produit du packaging
                onProductSelect={handleProductSelect}
                onError={onError}
            />
            <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">Quantité de produit contenue</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                        type="number"
                        id="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
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
            <div className="flex justify-end mt-6">
                <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Enregistrer les modifications
                </button>
            </div>
        </form>
    );
}