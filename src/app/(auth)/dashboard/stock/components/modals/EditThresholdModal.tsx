'use client';

import { useState } from 'react';
import { Stock, Product } from '@prisma/client';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { formatUnits } from '@/utils/formatUnits';
import LoadingSpinner from '@/components/LoadingSpinner';

interface EditThresholdModalProps {
  stockItem: Stock & { product: Product };
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

const fetcher = (url: string, data: any) =>
  fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => {
    if (!res.ok) {
      throw new Error('Échec de la mise à jour du seuil.');
    }
    return res.json();
  });

export default function EditThresholdModal({ stockItem, onClose, onSuccess, onError }: EditThresholdModalProps) {
  const [newThreshold, setNewThreshold] = useState(stockItem.alertThreshold);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newThreshold < 0) {
      onError("Le seuil ne peut pas être négatif.");
      return;
    }
    
    setIsLoading(true);
    try {
      // API cible le stock et non le produit
      await fetcher(`/api/stock/${stockItem.id}`, { alertThreshold: newThreshold });
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-gray-900 text-white rounded-lg shadow-2xl p-6 w-full max-w-sm relative">
        <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full text-gray-500 hover:text-white hover:bg-gray-700 transition-colors">
          <XCircleIcon className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold mb-4">Modifier le seuil d'alerte</h2>
        
        <p className="mb-4 text-gray-300">
          **{stockItem.product.name}**
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newThreshold" className="block text-sm font-medium text-gray-300 mb-2">
              Nouveau seuil d'alerte ({stockItem.product.unitOfMeasure})
            </label>
            <input
              type="number"
              id="newThreshold"
              value={newThreshold}
              onChange={(e) => setNewThreshold(Number(e.target.value))}
              min="0"
              required
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner size="small" /> : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  );
}