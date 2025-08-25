import { Recipe, RecipeIngredient } from '@prisma/client';
import { Product as PrismaProduct, Category as PrismaCategory } from '@prisma/client';


export type RecipeWithIngredients = Recipe & {
  ingredients: (RecipeIngredient & { product: PrismaProduct })[];
};

export type ProductWithCategory = PrismaProduct & {
  category: PrismaCategory | null;
};

export type ProductPackagingWithProduct = ProductPackaging & {
  product: Product;
};