// src/components/DashboardWrapper.tsx

'use client';

import { useState, ReactNode } from 'react';
import { Session } from 'next-auth';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import clsx from 'clsx';

interface DashboardWrapperProps {
  session: Session | null;
  children: ReactNode;
}

export default function DashboardWrapper({ session, children }: DashboardWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex flex-col md:grid md:grid-cols-[256px_1fr] min-h-screen bg-gray-100">
      {/* Bouton d'ouverture et titre de l'application sur mobile */}
      <div className="md:hidden flex justify-between items-center p-4 bg-gray-800 text-white relative">
        <button onClick={toggleSidebar}>
          {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
        <span className="text-xl font-bold tracking-wider absolute left-1/2 -translate-x-1/2">Nahr</span>
      </div>

      {/* Barre latérale (mobile et desktop) */}
      <div
        className={clsx(
          "fixed top-0 left-0 h-full w-64 transform transition-transform z-50",
          "bg-gray-800 text-white shadow-xl",
          {
            "-translate-x-full md:relative md:translate-x-0": !isOpen,
            "translate-x-0": isOpen,
          },
        )}
      >
        <Sidebar session={session} onLinkClick={() => setIsOpen(false)} />
        {/* Bouton de fermeture à l'intérieur de la sidebar pour garantir sa visibilité */}
        {isOpen && (
          <button
            onClick={toggleSidebar}
            className="md:hidden absolute top-4 right-4 text-white z-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Contenu principal */}
      <div className="p-6">
        {children}
      </div>

      {/* Overlay sombre et flou pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" 
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
}