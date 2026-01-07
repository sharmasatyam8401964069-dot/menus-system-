
export interface Macros {
  protein: number;
  carb: number;
  fat: number;
  fiber?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  kcal: number;
  macros: Macros;
  tags?: string[];
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isBestSeller?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  image: string;
  description: string;
  menu: MenuItem[];
}

export enum ViewState {
  HOME = 'HOME',
  RESTAURANT_DETAIL = 'RESTAURANT_DETAIL',
}
