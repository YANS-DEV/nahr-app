'use client';

import { useState, useEffect } from 'react';
import { Product } from '@prisma/client';
import { CheckCircleIcon, XCircleIcon, MagnifyingGlassIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { ProductPackagingWithProduct } from '@/app/types/prisma';
import clsx from 'clsx';
import Alert from '@/components/Alert';
import LoadingSpinner from '@/components/LoadingSpinner';
import ScanStep from './steps/ScanStep';
import SearchStep from './steps/SearchStep';
import ExistingPackagingStep from './steps/ExistingPackagingStep';
import NewPackagingStep from './steps/NewPackagingStep';
import EditPackagingStep from './steps/EditPackagingStep';

interface ReceptionModalProps {
    onSuccess: () => void;
    onError: (message: string) => void;
    onClose: () => void;
    restaurantId: string;
    initialMode?: 'new' | 'edit';
}

export default function ReceptionModal({ onSuccess, onError, onClose, restaurantId, initialMode = 'new' }: ReceptionModalProps) {
    const [ean, setEan] = useState('');
    const [quantityReceived, setQuantityReceived] = useState(1);
    const [step, setStep] = useState<'scan' | 'search' | 'existing' | 'new' | 'loading'>('scan');
    const [subStep, setSubStep] = useState<'details' | 'edit'>(initialMode === 'edit' ? 'edit' : 'details');
    
    const [productPackaging, setProductPackaging] = useState<ProductPackagingWithProduct | null>(null);
    const [newProductPackagingData, setNewProductPackagingData] = useState({ name: '', quantity: 0, ean: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPackaging, setSelectedPackaging] = useState<ProductPackagingWithProduct | null>(null);

    const [editingPackaging, setEditingPackaging] = useState<ProductPackagingWithProduct | null>(null);

    const [internalError, setInternalError] = useState<string | null>(null);

    useEffect(() => {
        if (initialMode === 'edit') {
            setStep('search');
        } else {
            setStep('scan');
        }
    }, [initialMode]);

    const handleInternalError = (message: string) => {
        setInternalError(message);
        setTimeout(() => setInternalError(null), 5000);
    };

    const handleEanSubmit = async (ean: string) => {
        setInternalError(null);
        setEan(ean);
        setStep('loading');
        try {
            const response = await fetch(`/api/product-packaging?ean=${ean}`);
            if (!response.ok) {
                setStep('new');
                setNewProductPackagingData(prev => ({ ...prev, ean }));
                return;
            }
            const data: ProductPackagingWithProduct = await response.json();
            setProductPackaging(data);
            setStep('existing');
        } catch (err) {
            handleInternalError('Erreur lors de la vérification du code-barres.');
            setStep('scan');
        }
    };

    const handleNewProductPackagingSubmit = async (e: React.FormEvent, selectedProductId: string) => {
        e.preventDefault();
        setInternalError(null);
        if (!selectedProductId || !newProductPackagingData.name || newProductPackagingData.quantity <= 0) {
            handleInternalError('Veuillez sélectionner un produit et remplir les champs.');
            return;
        }
        setStep('loading');
        try {
            const response = await fetch('/api/receptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'new',
                    data: {
                        ...newProductPackagingData,
                        productId: selectedProductId,
                        restaurantId,
                        quantityReceived,
                    },
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Échec de l\'enregistrement du nouveau produit.');
            }
            onSuccess();
        } catch (err) {
            handleInternalError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.');
            setStep('new');
        }
    };

    const handleExistingProductReception = async () => {
        const pkg = productPackaging || selectedPackaging;
        if (!pkg || quantityReceived <= 0) return;
        setInternalError(null);
        setStep('loading');
        try {
            const response = await fetch('/api/receptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'existing',
                    data: {
                        productPackagingId: pkg.id,
                        restaurantId,
                        quantityReceived,
                    },
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Échec de l\'enregistrement de la réception.');
            }
            onSuccess();
        } catch (err) {
            handleInternalError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.');
            setStep('existing');
        }
    };
    
    const handleEditPackagingSubmit = async (data: any) => {
        if (!editingPackaging) return;
        setInternalError(null);
        setStep('loading');
        try {
            const response = await fetch(`/api/product-packaging/${editingPackaging.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    ean: data.ean || null,
                    quantity: data.quantity,
                    productId: data.productId,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Échec de la mise à jour du conditionnement.');
            }
            onSuccess();
        } catch (err) {
            handleInternalError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.');
            setStep('existing');
            setSubStep('edit');
        }
    };
    
    const handleSelectPackaging = (pkg: ProductPackagingWithProduct) => {
        if (initialMode === 'edit') {
            setEditingPackaging(pkg);
            setStep('existing');
            setSubStep('edit');
        } else {
            setSelectedPackaging(pkg);
            setStep('existing');
        }
    };

    const renderContent = () => {
        if (step === 'loading') {
            return <LoadingSpinner />;
        }
        if (step === 'existing') {
            if (subStep === 'edit' && editingPackaging) {
                return (
                    <EditPackagingStep
                        packaging={editingPackaging}
                        restaurantId={restaurantId}
                        onSave={handleEditPackagingSubmit}
                        onError={handleInternalError}
                    />
                );
            }
            const pkg = productPackaging || selectedPackaging;
            if (pkg) {
                return (
                    <ExistingPackagingStep
                        packaging={pkg}
                        quantityReceived={quantityReceived}
                        onQuantityChange={setQuantityReceived}
                        onConfirm={handleExistingProductReception}
                    />
                );
            }
        }
        if (step === 'new') {
            return (
                <NewPackagingStep
                    data={newProductPackagingData}
                    onDataChange={setNewProductPackagingData}
                    quantityReceived={quantityReceived}
                    onQuantityChange={setQuantityReceived}
                    onConfirm={handleNewProductPackagingSubmit}
                    onError={handleInternalError}
                    restaurantId={restaurantId}
                />
            );
        }
        if (step === 'search') {
            return <SearchStep onSelectPackaging={handleSelectPackaging} onError={handleInternalError} />;
        }
        if (step === 'scan') {
            return <ScanStep onScanSubmit={handleEanSubmit} onError={handleInternalError} />;
        }
        return null;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-gray-900 text-white rounded-lg shadow-2xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">
                        {initialMode === 'new' ? 'Nouvelle réception' : 'Éditer un conditionnement'}
                    </h3>
                    <div className="flex items-center space-x-2">
                        {initialMode === 'new' && (
                            <>
                                <button
                                    onClick={() => setStep('scan')}
                                    className={clsx(
                                        'p-2 rounded-full transition-colors',
                                        step === 'scan' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white'
                                    )}
                                >
                                    <QrCodeIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setStep('search')}
                                    className={clsx(
                                        'p-2 rounded-full transition-colors',
                                        step === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white'
                                    )}
                                >
                                    <MagnifyingGlassIcon className="h-5 w-5" />
                                </button>
                            </>
                        )}
                        <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-white hover:bg-gray-700 transition-colors">
                            <XCircleIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
                {internalError && <Alert message={internalError} type="error" onClose={() => setInternalError(null)} />}
                {renderContent()}
            </div>
        </div>
    );
}