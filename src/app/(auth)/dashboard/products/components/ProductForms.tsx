'use client';

import { useState, Dispatch, SetStateAction } from 'react';
import { Product as PrismaProduct, Category as PrismaCategory } from '@prisma/client';

interface ProductFormsProps {
  // Product Form Props
  showAddProductForm: boolean;
  setShowAddProductForm: Dispatch<SetStateAction<boolean>>;
  isEditingProduct: string | null;
  setIsEditingProduct: Dispatch<SetStateAction<string | null>>;
  newProductName: string;
  setNewProductName: Dispatch<SetStateAction<string>>;
  newProductUnit: string;
  setNewProductUnit: Dispatch<SetStateAction<string>>;
  newProductCategoryId: string;
  setNewProductCategoryId: Dispatch<SetStateAction<string>>;
  categories: PrismaCategory[] | undefined;
  handleAddProduct: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleEditProduct: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;

  // Category Form Props
  showAddCategoryForm: boolean;
  setShowAddCategoryForm: Dispatch<SetStateAction<boolean>>;
  newCategoryName: string;
  setNewCategoryName: Dispatch<SetStateAction<string>>;
  newCategoryType: string;
  setNewCategoryType: Dispatch<SetStateAction<string>>;
  handleAddCategory: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export default function ProductForms({
  showAddProductForm,
  setShowAddProductForm,
  isEditingProduct,
  setIsEditingProduct,
  newProductName,
  setNewProductName,
  newProductUnit,
  setNewProductUnit,
  newProductCategoryId,
  setNewProductCategoryId,
  categories,
  handleAddProduct,
  handleEditProduct,
  showAddCategoryForm,
  setShowAddCategoryForm,
  newCategoryName,
  setNewCategoryName,
  newCategoryType,
  setNewCategoryType,
  handleAddCategory,
}: ProductFormsProps) {
  const sortedCategories = categories?.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <button
          onClick={() => {
            setShowAddProductForm(prev => !prev);
            if (showAddProductForm) {
              setIsEditingProduct(null);
            }
          }}
          className="btn-primary flex-1"
        >
          {showAddProductForm ? 'Masquer le formulaire d\'ajout' : 'Ajouter un nouveau produit'}
        </button>
        <button
          onClick={() => setShowAddCategoryForm(prev => !prev)}
          className="btn-secondary flex-1"
        >
          {showAddCategoryForm ? 'Masquer le formulaire de catégorie' : 'Ajouter une nouvelle catégorie'}
        </button>
      </div>

      {showAddProductForm && (
        <div className="border border-gray-300 p-4 mb-8">
          <h2 className="text-2xl font-bold mb-4">{isEditingProduct ? 'Modifier un produit' : 'Ajouter un nouveau produit'}</h2>
          <form onSubmit={isEditingProduct ? handleEditProduct : handleAddProduct}>
            <div className="mb-4">
              <label htmlFor="productName" className="block text-gray-700">Nom du produit</label>
              <input
                id="productName"
                type="text"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="productUnit" className="block text-gray-700">Unité de mesure</label>
              <select
                id="productUnit"
                value={newProductUnit}
                onChange={(e) => setNewProductUnit(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Sélectionner une unité --</option>
                <option value="g">g</option>
                <option value="mL">mL</option>
                <option value="unité">unité</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="productCategory" className="block text-gray-700">Catégorie</label>
              <select
                id="productCategory"
                value={newProductCategoryId}
                onChange={(e) => setNewProductCategoryId(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Sélectionner une catégorie --</option>
                {sortedCategories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.type})
                    {!category.restaurantId && " (Globale)"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="btn-primary">
                {isEditingProduct ? 'Modifier le produit' : 'Ajouter le produit'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddProductForm(false);
                  setIsEditingProduct(null);
                  setNewProductName('');
                  setNewProductUnit('');
                  setNewProductCategoryId('');
                }}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {showAddCategoryForm && (
        <div className="border border-gray-300 p-4 mb-8">
          <h2 className="text-2xl font-bold mb-4">Ajouter une nouvelle catégorie</h2>
          <form onSubmit={handleAddCategory}>
            <div className="mb-4">
              <label htmlFor="categoryName" className="block text-gray-700">Nom de la catégorie</label>
              <input
                id="categoryName"
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="categoryType" className="block text-gray-700">Type</label>
              <select
                id="categoryType"
                value={newCategoryType}
                onChange={(e) => setNewCategoryType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="food">Alimentaire</option>
                <option value="non-food">Non-alimentaire</option>
              </select>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="btn-primary">Ajouter la catégorie</button>
              <button
                type="button"
                onClick={() => {
                  setNewCategoryName('');
                  setShowAddCategoryForm(false);
                }}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}