
export interface Ingredient {
  id: string;
  name: string;
}

export interface Rating {
  userId: string;
  score: number; // 0-10
}

export interface Recipe {
  id: string;
  title: string;
  imageUrls: string[];
  prepTimeInMinutes: number;
  ingredients: Ingredient[];
  instructions: string;
  notes?: string;
  categories: string[]; // array of category ids
  ratings: Rating[];
  authorId: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  imageUrl: string;
  favoriteRecipeIds: string[];
}

export interface Category {
  id: string;
  name: string;
}

export interface AppState {
  users: User[];
  recipes: Recipe[];
  categories: Category[];
  currentUser: User | null;
}

export type Action =
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'SET_CURRENT_USER'; payload: User }
  | { type: 'ADD_RECIPE'; payload: Recipe }
  | { type: 'UPDATE_RECIPE'; payload: Recipe }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: { userId: string; recipeId: string } }
  | { type: 'RATE_RECIPE'; payload: { userId: string; recipeId: string; score: number } };

export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getAverageRating: (recipeId: string) => number;
}
