'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface ConfirmationDialogProps {
  title: string;
  children: ReactNode; // On remplace 'message' et 'recipes' par 'children'
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationDialog({ title, children, onConfirm, onCancel }: ConfirmationDialogProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div ref={modalRef} className="bg-gray-900 text-white rounded-lg shadow-2xl p-6 w-full max-w-sm">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        {children} {/* On affiche le contenu enfant ici */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}