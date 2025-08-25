'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Product, Restaurant } from '@prisma/client';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('Échec de la récupération des données');
  }
  return res.json();
});

const productsFetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('Échec de la récupération des produits');
  }
  return res.json();
});

const restaurantsFetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('Échec de la récupération des restaurants');
  }
  return res.json();
});

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('unité');
  const [selectedProductRestaurantId, setSelectedProductRestaurantId] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [addProductType, setAddProductType] = useState<'global' | 'by-restaurant'>('global');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedUnit, setEditedUnit] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const shouldFetch = status === 'authenticated' && session?.user?.role === 'admin';

  const { data: products, error: productsSwrError, isLoading: isLoadingProducts, mutate: mutateProducts } = useSWR<Product[]>(
    shouldFetch ? '/api/admin/products' : null,
    productsFetcher
  );

  const { data: restaurants, error: restaurantsSwrError, isLoading: isLoadingRestaurants } = useSWR<Restaurant[]>(
    shouldFetch ? '/api/admin/restaurants' : null,
    restaurantsFetcher
  );

  if (status === 'loading' || isLoadingProducts || isLoadingRestaurants) {
    return <p>Chargement...</p>;
  }

  if (status === 'unauthenticated' || !shouldFetch) {
    router.push('/dashboard');
    return null;
  }

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const productData = {
      name: newProductName,
      unitOfMeasure: newProductUnit,
      restaurantId: addProductType === 'by-restaurant' ? selectedProductRestaurantId : null,
    };

    if (!productData.name || !productData.unitOfMeasure || (addProductType === 'by-restaurant' && !productData.restaurantId)) {
      setError('Tous les champs sont requis.');
      return;
    }

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de l\'ajout du produit.');
      }
      
      setSuccess('Produit ajouté avec succès !');
      setNewProductName('');
      setNewProductUnit('unité');
      setSelectedProductRestaurantId('');
      setError(null);
      mutateProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditedName(product.name);
    setEditedUnit(product.unitOfMeasure);
  };

  const handleUpdateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedName, unitOfMeasure: editedUnit }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la mise à jour du produit.');
      }
      
      setSuccess('Produit mis à jour avec succès !');
      setEditingProduct(null);
      setEditedName('');
      setEditedUnit('');
      setError(null);
      mutateProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Échec de la suppression du produit.');
        }

        setSuccess('Produit supprimé avec succès !');
        setError(null);
        mutateProducts();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const unitOfMeasures = ['unité', 'g', 'mL'];

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Gestion des produits</h1>
      {(error || productsSwrError || restaurantsSwrError) && <p style={{ color: 'red' }}>{error || productsSwrError || restaurantsSwrError}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      
      <button onClick={() => setShowAddForm(!showAddForm)} style={{ padding: '0.75rem', marginBottom: '1rem', cursor: 'pointer' }}>
        {showAddForm ? 'Masquer le formulaire' : 'Ajouter un nouveau produit'}
      </button>

      {showAddForm && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem' }}>
          <h2>Ajouter un nouveau produit</h2>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
            <label>
              <input
                type="radio"
                value="global"
                checked={addProductType === 'global'}
                onChange={() => setAddProductType('global')}
              />
              Global
            </label>
            <label>
              <input
                type="radio"
                value="by-restaurant"
                checked={addProductType === 'by-restaurant'}
                onChange={() => setAddProductType('by-restaurant')}
              />
              Par restaurant
            </label>
          </div>
          <form onSubmit={handleAddProduct}>
            {addProductType === 'by-restaurant' && (
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="selectProductRestaurant">Sélectionner un restaurant</label>
                <select
                  id="selectProductRestaurant"
                  value={selectedProductRestaurantId}
                  onChange={(e) => setSelectedProductRestaurantId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="">-- Choisir un restaurant --</option>
                  {restaurants?.map(restaurant => (
                    <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="productName">Nom du produit</label>
              <input
                id="productName"
                type="text"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="productUnit">Unité de mesure</label>
              <select
                id="productUnit"
                value={newProductUnit}
                onChange={(e) => setNewProductUnit(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem' }}
              >
                {unitOfMeasures.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <button type="submit" style={{ padding: '0.75rem', cursor: 'pointer', width: '100%' }}>
              Ajouter le produit
            </button>
          </form>
        </div>
      )}

      <hr style={{ margin: '2rem 0' }} />

      {editingProduct && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem' }}>
          <h2>Modifier le produit : {editingProduct.name}</h2>
          <form onSubmit={handleUpdateProduct}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="editProductName">Nom du produit</label>
              <input
                id="editProductName"
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="editProductUnit">Unité de mesure</label>
              <select
                id="editProductUnit"
                value={editedUnit}
                onChange={(e) => setEditedUnit(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem' }}
              >
                {unitOfMeasures.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <button type="submit" style={{ padding: '0.75rem', cursor: 'pointer', marginRight: '1rem' }}>
              Sauvegarder les modifications
            </button>
            <button type="button" onClick={() => setEditingProduct(null)}>Annuler</button>
          </form>
        </div>
      )}

      <div>
        <h2>Liste des produits ({filteredProducts.length})</h2>
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        {filteredProducts.length > 0 ? (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {filteredProducts.map(product => (
              <li key={product.id} style={{ 
                border: '1px solid #eee', 
                padding: '1rem', 
                marginBottom: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{product.name}</strong> - {product.unitOfMeasure}
                  {product.restaurantId && (
                    <span style={{ marginLeft: '1rem', color: '#666' }}>
                      (Restaurant ID: {product.restaurantId})
                    </span>
                  )}
                </div>
                <div>
                  <button onClick={() => handleEditProduct(product)} style={{ marginRight: '0.5rem', padding: '0.5rem' }}>Modifier</button>
                  <button onClick={() => handleDeleteProduct(product.id)} style={{ padding: '0.5rem' }}>Supprimer</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun produit trouvé.</p>
        )}
      </div>
    </div>
  );
}