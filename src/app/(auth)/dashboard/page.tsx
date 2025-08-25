'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Tableau de bord</h1>
      <p className="mb-4">Bienvenue, {session?.user?.name} !</p>

      {session?.user?.role === 'chief' && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Espace Chef de cuisine</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/dashboard/recipes" className="p-6 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors">
              <h3 className="text-xl font-bold">Gérer les recettes</h3>
              <p className="mt-2 text-sm">Ajouter, modifier ou supprimer des recettes pour votre restaurant.</p>
            </Link>
            <Link href="/dashboard/products" className="p-6 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors">
              <h3 className="text-xl font-bold">Gérer les produits</h3>
              <p className="mt-2 text-sm">Ajouter des produits et organiser par catégories.</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}