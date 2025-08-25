import React from 'react';
import { Product } from '@prisma/client';
import { RecipeWithIngredients } from '@/app/types/prisma';

interface RecipeFormProps {
  isEditing: boolean;
  recipe?: RecipeWithIngredients | null;
  products: Product[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onAddIngredient: () => void;
  onRemoveIngredient: (productId: string) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
  newIngredientId: string;
  setNewIngredientId: (id: string) => void;
  newIngredientQuantity: number;
  setNewIngredientQuantity: (quantity: number) => void;
  editedName: string;
  setEditedName: (name: string) => void;
  editedDescription: string;
  setEditedDescription: (description: string) => void;
  editedIngredients: (RecipeWithIngredients['ingredients'][0] & { product: Product })[];
  ingredientAddError: string | null;
  setIngredientAddError: (error: string | null) => void;
  deletedIngredients: string[];
}

const RecipeForm: React.FC<RecipeFormProps> = ({
  isEditing,
  recipe,
  products,
  onSubmit,
  onCancel,
  onAddIngredient,
  onRemoveIngredient,
  onQuantityChange,
  newIngredientId,
  setNewIngredientId,
  newIngredientQuantity,
  setNewIngredientQuantity,
  editedName,
  setEditedName,
  editedDescription,
  setEditedDescription,
  editedIngredients,
  ingredientAddError,
  setIngredientAddError,
  deletedIngredients,
}) => {
  return (
    <div className="border border-gray-300 p-4 mb-8">
      <h2 className="text-2xl font-bold mb-4">
        {isEditing ? `Modifier la recette : ${recipe?.name}` : 'Ajouter une nouvelle recette'}
      </h2>
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label htmlFor="recipeName" className="block text-gray-700">Nom de la recette</label>
          <input
            id="recipeName"
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="recipeDescription" className="block text-gray-700">Description</label>
          <textarea
            id="recipeDescription"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md h-24"
          />
        </div>
        
        {isEditing && (
          <>
            <h3 className="text-xl font-semibold mt-4 mb-2">Ingrédients</h3>
            <div className="flex items-end gap-4 mb-4">
              <div className="flex-1">
                <label htmlFor="newIngredient" className="block text-gray-700">Ajouter un ingrédient</label>
                <select
                  id="newIngredient"
                  value={newIngredientId}
                  onChange={(e) => {
                    setNewIngredientId(e.target.value);
                    setIngredientAddError(null);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">-- Choisir un produit --</option>
                  {products?.map(product => (
                    <option key={product.id} value={product.id}>{product.name} ({product.unitOfMeasure})</option>
                  ))}
                </select>
              </div>
              <div className="flex-0.3">
                <label htmlFor="newIngredientQuantity" className="block text-gray-700">Quantité</label>
                <input
                  id="newIngredientQuantity"
                  type="number"
                  value={newIngredientQuantity}
                  onChange={(e) => setNewIngredientQuantity(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <button 
                type="button" 
                onClick={onAddIngredient} 
                className="btn-primary p-2"
              >
                +
              </button>
            </div>
            {ingredientAddError && <p className="text-red-500 mt-2">{ingredientAddError}</p>}
            
            {editedIngredients.length > 0 && (
              <ul className="list-none p-0 mt-4 flex flex-wrap gap-3">
                {editedIngredients.map((ingredient, index: number) => {
                  const isBeingDeleted = deletedIngredients.includes(ingredient.productId);
                  return (
                    <li
                      key={ingredient.id || index}
                      className={`flex items-center gap-2 p-2 border border-gray-300 rounded-lg bg-gray-50 ${isBeingDeleted ? 'fade-out' : ''}`}
                    >
                      <span className="font-bold">{products?.find(p => p.id === ingredient.productId)?.name}</span>
                      <input
                        type="number"
                        value={ingredient.quantity}
                        onChange={(e) => onQuantityChange(ingredient.productId, Number(e.target.value))}
                        className="w-16 p-1 text-center border border-gray-300 rounded-md"
                      />
                      <span className="text-gray-600">{products?.find(p => p.id === ingredient.productId)?.unitOfMeasure}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveIngredient(ingredient.productId)}
                        className="btn-icon-danger"
                      >
                        <span role="img" aria-label="Supprimer">❌</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        <div className="mt-6 flex gap-4">
          <button type="submit" className="btn-primary">
            {isEditing ? 'Sauvegarder les modifications' : 'Ajouter la recette'}
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="bg-white text-gray-700 border border-gray-300 font-bold py-3 px-6 rounded-lg cursor-pointer transition-colors duration-300 hover:bg-gray-100"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;