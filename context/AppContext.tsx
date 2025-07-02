
import React, { createContext, useReducer, useEffect, ReactNode, useContext } from 'react';
import { AppState, Action, AppContextType, User, Recipe, Category } from '../types';

const initialUsers: User[] = [
  { id: 'user-1', name: 'Mads', imageUrl: 'https://picsum.photos/seed/mads/100/100', favoriteRecipeIds: ['recipe-1'] },
  { id: 'user-2', name: 'Stine', imageUrl: 'https://picsum.photos/seed/stine/100/100', favoriteRecipeIds: ['recipe-2', 'recipe-3'] },
];

const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Aftensmad' },
  { id: 'cat-2', name: 'Frokost' },
  { id: 'cat-3', name: 'Kage' },
  { id: 'cat-4', name: 'Bagning' },
  { id: 'cat-5', name: 'Hurtigt' },
];

const initialRecipes: Recipe[] = [
  {
    id: 'recipe-1',
    title: 'Klassisk Lasagne',
    imageUrls: ['https://picsum.photos/seed/lasagne/600/400'],
    prepTimeInMinutes: 90,
    ingredients: [
      { id: 'ing-1-1', name: '500g hakket oksekød' },
      { id: 'ing-1-2', name: '1 stort løg' },
      { id: 'ing-1-3', name: '2 fed hvidløg' },
      { id: 'ing-1-4', name: '1 dåse hakkede tomater' },
      { id: 'ing-1-5', name: 'Lasagneplader' },
      { id: 'ing-1-6', name: 'Bechamelsauce' },
      { id: 'ing-1-7', name: 'Revet ost' },
    ],
    instructions: '1. Svits kød, løg og hvidløg. 2. Tilsæt tomater og lad det simre. 3. Saml lasagnen i lag. 4. Bag i ovnen i 45 min ved 200°C.',
    notes: 'Server med en frisk salat.',
    categories: ['cat-1'],
    ratings: [{ userId: 'user-1', score: 9 }, { userId: 'user-2', score: 8 }],
    authorId: 'user-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'recipe-2',
    title: 'Chokoladekage',
    imageUrls: ['https://picsum.photos/seed/kage/600/400'],
    prepTimeInMinutes: 45,
    ingredients: [
      { id: 'ing-2-1', name: '200g mørk chokolade' },
      { id: 'ing-2-2', name: '200g smør' },
      { id: 'ing-2-3', name: '250g sukker' },
      { id: 'ing-2-4', name: '4 æg' },
      { id: 'ing-2-5', name: '150g hvedemel' },
    ],
    instructions: '1. Smelt chokolade og smør. 2. Pisk æg og sukker. 3. Bland det hele sammen. 4. Bag i 30 min ved 180°C.',
    categories: ['cat-3', 'cat-4'],
    ratings: [{ userId: 'user-2', score: 10 }],
    authorId: 'user-2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
   {
    id: 'recipe-3',
    title: 'Avocado Toast',
    imageUrls: ['https://picsum.photos/seed/avocado/600/400'],
    prepTimeInMinutes: 10,
    ingredients: [
      { id: 'ing-3-1', name: '2 skiver rugbrød' },
      { id: 'ing-3-2', name: '1 moden avocado' },
      { id: 'ing-3-3', name: 'Citronsaft' },
      { id: 'ing-3-4', name: 'Salt og peber' },
      { id: 'ing-3-5', name: 'Chiliflager' },
    ],
    instructions: '1. Rist brødet. 2. Mos avocado med en gaffel og smag til med citron, salt og peber. 3. Fordel på brødet og drys med chiliflager.',
    categories: ['cat-2', 'cat-5'],
    ratings: [{ userId: 'user-1', score: 7 }, { userId: 'user-2', score: 8 }],
    authorId: 'user-2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
];

const initialState: AppState = {
  users: initialUsers,
  recipes: initialRecipes,
  categories: initialCategories,
  currentUser: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOAD_STATE':
        return action.payload;
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'ADD_RECIPE':
      return { ...state, recipes: [action.payload, ...state.recipes] };
    case 'UPDATE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.map((r) => (r.id === action.payload.id ? action.payload : r)),
      };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'DELETE_USER':
      return { ...state, users: state.users.filter(u => u.id !== action.payload) };
    case 'ADD_CATEGORY':
        return { ...state, categories: [...state.categories, action.payload] };
    case 'DELETE_CATEGORY':
        return { ...state, categories: state.categories.filter(c => c.id !== action.payload) };
    case 'TOGGLE_FAVORITE': {
      const { userId, recipeId } = action.payload;
      return {
        ...state,
        users: state.users.map((user) => {
          if (user.id === userId) {
            const isFavorite = user.favoriteRecipeIds.includes(recipeId);
            const favoriteRecipeIds = isFavorite
              ? user.favoriteRecipeIds.filter((id) => id !== recipeId)
              : [...user.favoriteRecipeIds, recipeId];
            return { ...user, favoriteRecipeIds };
          }
          return user;
        }),
      };
    }
    case 'RATE_RECIPE': {
      const { userId, recipeId, score } = action.payload;
      return {
        ...state,
        recipes: state.recipes.map((recipe) => {
          if (recipe.id === recipeId) {
            const existingRatingIndex = recipe.ratings.findIndex((r) => r.userId === userId);
            const newRatings = [...recipe.ratings];
            if (existingRatingIndex > -1) {
              newRatings[existingRatingIndex] = { userId, score };
            } else {
              newRatings.push({ userId, score });
            }
            return { ...recipe, ratings: newRatings };
          }
          return recipe;
        }),
      };
    }
    default:
      return state;
  }
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('madApp_state');
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        dispatch({ type: 'LOAD_STATE', payload: parsedState });
      } else {
        // On first load, set a default user
        dispatch({ type: 'SET_CURRENT_USER', payload: initialUsers[0] });
      }
    } catch (error) {
      console.error("Could not load state from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('madApp_state', JSON.stringify(state));
    } catch (error) {
      console.error("Could not save state to localStorage", error);
    }
  }, [state]);
  
  const getAverageRating = (recipeId: string): number => {
    const recipe = state.recipes.find(r => r.id === recipeId);
    if (!recipe || recipe.ratings.length === 0) return 0;
    const sum = recipe.ratings.reduce((acc, rating) => acc + rating.score, 0);
    return Math.round((sum / recipe.ratings.length) * 10) / 10;
  };

  return (
    <AppContext.Provider value={{ state, dispatch, getAverageRating }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
