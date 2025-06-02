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

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export const getAllCategories = (): readonly string[] => ITEM_CATEGORIES;

export const isValidCategory = (category: string): category is ItemCategory => {
  return ITEM_CATEGORIES.includes(category as ItemCategory);
};
