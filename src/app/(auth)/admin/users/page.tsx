'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { Restaurant, User } from '@prisma/client';

type RestaurantWithChefs = Restaurant & {
  users: User[];
};

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('Échec de la récupération des restaurants');
  }
  return res.json();
});

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [newUserRole, setNewUserRole] = useState('chief');
  const [newRestaurantName, setNewRestaurantName] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showAddRestaurantForm, setShowAddRestaurantForm] = useState(false);

  const shouldFetch = status === 'authenticated' && session?.user?.role === 'admin';

  const { data: restaurants, error: swrError, isLoading, mutate } = useSWR<RestaurantWithChefs[]>(
    shouldFetch ? '/api/admin' : null,
    fetcher
  );

  if (status === 'loading' || isLoading) {
    return <p>Chargement...</p>;
  }

  if (status === 'unauthenticated' || !shouldFetch) {
    router.push('/dashboard');
    return <p>Accès refusé. Vous devez être administrateur.</p>;
  }

  const handlePasswordUpdate = async (userId: string) => {
    if (!password) {
      setError('Le mot de passe ne peut pas être vide.');
      return;
    }
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la mise à jour du mot de passe.');
      }
      alert('Mot de passe mis à jour avec succès.');
      setEditingUserId(null);
      setPassword('');
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Échec de la suppression de l\'utilisateur.');
        }
        alert('Utilisateur supprimé avec succès.');
        mutate(restaurants?.map(rest => ({
          ...rest,
          users: rest.users.filter(user => user.id !== userId),
        })), false);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };
  
  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword || !newUserRole || (newUserRole !== 'admin' && !selectedRestaurantId)) {
      setError('Tous les champs sont requis.');
      return;
    }
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          restaurantId: selectedRestaurantId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de l\'ajout de l\'utilisateur.');
      }
      
      setSuccess('Utilisateur ajouté avec succès !');
      setNewUserEmail('');
      setNewUserPassword('');
      setSelectedRestaurantId('');
      setNewUserRole('chief');
      setError(null);
      mutate();
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddRestaurant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newRestaurantName) {
      setError('Le nom du restaurant est requis.');
      return;
    }

    try {
      const response = await fetch('/api/admin/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName: newRestaurantName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de l\'ajout du restaurant.');
      }
      
      setSuccess('Restaurant ajouté avec succès !');
      setNewRestaurantName('');
      setError(null);
      mutate();
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const generatePassword = () => {
    const simpleChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const specialChars = "!@&"; 
    
    let generatedPassword = "";
    
    for (let i = 0; i < 10; i++) {
        generatedPassword += simpleChars.charAt(Math.floor(Math.random() * simpleChars.length));
    }
    
    for (let i = 0; i < 2; i++) {
        generatedPassword += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    }
    
    generatedPassword = generatedPassword.split('').sort(() => 0.5 - Math.random()).join('');

    setNewUserPassword(generatedPassword);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Gestion des utilisateurs</h1>
      {(error || swrError) && <p style={{ color: 'red' }}>{error || swrError}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => {
            setShowAddRestaurantForm(!showAddRestaurantForm);
            setShowAddUserForm(false);
          }} 
          style={{ padding: '0.75rem', cursor: 'pointer' }}
        >
          {showAddRestaurantForm ? 'Masquer le formulaire' : 'Ajouter un restaurant'}
        </button>
        <button 
          onClick={() => {
            setShowAddUserForm(!showAddUserForm);
            setShowAddRestaurantForm(false);
          }} 
          style={{ padding: '0.75rem', cursor: 'pointer' }}
        >
          {showAddUserForm ? 'Masquer le formulaire' : 'Ajouter un utilisateur'}
        </button>
      </div>

      {showAddRestaurantForm && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem' }}>
          <h2>Ajouter un nouveau restaurant</h2>
          <form onSubmit={handleAddRestaurant}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="restaurantName">Nom du restaurant</label>
              <input
                id="restaurantName"
                type="text"
                value={newRestaurantName}
                onChange={(e) => setNewRestaurantName(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <button type="submit" style={{ padding: '0.75rem', cursor: 'pointer', width: '100%' }}>
              Ajouter le restaurant
            </button>
          </form>
        </div>
      )}

      {showAddUserForm && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem' }}>
          <h2>Ajouter un nouvel utilisateur</h2>
          <form onSubmit={handleAddUser}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="userEmail">Email de l'utilisateur</label>
              <input
                id="userEmail"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="userPassword">Mot de passe</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="userPassword"
                  type="text"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                  style={{ flexGrow: 1, padding: '0.5rem' }}
                />
                <button
                  type="button"
                  onClick={generatePassword}
                  style={{ padding: '0.5rem', cursor: 'pointer' }}
                >
                  Générer
                </button>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="userRole">Rôle</label>
              <select
                id="userRole"
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem' }}
              >
                <option value="chief">Chef</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            {(newUserRole === 'chief' || newUserRole === 'staff') && (
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="selectRestaurant">Sélectionner un restaurant</label>
                <select
                  id="selectRestaurant"
                  value={selectedRestaurantId}
                  onChange={(e) => setSelectedRestaurantId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="">-- Choisir un restaurant --</option>
                  {restaurants?.map(restaurant => (
                    <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
                  ))}
                </select>
              </div>
            )}
            <button type="submit" style={{ padding: '0.75rem', cursor: 'pointer', width: '100%' }}>
              Ajouter l'utilisateur
            </button>
          </form>
        </div>
      )}

      <div>
        <h2>Liste des restaurants et utilisateurs</h2>
        {restaurants?.map((restaurant) => (
          <div key={restaurant.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
            <h3>{restaurant.name}</h3>
            {restaurant.users.length > 0 ? (
              <ul>
                {restaurant.users.map((user) => (
                  <li key={user.id} style={{ marginBottom: '1rem' }}>
                    <strong>{user.email}</strong> ({user.role})
                    
                    {editingUserId === user.id ? (
                      <div>
                        <input
                          type="password"
                          placeholder="Nouveau mot de passe"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          style={{ marginRight: '0.5rem' }}
                        />
                        <button onClick={() => handlePasswordUpdate(user.id)}>Valider</button>
                        <button onClick={() => setEditingUserId(null)} style={{ marginLeft: '0.5rem' }}>Annuler</button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => setEditingUserId(user.id)} style={{ marginLeft: '1rem' }}>Modifier mot de passe</button>
                        <button onClick={() => handleDeleteUser(user.id)} style={{ marginLeft: '0.5rem' }}>Supprimer</button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Pas d'utilisateurs dans ce restaurant.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}