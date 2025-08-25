import { useState } from 'react';
import useSWR from 'swr';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ProductPackagingWithProduct } from '@/app/types/prisma';

interface SearchStepProps {
    onSelectPackaging: (packaging: ProductPackagingWithProduct) => void;
    onError: (message: string) => void;
}

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) {
        throw new Error('Échec de la récupération des données.');
    }
    return res.json();
});

export default function SearchStep({ onSelectPackaging, onError }: SearchStepProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: productPackagings, isLoading: isLoadingPackagings } = useSWR<ProductPackagingWithProduct[]>(
        searchTerm ? `/api/product-packaging/search?query=${searchTerm}` : null,
        fetcher
    );

    return (
        <div className="space-y-4">
            <p className="text-gray-300">Recherchez un conditionnement de produit.</p>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom"
                className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
            />
            {isLoadingPackagings && <LoadingSpinner />}
            {productPackagings && (
                <ul className="max-h-60 overflow-y-auto space-y-2 mt-4">
                    {productPackagings.length === 0 ? (
                        <li className="text-gray-400">Aucun résultat trouvé.</li>
                    ) : (
                        productPackagings.map((pkg) => (
                            <li
                                key={pkg.id}
                                onClick={() => onSelectPackaging(pkg)}
                                className="p-3 bg-gray-700 rounded-md cursor-pointer hover:bg-gray-600 transition-colors"
                            >
                                <p className="font-semibold text-white">{pkg.name}</p>
                                <p className="text-sm text-gray-400">EAN: {pkg.ean}</p>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}