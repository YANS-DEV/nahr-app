// src/components/Sidebar.tsx

import Link from 'next/link';
import {
  HomeIcon,
  ShoppingCartIcon,
  BookOpenIcon,
  BeakerIcon,
  ArrowRightStartOnRectangleIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  session: Session | null;
  onLinkClick: () => void;
}

const links = [
  { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
  { name: 'Stock', href: '/dashboard/stock', icon: Square3Stack3DIcon },
  { name: 'Produits', href: '/dashboard/products', icon: ShoppingCartIcon },
  { name: 'Recettes', href: '/dashboard/recipes', icon: BookOpenIcon },
  { name: 'Nouvelle fournée', href: '/dashboard/batches', icon: BeakerIcon },
];

export default function Sidebar({ session, onLinkClick }: SidebarProps) {
  const handleSignOut = async () => {
    // Retirez l'option 'callbackUrl'
    await signOut();
  };

  return (
    <div className="p-4 flex flex-col h-full">
      {/* Informations utilisateur */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-2">
          <span className="text-xl font-bold">{session?.user?.name ? session.user.name.charAt(0) : 'U'}</span>
        </div>
        <p className="font-semibold">{session?.user?.name || 'Utilisateur'}</p>
        <p className="text-sm text-gray-400">{session?.user?.email || 'email@example.com'}</p>
      </div>

      {/* Liens de navigation */}
      <div className="flex flex-col space-y-2 flex-grow">
        {links.map((link) => {
          const LinkIcon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={onLinkClick}
              className={clsx(
                'flex items-center gap-2 p-3 text-sm font-medium rounded-md transition-colors',
                'hover:bg-gray-700 hover:text-white',
                'text-gray-400',
              )}
            >
              <LinkIcon className="w-6 h-6" />
              <p>{link.name}</p>
            </Link>
          );
        })}
      </div>

      {/* Bouton de déconnexion */}
      <div className="mt-auto pt-4">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 p-3 text-sm font-medium rounded-md w-full transition-colors text-red-400 hover:bg-gray-700 hover:text-red-300"
        >
          <ArrowRightStartOnRectangleIcon className="w-6 h-6" />
          <p>Déconnexion</p>
        </button>
      </div>
    </div>
  );
}