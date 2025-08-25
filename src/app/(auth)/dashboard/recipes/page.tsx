// src/app/(auth)/dashboard/recipes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { RecipeIngredient, Product } from '@prisma/client';
import { RecipeWithIngredients } from '@/app/types/prisma';

import RecipeForm from './components/RecipeForm';
import RecipeList from './components/RecipeList';
import Alert from '@/components/Alert';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import LoadingSpinner from '@/components/LoadingSpinner';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('Échec de la récupération des données');
  }
  return res.json();
});

export default function RecipesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newRecipeName, setNewRecipeName] = useState<string>('');
  const [newRecipeDescription, setNewRecipeDescription] = useState<string>('');
  const [editingRecipe, setEditingRecipe] = useState<RecipeWithIngredients | null>(null);
  const [editedName, setEditedName] = useState<string>('');
  const [editedDescription, setEditedDescription] = useState<string>('');
  const [editedIngredients, setEditedIngredients] = useState<(RecipeIngredient & { product: Product })[]>([]);
  const [newIngredientId, setNewIngredientId] = useState<string>('');
  const [newIngredientQuantity, setNewIngredientQuantity] = useState<number>(0);
  const [deletedIngredients, setDeletedIngredients] = useState<string[]>([]);
  const [isAddingAnimating, setIsAddingAnimating] = useState<boolean>(false);
  const [isEditingAnimating, setIsEditingAnimating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ingredientAddError, setIngredientAddError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
  const [recipeToDeleteId, setRecipeToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'chief')) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const shouldFetch = status === 'authenticated' && session?.user?.role === 'chief';

  const { data: recipes, error: recipesSwrError, isLoading: isLoadingRecipes, mutate: mutateRecipes } = useSWR<RecipeWithIngredients[]>(
    shouldFetch ? `/api/recipes` : null,
    fetcher
  );

  const { data: products, error: productsSwrError, isLoading: isLoadingProducts } = useSWR<Product[]>(
    shouldFetch ? '/api/admin/products' : null,
    fetcher
  );

  if (status === 'loading' || isLoadingRecipes || isLoadingProducts) {
    return <LoadingSpinner />;
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'chief') {
    return null;
  }

  const handleAddRecipe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRecipeName,
          description: newRecipeDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Échec de l\'ajout de la recette.' }));
        throw new Error(errorData.message);
      }
      
      const newRecipe = await response.json();

      setSuccess('Recette ajoutée avec succès !');
      setNewRecipeName('');
      setNewRecipeDescription('');
      
      mutateRecipes(prevRecipes => [...(prevRecipes || []), newRecipe], false);
      
      setError(null);
      
      setIsAddingAnimating(true);
      setTimeout(() => {
          setShowAddForm(false);
          setIsAddingAnimating(false);
      }, 500);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.');
      setSuccess(null);
    }
  };

  const handleEditRecipe = async (recipe: RecipeWithIngredients) => {
    if (showAddForm) {
      setIsAddingAnimating(true);
      setTimeout(() => {
        setShowAddForm(false);
        setEditingRecipe(recipe);
        setEditedName(recipe.name);
        setEditedDescription(recipe.description ?? ''); 
        setEditedIngredients(recipe.ingredients);
        setIsAddingAnimating(false);
      }, 500);
    } else {
        setEditingRecipe(recipe);
        setEditedName(recipe.name);
        setEditedDescription(recipe.description ?? ''); 
        setEditedIngredients(recipe.ingredients);
    }
  };

  const handleUpdateRecipe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingRecipe) return;

    try {
      const response = await fetch(`/api/recipes/${editingRecipe.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editedName,
          description: editedDescription,
          ingredients: editedIngredients,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Échec de la mise à jour de la recette.' }));
        throw new Error(errorData.message);
      }
      
      setSuccess('Recette mise à jour avec succès !');
      setEditingRecipe(null);
      setEditedName('');
      setEditedDescription('');
      setEditedIngredients([]);
      setNewIngredientId('');
      setNewIngredientQuantity(0);
      setIngredientAddError(null);
      setDeletedIngredients([]);
      mutateRecipes();
      setError(null);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.');
      setSuccess(null);
    }
  };

  const confirmDelete = async () => {
    if (!recipeToDeleteId) return;

    try {
      const response = await fetch(`/api/recipes/${recipeToDeleteId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Échec de la suppression de la recette.' }));
        throw new Error(errorData.message);
      }
      
      setSuccess('Recette supprimée avec succès !');
      mutateRecipes();
      setError(null);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.');
      setSuccess(null);
    } finally {
      setIsConfirmingDelete(false);
      setRecipeToDeleteId(null);
    }
  };

  const handleStartDelete = (recipeId: string) => {
    setRecipeToDeleteId(recipeId);
    setIsConfirmingDelete(true);
  };

  const handleCancelDelete = () => {
    setIsConfirmingDelete(false);
    setRecipeToDeleteId(null);
  };

  const handleAddIngredient = () => {
    if (newIngredientId && newIngredientQuantity > 0) {
      const selectedProduct = products?.find(p => p.id === newIngredientId);
      const isIngredientExist = editedIngredients.some(ing => ing.productId === newIngredientId);

      if (isIngredientExist) {
        setIngredientAddError('Cet ingrédient a déjà été ajouté.');
        return;
      }

      if (selectedProduct) {
        setEditedIngredients([
          ...editedIngredients,
          {
            id: `temp-${Date.now()}`,
            quantity: newIngredientQuantity,
            productId: newIngredientId,
            recipeId: editingRecipe?.id || '',
            product: selectedProduct as any
          } as any
        ]);
        setNewIngredientId('');
        setNewIngredientQuantity(0);
        setIngredientAddError(null);
      }
    } else {
        setIngredientAddError('Veuillez sélectionner un ingrédient et une quantité valide.');
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setEditedIngredients(editedIngredients.map(ing =>
      ing.productId === productId ? { ...ing, quantity } : ing
    ));
  };

  const handleRemoveIngredient = (productId: string) => {
    setDeletedIngredients(prev => [...prev, productId]);
    setTimeout(() => {
      setEditedIngredients(editedIngredients.filter(ing => ing.productId !== productId));
      setDeletedIngredients(prev => prev.filter(id => id !== productId));
    }, 500);
  };
  
  const resetEditingForm = () => {
    setIsEditingAnimating(true);
    setTimeout(() => {
      setEditingRecipe(null);
      setEditedName('');
      setEditedDescription('');
      setEditedIngredients([]);
      setNewIngredientId('');
      setNewIngredientQuantity(0);
      setIngredientAddError(null);
      setDeletedIngredients([]);
      setIsEditingAnimating(false);
    }, 500);
  };

  const handleAddButton = () => {
    if (editingRecipe) {
        setIsEditingAnimating(true);
        setTimeout(() => {
            setEditingRecipe(null);
            setShowAddForm(true);
            setEditedName(newRecipeName);
            setEditedDescription(newRecipeDescription);
            setIsEditingAnimating(false);
        }, 500);
    } else {
        setShowAddForm(!showAddForm);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Gérer les recettes</h1>
      
      <button 
        onClick={handleAddButton} 
        className="btn-primary mb-4"
      >
        {showAddForm ? 'Masquer le formulaire' : 'Ajouter une nouvelle recette'}
      </button>

      {showAddForm && (
        <div className={`transition-all duration-500 ${isAddingAnimating ? 'slide-out' : 'slide-in'}`}>
          <RecipeForm
            isEditing={false}
            products={products || []}
            onSubmit={handleAddRecipe}
            onCancel={() => {
              setIsAddingAnimating(true);
              setTimeout(() => {
                setShowAddForm(false);
                setIsAddingAnimating(false);
              }, 500);
            }}
            onAddIngredient={() => {}}
            onRemoveIngredient={() => {}}
            onQuantityChange={() => {}}
            newIngredientId={''}
            setNewIngredientId={setNewIngredientId}
            newIngredientQuantity={0}
            setNewIngredientQuantity={setNewIngredientQuantity}
            editedName={newRecipeName}
            setEditedName={setNewRecipeName}
            editedDescription={newRecipeDescription}
            setEditedDescription={setNewRecipeDescription}
            editedIngredients={[]}
            ingredientAddError={null}
            setIngredientAddError={setIngredientAddError}
            deletedIngredients={[]}
          />
        </div>
      )}

      {editingRecipe && (
        <div className={`transition-all duration-500 ${isEditingAnimating ? 'slide-out' : 'slide-in'}`}>
          <RecipeForm
            isEditing={true}
            recipe={editingRecipe}
            products={products || []}
            onSubmit={handleUpdateRecipe}
            onCancel={resetEditingForm}
            onAddIngredient={handleAddIngredient}
            onRemoveIngredient={handleRemoveIngredient}
            onQuantityChange={handleQuantityChange}
            newIngredientId={newIngredientId}
            setNewIngredientId={setNewIngredientId}
            newIngredientQuantity={newIngredientQuantity}
            setNewIngredientQuantity={setNewIngredientQuantity}
            editedName={editedName}
            setEditedName={setEditedName}
            editedDescription={editedDescription}
            setEditedDescription={setEditedDescription}
            editedIngredients={editedIngredients}
            ingredientAddError={ingredientAddError}
            setIngredientAddError={setIngredientAddError}
            deletedIngredients={deletedIngredients}
          />
        </div>
      )}
      
      <hr className="my-8 border-gray-300" />
      
      {recipes && (
        <RecipeList
          recipes={recipes}
          onEdit={handleEditRecipe}
          onDelete={handleStartDelete}
        />
      )}

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

      {isConfirmingDelete && (
        <ConfirmationDialog
          title="Confirmer la suppression"
          onConfirm={confirmDelete}
          onCancel={handleCancelDelete}
        >
          <p className="text-gray-300">Êtes-vous sûr de vouloir supprimer cette recette ? Cette action est irréversible.</p>
        </ConfirmationDialog>
      )}
    </div>
  );
}