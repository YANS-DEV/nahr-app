'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@prisma/client';
import { MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProductSearchInputProps {
    restaurantId: string;
    initialProduct: Product | null;
    onProductSelect: (product: Product | null) => void;
    onError: (message: string) => void;
}

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) {
        throw new Error('Échec de la récupération des données.');
    }
    return res.json();
});

export default function ProductSearchInput({ restaurantId, initialProduct, onProductSelect, onError }: ProductSearchInputProps) {
    const [searchTerm, setSearchTerm] = useState(initialProduct?.name || '');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct);

    const fetchProducts = useCallback(async (term: string) => {
        setIsSearching(true);
        try {
            const res = await fetch(`/api/products/search?q=${term}&restaurantId=${restaurantId}`);
            if (!res.ok) {
                throw new Error('Échec de la recherche de produits.');
            }
            const data = await res.json();
            setSearchResults(data.products);
        } catch (error: any) {
            onError(error.message);
        } finally {
            setIsSearching(false);
        }
    }, [restaurantId, onError]);

    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        if (searchTerm.length >= 2 && !selectedProduct) {
            setSearchTimeout(setTimeout(() => {
                fetchProducts(searchTerm);
            }, 500));
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, fetchProducts, selectedProduct]);
    
    useEffect(() => {
        setSelectedProduct(initialProduct);
        if (initialProduct) {
            setSearchTerm(initialProduct.name);
        } else {
            setSearchTerm('');
        }
    }, [initialProduct]);

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        setSearchTerm(product.name);
        setSearchResults([]);
        onProductSelect(product);
    };
    
    const handleClearSelection = () => {
        setSelectedProduct(null);
        setSearchTerm('');
        onProductSelect(null);
    };

    return (
        <div className="relative">
            <label htmlFor="product-search" className="block text-sm font-medium text-gray-300">
                Produit de base
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                    type="text"
                    id="product-search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    readOnly={!!selectedProduct}
                    className="block w-full pl-10 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Nom du produit..."
                />
                {selectedProduct && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={handleClearSelection}>
                        <XCircleIcon className="h-5 w-5 text-gray-400 hover:text-red-500" aria-hidden="true" />
                    </div>
                )}
            </div>
            {isSearching && <LoadingSpinner />}
            {searchTerm.length >= 2 && searchResults.length > 0 && !selectedProduct && (
                <ul className="absolute z-10 w-full bg-gray-700 mt-1 rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {searchResults.map((product) => (
                        <li
                            key={product.id}
                            className="text-gray-200 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-600 hover:text-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleSelectProduct(product);
                            }}
                        >
                            <div className="flex items-center">
                                <span className="font-medium truncate">{product.name}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && !selectedProduct && (
                <div className="mt-2 text-gray-400 text-sm">
                    Aucun produit trouvé.
                </div>
            )}
        </div>
    );
}