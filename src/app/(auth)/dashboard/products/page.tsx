'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import Alert from '@/components/Alert';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Product as PrismaProduct, Category as PrismaCategory } from '@prisma/client';
import ProductForms from './components/ProductForms';
import ProductList from './components/ProductList';
import LoadingSpinner from '@/components/LoadingSpinner';

type ProductWithCategory = PrismaProduct & {
  category: PrismaCategory | null;
};

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('Échec de la récupération des données');
  }
  return res.json();
});

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for Product Form
  const [newProductName, setNewProductName] = useState<string>('');
  const [newProductUnit, setNewProductUnit] = useState<string>('');
  const [newProductCategoryId, setNewProductCategoryId] = useState<string>('');
  const [showAddProductForm, setShowAddProductForm] = useState<boolean>(false);
  const [isEditingProduct, setIsEditingProduct] = useState<string | null>(null);

  // State for Category Form
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryType, setNewCategoryType] = useState<string>('food');
  const [showAddCategoryForm, setShowAddCategoryForm] = useState<boolean>(false);

  // State for UI
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'chief')) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const shouldFetch = status === 'authenticated' && session?.user?.role === 'chief';
  const restaurantId = session?.user?.restaurantId;

  const { data: products, isLoading: isLoadingProducts, mutate: mutateProducts } = useSWR<ProductWithCategory[]>(
    shouldFetch ? `/api/products?restaurantId=${restaurantId}` : null,
    fetcher
  );

  const { data: categories, isLoading: isLoadingCategories, mutate: mutateCategories } = useSWR<PrismaCategory[]>(
    shouldFetch ? '/api/categories' : null,
    fetcher
  );

  if (status === 'loading' || isLoadingProducts || isLoadingCategories) {
    return <LoadingSpinner />;
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'chief') {
    return null;
  }

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProductCategoryId) {
      setError('Veuillez sélectionner une catégorie.');
      return;
    }
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProductName, unitOfMeasure: newProductUnit, categoryId: newProductCategoryId }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Échec de l\'ajout du produit.' }));
        throw new Error(errorData.message);
      }
      setSuccess('Produit ajouté avec succès !');
      mutateProducts();
      setNewProductName('');
      setNewProductUnit('');
      setNewProductCategoryId('');
      setError(null);
      setShowAddProductForm(false);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.');
      setSuccess(null);
    }
  };

  const handleEditProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: isEditingProduct, name: newProductName, unitOfMeasure: newProductUnit, categoryId: newProductCategoryId }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Échec de la modification du produit.' }));
        throw new Error(errorData.message);
      }
      setSuccess('Produit modifié avec succès !');
      mutateProducts();
      setIsEditingProduct(null);
      setNewProductName('');
      setNewProductUnit('');
      setNewProductCategoryId('');
      setError(null);
      setShowAddProductForm(false);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.');
      setSuccess(null);
    }
  };

  const confirmDelete = (productId: string) => {
    setProductToDelete(productId);
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    try {
      const response = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productToDelete }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Échec de la suppression du produit.' }));
        throw new Error(errorData.message);
      }
      setSuccess('Produit supprimé avec succès !');
      mutateProducts();
      setError(null);
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.');
      setSuccess(null);
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  };

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName, type: newCategoryType }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Échec de l\'ajout de la catégorie.' }));
        throw new Error(errorData.message);
      }
      setSuccess('Catégorie ajoutée avec succès !');
      mutateCategories();
      setNewCategoryName('');
      setError(null);
      setShowAddCategoryForm(false);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.');
      setSuccess(null);
    }
  };
  
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Gérer les produits</h1>

      <ProductForms
        showAddProductForm={showAddProductForm}
        setShowAddProductForm={setShowAddProductForm}
        isEditingProduct={isEditingProduct}
        setIsEditingProduct={setIsEditingProduct}
        newProductName={newProductName}
        setNewProductName={setNewProductName}
        newProductUnit={newProductUnit}
        setNewProductUnit={setNewProductUnit}
        newProductCategoryId={newProductCategoryId}
        setNewProductCategoryId={setNewProductCategoryId}
        categories={categories}
        handleAddProduct={handleAddProduct}
        handleEditProduct={handleEditProduct}
        showAddCategoryForm={showAddCategoryForm}
        setShowAddCategoryForm={setShowAddCategoryForm}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        newCategoryType={newCategoryType}
        setNewCategoryType={setNewCategoryType}
        handleAddCategory={handleAddCategory}
      />

      <hr className="my-8 border-gray-300" />
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Liste des produits</h2>
        <ProductList
          products={products}
          categories={categories}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortOrder={sortOrder}
          toggleSortOrder={toggleSortOrder}
          confirmDelete={confirmDelete}
          setIsEditingProduct={setIsEditingProduct}
          setNewProductName={setNewProductName}
          setNewProductUnit={setNewProductUnit}
          setNewProductCategoryId={setNewProductCategoryId}
          setShowAddProductForm={setShowAddProductForm}
        />
      </div>

      {(success || error) && (
        <Alert
          message={success || error}
          type={success ? 'success' : 'error'}
          onClose={() => {
            setSuccess(null);
            setError(null);
          }}
        />
      )}
      
      {showDeleteConfirm && (
        <ConfirmationDialog
          title="Confirmer la suppression"
          onCancel={() => {
            setShowDeleteConfirm(false);
            setProductToDelete(null);
          }}
          onConfirm={executeDelete}
        >
            <p className="text-gray-300">Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.</p>
        </ConfirmationDialog>
      )}
    </div>
  );
}