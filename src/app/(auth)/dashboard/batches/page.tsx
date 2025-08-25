'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Recipe } from '@prisma/client';

import LoadingSpinner from '@/components/LoadingSpinner';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import Alert from '@/components/Alert';
import ConfirmationDialog from '@/components/ConfirmationDialog';

interface SelectedRecipe {
  recipeId: string;
  name: string;
  quantity: number;
}

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('Échec de la récupération des données');
  }
  return res.json();
});

export default function BatchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedRecipes, setSelectedRecipes] = useState<SelectedRecipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [batchToConfirm, setBatchToConfirm] = useState<SelectedRecipe[]>([]);
  const [isLaunching, setIsLaunching] = useState<boolean>(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/dashboard');
    } else if (status === 'authenticated' && session?.user?.role !== 'chief') {
      router.push('/unauthorized');
    }
  }, [status, session, router]);

  const shouldFetch = status === 'authenticated' && session?.user?.role === 'chief';
  const restaurantId = session?.user?.restaurantId;

  const { data: recipes, isLoading } = useSWR<Recipe[]>(
    shouldFetch ? `/api/recipes?restaurantId=${restaurantId}` : null,
    fetcher
  );

  if (status === 'loading' || isLoading) {
    return <LoadingSpinner />;
  }

  if (status === 'authenticated' && session?.user?.role !== 'chief') {
    return null;
  }

  const handleQuantityChange = (recipeId: string, name: string, change: number) => {
    setSelectedRecipes(prevSelected => {
      const existingRecipe = prevSelected.find(r => r.recipeId === recipeId);
      
      if (existingRecipe) {
        const newQuantity = Math.max(0, existingRecipe.quantity + change);
        if (newQuantity === 0) {
          return prevSelected.filter(r => r.recipeId !== recipeId);
        }
        return prevSelected.map(r => 
          r.recipeId === recipeId ? { ...r, quantity: newQuantity } : r
        );
      } else if (change > 0) {
        return [...prevSelected, { recipeId, name, quantity: 1 }];
      }
      return prevSelected;
    });
  };

  const handleSubmit = () => {
    if (selectedRecipes.length === 0) {
      setError('Veuillez sélectionner au moins une recette pour la fournée.');
      setSuccess(null);
      return;
    }

    const totalRecipes = selectedRecipes.reduce((acc, curr) => acc + curr.quantity, 0);
    if (totalRecipes === 0) {
        setError('Veuillez sélectionner au moins une recette pour la fournée.');
        setSuccess(null);
        return;
    }

    setBatchToConfirm(selectedRecipes);
    setIsConfirming(true);
  };
  
  const handleConfirmBatch = async () => {
    setIsConfirming(false);
    setIsLaunching(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipes: batchToConfirm }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Une erreur est survenue lors du lancement de la fournée.');
      }

      setSuccess('Fournée lancée avec succès et stock mis à jour !');
      setSelectedRecipes([]);
      setBatchToConfirm([]);
    } catch (err: any) {
      setError(err.message || 'Échec du lancement de la fournée.');
    } finally {
      setIsLaunching(false);
    }
  };
  
  const handleCancelConfirmation = () => {
    setIsConfirming(false);
    setBatchToConfirm([]);
  };

  const getRecipeQuantity = (recipeId: string) => {
    return selectedRecipes.find(r => r.recipeId === recipeId)?.quantity || 0;
  };

  if (isLaunching) {
    return <LoadingSpinner message="Lancement de la fournée et mise à jour des stocks..." />;
  }
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4 text-white">Lancer une fournée</h1>
      <p className="text-gray-400 mb-8">
        Sélectionnez les recettes et les quantités pour votre prochaine production.
      </p>

      {error && <Alert message={error} type="error" onClose={() => setError(null)} />}
      {success && <Alert message={success} type="success" onClose={() => setSuccess(null)} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {recipes?.length === 0 && <p className="text-gray-400">Aucune recette trouvée pour votre restaurant.</p>}

        {recipes?.map(recipe => (
          <div key={recipe.id} className="bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center text-center">
            <h2 className="text-xl font-semibold mb-2 text-white">{recipe.name}</h2>
            
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                onClick={() => handleQuantityChange(recipe.id, recipe.name, -1)}
                className="p-2 bg-gray-700 text-gray-400 rounded-full hover:bg-gray-600 transition-colors cursor-pointer"
                aria-label="Diminuer la quantité"
              >
                <MinusIcon className="h-5 w-5" />
              </button>
              <span className="text-2xl font-bold w-12 text-center text-white">{getRecipeQuantity(recipe.id)}</span>
              <button
                onClick={() => handleQuantityChange(recipe.id, recipe.name, 1)}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors cursor-pointer"
                aria-label="Augmenter la quantité"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          className="py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Lancer la fournée
        </button>
      </div>
      
      {isConfirming && (
        <ConfirmationDialog
          title="Confirmer la fournée"
          onConfirm={handleConfirmBatch}
          onCancel={handleCancelConfirmation}
        >
          <div className="mb-4">
            <p className="text-gray-300 mb-2">
              Vous êtes sur le point de lancer une fournée de {batchToConfirm.reduce((acc, curr) => acc + curr.quantity, 0)} recettes. Souhaitez-vous continuer ?
            </p>
            <div className="bg-gray-800 rounded-md p-4 mt-4">
              <h4 className="text-md font-semibold mb-2 text-white">Résumé de la fournée :</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-200">
                {batchToConfirm.map((recipe, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="font-bold text-blue-400">{recipe.quantity}x</span>
                    <span>{recipe.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ConfirmationDialog>
      )}
    </div>
  );
}