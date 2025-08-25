import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { ProductPackagingWithProduct } from '@/app/types/prisma';
import { formatUnits } from '@/utils/formatUnits';

interface ExistingPackagingStepProps {
    packaging: ProductPackagingWithProduct;
    quantityReceived: number;
    onQuantityChange: (quantity: number) => void;
    onConfirm: () => void;
}

export default function ExistingPackagingStep({ packaging, quantityReceived, onQuantityChange, onConfirm }: ExistingPackagingStepProps) {
    return (
        <>
            <div className="flex items-center mb-4 text-green-400">
                <CheckCircleIcon className="h-6 w-6 mr-2" />
                <h3 className="text-xl font-bold">Produit reconnu : {packaging.name}</h3>
            </div>
            <p className="text-gray-300 mb-2">Quantité par unité : {packaging.quantity} {packaging.product.unitOfMeasure}</p>
            <p className="text-gray-300 mb-4">Associé au produit : **{packaging.product.name}**</p>
            <div className="mb-4">
                <label htmlFor="quantityReceived" className="block text-gray-300 mb-2">Nombre d'unités reçues</label>
                <input
                    type="number"
                    id="quantityReceived"
                    value={quantityReceived}
                    onChange={(e) => onQuantityChange(Number(e.target.value))}
                    min="1"
                    required
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
                />
            </div>
            <button
                onClick={onConfirm}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
                Confirmer la réception
            </button>
        </>
    );
}