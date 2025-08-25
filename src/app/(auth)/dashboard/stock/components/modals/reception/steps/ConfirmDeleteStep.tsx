import { TrashIcon } from '@heroicons/react/24/outline';

interface ConfirmDeleteStepProps {
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDeleteStep({ onConfirm, onCancel }: ConfirmDeleteStepProps) {
    return (
        <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-red-500 flex items-center justify-center">
                <TrashIcon className="h-6 w-6 mr-2" /> Confirmer la suppression
            </h3>
            <p className="text-gray-300">
                Êtes-vous sûr de vouloir supprimer définitivement ce conditionnement ? Cette action est irréversible.
            </p>
            <div className="flex justify-center space-x-4 mt-6">
                <button
                    onClick={onCancel}
                    className="py-2 px-4 rounded-md text-gray-400 bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                    Annuler
                </button>
                <button
                    onClick={onConfirm}
                    className="py-2 px-4 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                    Oui, supprimer
                </button>
            </div>
        </div>
    );
}