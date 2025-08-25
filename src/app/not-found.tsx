import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
      <h1 className="text-9xl font-extrabold text-gray-700">404</h1>
      <h2 className="text-3xl font-semibold text-gray-800 mt-4 mb-2">Page non trouvée</h2>
      <p className="text-gray-600 text-lg mb-8">
        Désolé, la page que vous recherchez n&apos;existe pas.
      </p>
      <Link href="/dashboard" className="btn-primary">
        Retourner au tableau de bord
      </Link>
    </div>
  );
}