'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Alert from '@/components/Alert';
import { CubeTransparentIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.ok) {
        router.push('/dashboard');
      } else {
        setError('Email ou mot de passe incorrect.');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md p-6 sm:p-8 md:p-10 bg-gray-800 rounded-lg shadow-xl">
        <div className="flex items-center justify-center mb-6">
          <CubeTransparentIcon className="w-10 h-10 text-blue-500" />
          <h1 className="text-3xl font-bold ml-4">Nahr</h1>
        </div>
        <p className="text-center text-gray-400 mb-8">Connectez-vous à votre espace de gestion.</p>

        {error && <Alert message={error} type="error" onClose={() => setError(null)} />}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 rounded-md font-semibold text-white hover:bg-blue-700 transition-colors duration-200"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}