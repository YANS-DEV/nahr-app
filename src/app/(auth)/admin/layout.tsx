'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session.user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <p>Chargement...</p>;
  }

  if (session && session.user.role === 'admin') {
    return <>{children}</>;
  }

  return <p>Accès refusé. Vous devez être administrateur pour voir cette page.</p>;
}