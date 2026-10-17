export const CATEGORIES = ["Caméras", "Micros", "Éclairage", "Informatique", "Accessoires"] as const;
export type CategoryName = (typeof CATEGORIES)[number];
