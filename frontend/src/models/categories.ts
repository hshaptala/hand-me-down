// Item categories used throughout the application
export const ITEM_CATEGORIES = [
  "Electronics",
  "Furniture", 
  "Clothing",
  "Books",
  "Sports",
  "Home & Garden",
  "Toys & Games",
  "Kitchen",
  "Office Supplies",
  "Other",
] as const;

export type ItemCategory = typeof ITEM_CATEGORIES[number];

// Helper function to get all categories
export const getAllCategories = (): readonly string[] => ITEM_CATEGORIES;

// Helper function to check if a category is valid
export const isValidCategory = (category: string): category is ItemCategory => {
  return ITEM_CATEGORIES.includes(category as ItemCategory);
};
