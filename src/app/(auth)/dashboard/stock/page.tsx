'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Product, Stock as PrismaStock } from '@prisma/client';
import Alert from '@/components/Alert';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { PlusCircleIcon, PencilIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ReceptionModal from './components/modals/reception/ReceptionModal';
import EditThresholdModal from './components/modals/EditThresholdModal';
import { formatUnits } from '@/utils/formatUnits';
import clsx from 'clsx';
import Link from 'next/link';

type StockWithProduct = PrismaStock & { product: Product };

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('Échec de la récupération des données.');
  }
  return res.json();
});

export default function StockPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showReceptionModal, setShowReceptionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState<StockWithProduct | null>(null);

  const [receptionModalMode, setReceptionModalMode] = useState<'new' | 'edit'>('new');

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'chief')) {
      router.push('/unauthorized');
    }
  }, [status, session, router]);

  const restaurantId = session?.user?.restaurantId;
  const shouldFetch = status === 'authenticated' && session?.user?.role === 'chief' && restaurantId;

  const { data: stock, isLoading, mutate } = useSWR<StockWithProduct[]>(
    shouldFetch ? `/api/stock?restaurantId=${restaurantId}` : null,
    fetcher
  );

  const handleReceptionSuccess = () => {
    setSuccess('Opération réussie !');
    setError(null);
    mutate();
    setShowReceptionModal(false);
  };

  const handleReceptionError = (message: string) => {
    setError(message);
    setSuccess(null);
  };

  const handleEditThresholdSuccess = () => {
    setSuccess('Seuil d\'alerte mis à jour avec succès !');
    setError(null);
    mutate();
    setShowEditModal(false);
  };

  const handleEditThresholdError = (message: string) => {
    setError(message);
    setSuccess(null);
  };

  const openReceptionModal = () => {
    setReceptionModalMode('new');
    setShowReceptionModal(true);
  };

  const openEditPackagingModal = () => {
    setReceptionModalMode('edit');
    setShowReceptionModal(true);
  };

  const userIsChief = session?.user?.role === 'chief';

  if (status === 'loading' || isLoading) {
    return <LoadingSpinner />;
  }

  if (status === 'unauthenticated' || (status === 'authenticated' && !userIsChief)) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 text-gray-100">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">Inventaire</h1>
        <div className="flex flex-wrap gap-2 md:space-x-4">
          {userIsChief && (
            <button
              onClick={openEditPackagingModal}
              className="flex-1 md:flex-none flex items-center justify-center p-2 md:py-2 md:px-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              <MagnifyingGlassIcon className="h-5 w-5 md:mr-2" />
              <span className="hidden md:block">Éditer un conditionnement</span>
            </button>
          )}
          <button
            onClick={openReceptionModal}
            className="flex-1 md:flex-none flex items-center justify-center p-2 md:py-2 md:px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircleIcon className="h-5 w-5 md:mr-2" />
            <span className="hidden md:block">Nouvelle réception</span>
          </button>
        </div>
      </div>

      {error && <Alert message={error} type="error" onClose={() => setError(null)} />}
      {success && <Alert message={success} type="success" onClose={() => setSuccess(null)} />}
      
      {stock?.length === 0 ? (
        <EmptyState title="Inventaire vide" message="Commencez par ajouter votre premier produit en stock." />
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg">
          {/* Table for large screens */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Produit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Quantité en stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Seuil d'alerte
                  </th>
                  {userIsChief && (
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Modifier</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {stock?.map(item => {
                  const isBelowThreshold = item.quantity <= item.alertThreshold;
                  const isCloseToThreshold = item.quantity > item.alertThreshold && item.quantity <= item.alertThreshold * 1.25;

                  return (
                    <tr 
                      key={item.id} 
                      className={clsx(
                        'transition-colors',
                        {
                          'bg-red-600 text-white hover:bg-red-500': isBelowThreshold,
                          'bg-yellow-500 text-gray-900 hover:bg-yellow-400': isCloseToThreshold,
                          'bg-gray-800 text-gray-300 hover:bg-gray-700': !isBelowThreshold && !isCloseToThreshold,
                        }
                      )}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{item.product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{formatUnits(item.quantity, item.product.unitOfMeasure)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{formatUnits(item.alertThreshold, item.product.unitOfMeasure)}</div>
                      </td>
                      {userIsChief && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => {
                              setSelectedStockItem(item);
                              setShowEditModal(true);
                            }}
                            className={clsx(
                              'hover:text-gray-200',
                              {
                                'text-white': isBelowThreshold || isCloseToThreshold,
                                'text-indigo-400': !isBelowThreshold && !isCloseToThreshold,
                              }
                            )}
                            title="Modifier le seuil d'alerte"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards for mobile screens */}
          <div className="md:hidden p-4 space-y-4">
            {stock?.map(item => {
              const isBelowThreshold = item.quantity <= item.alertThreshold;
              const isCloseToThreshold = item.quantity > item.alertThreshold && item.quantity <= item.alertThreshold * 1.25;

              return (
                <div 
                  key={item.id} 
                  className={clsx(
                    'p-4 rounded-lg shadow-md transition-colors',
                    {
                      'bg-red-600 text-white': isBelowThreshold,
                      'bg-yellow-500 text-gray-900': isCloseToThreshold,
                      'bg-gray-700 text-gray-200': !isBelowThreshold && !isCloseToThreshold,
                    }
                  )}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold">{item.product.name}</h3>
                    {userIsChief && (
                      <button
                        onClick={() => {
                          setSelectedStockItem(item);
                          setShowEditModal(true);
                        }}
                        className={clsx(
                          'ml-4 flex-shrink-0',
                          {
                            'text-white': isBelowThreshold || isCloseToThreshold,
                            'text-gray-400': !isBelowThreshold && !isCloseToThreshold,
                          }
                        )}
                        title="Modifier le seuil d'alerte"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <div className="mt-2 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="font-semibold">Quantité en stock:</span>
                      <span>{formatUnits(item.quantity, item.product.unitOfMeasure)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Seuil d'alerte:</span>
                      <span>{formatUnits(item.alertThreshold, item.product.unitOfMeasure)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showReceptionModal && restaurantId && (
        <ReceptionModal 
          onSuccess={handleReceptionSuccess}
          onError={handleReceptionError}
          onClose={() => setShowReceptionModal(false)}
          restaurantId={restaurantId}
          initialMode={receptionModalMode}
        />
      )}

      {showEditModal && selectedStockItem && (
        <EditThresholdModal
          stockItem={selectedStockItem}
          onSuccess={handleEditThresholdSuccess}
          onError={handleEditThresholdError}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}