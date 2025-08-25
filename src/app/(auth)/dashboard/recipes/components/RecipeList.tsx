import { useState } from 'react';
import { RecipeWithIngredients } from '@/app/types/prisma';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'; // Importez les icônes nécessaires

interface RecipeListProps {
  recipes: RecipeWithIngredients[];
  onEdit: (recipe: RecipeWithIngredients) => void;
  onDelete: (recipeId: string) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const filteredRecipes = recipes?.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Liste des recettes ({filteredRecipes.length})</h2>
      <input
        type="text"
        placeholder="Rechercher une recette..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md mb-4"
      />
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="bg-white rounded-lg shadow-md p-4 mb-2">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <strong className="text-lg">{recipe.name}</strong>
                  <p className="text-gray-500 text-sm line-clamp-2">{recipe.description}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onEdit(recipe)} 
                    className="p-2 text-blue-500 hover:text-blue-700 cursor-pointer"
                    aria-label="Modifier la recette"
                  >
                    <PencilSquareIcon className="h-6 w-6" />
                  </button>
                  <button 
                    onClick={() => onDelete(recipe.id)} 
                    className="p-2 text-red-500 hover:text-red-700 cursor-pointer"
                    aria-label="Supprimer la recette"
                  >
                    <TrashIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <strong className="block mb-2">Ingrédients :</strong>
                <ul className="flex flex-wrap gap-2">
                  {recipe.ingredients?.length > 0 ? (
                    recipe.ingredients.map(ingredient => (
                      <li key={ingredient.id} className="bg-gray-200 text-gray-700 py-1 px-2 rounded-md text-sm">
                        {ingredient.quantity} {ingredient.product.unitOfMeasure} de {ingredient.product.name}
                      </li>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">Aucun ingrédient ajouté.</span>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Aucune recette trouvée.</p>
      )}
    </div>
  );
};

export default RecipeList;