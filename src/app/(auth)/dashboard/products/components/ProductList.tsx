'use client';

import { Dispatch, SetStateAction } from 'react';
import { Product as PrismaProduct, Category as PrismaCategory } from '@prisma/client';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';

type ProductWithCategory = PrismaProduct & {
  category: PrismaCategory | null;
};

interface ProductListProps {
  products: ProductWithCategory[] | undefined;
  categories: PrismaCategory[] | undefined;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
  sortOrder: 'asc' | 'desc';
  toggleSortOrder: () => void;
  confirmDelete: (id: string) => void;
  setIsEditingProduct: Dispatch<SetStateAction<string | null>>;
  setNewProductName: Dispatch<SetStateAction<string>>;
  setNewProductUnit: Dispatch<SetStateAction<string>>;
  setNewProductCategoryId: Dispatch<SetStateAction<string>>;
  setShowAddProductForm: Dispatch<SetStateAction<boolean>>;
}

export default function ProductList({
  products,
  categories,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  sortOrder,
  toggleSortOrder,
  confirmDelete,
  setIsEditingProduct,
  setNewProductName,
  setNewProductUnit,
  setNewProductCategoryId,
  setShowAddProductForm,
}: ProductListProps) {
  const sortedCategories = categories?.sort((a, b) => a.name.localeCompare(b.name));

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:flex-1 p-2 border border-gray-300 rounded-md"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-auto p-2 border border-gray-300 rounded-md"
        >
          <option value="all">Toutes les catégories</option>
          {sortedCategories?.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <button
          onClick={toggleSortOrder}
          className="btn-secondary px-4 py-2 flex items-center justify-center gap-2 w-full md:w-auto"
        >
          {sortOrder === 'asc' ? 'Trier par nom (A-Z)' : 'Trier par nom (Z-A)'}
          {sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
        </button>
      </div>
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedProducts.map(product => (
            <div key={product.id} className="relative border border-gray-300 p-4 rounded-md shadow-sm">
              <h3 className="font-bold text-base mb-1">{product.name}</h3>
              <p className="text-gray-600 text-sm">Unité: {product.unitOfMeasure}</p>
              {product.category && (
                <div
                  className="mt-2 text-white font-semibold py-1 px-2 rounded-full w-fit text-xs"
                  style={{ backgroundColor: product.category.color || '#4B5563' }}
                >
                  {product.category.name}
                </div>
              )}
              {product.restaurantId && (
                <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">Votre produit</span>
              )}
              {product.restaurantId && (
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <button
                    onClick={() => {
                      setIsEditingProduct(product.id);
                      setNewProductName(product.name);
                      setNewProductUnit(product.unitOfMeasure);
                      setNewProductCategoryId(product.categoryId || '');
                      setShowAddProductForm(true);
                    }}
                    className="text-gray-600 hover:text-blue-500 transition-colors cursor-pointer"
                    title="Modifier"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => confirmDelete(product.id)}
                    className="text-gray-600 hover:text-red-500 transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>Aucun produit ne correspond à vos filtres.</p>
      )}
    </>
  );
}