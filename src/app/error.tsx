'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
      <h1 className="text-9xl font-extrabold text-red-500">500</h1>
      <h2 className="text-3xl font-semibold text-gray-800 mt-4 mb-2">Erreur inattendue</h2>
      <p className="text-gray-600 text-lg mb-4">
        Une erreur s'est produite de notre côté.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          className="btn-primary"
          onClick={
            () => reset()
          }
        >
          Réessayer
        </button>
        <button
          className="btn-secondary"
          onClick={() => router.push('/dashboard')}
        >
          Retourner au tableau de bord
        </button>
      </div>
    </div>
  );
}