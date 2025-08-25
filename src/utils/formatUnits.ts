import { Product } from '@prisma/client';

export const formatUnits = (quantity: number, unit: Product['unitOfMeasure']): string => {
  if (unit === 'g') {
    if (quantity >= 1000) {
      return `${quantity / 1000}kg`;
    }
    return `${quantity}g`;
  }

  if (unit === 'mL') {
    if (quantity >= 1000) {
      return `${quantity / 1000}L`;
    }
    return `${quantity}mL`;
  }

  return `${quantity} unité(s)`;
};