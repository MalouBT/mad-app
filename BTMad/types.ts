export enum Page {
    Welcome,
    FindRecipe,
    RecipeDetail,
    CreateRecipe,
    User,
    Admin
}

export interface Rating {
    userId: string;
    score: number;
}

export interface Ingredient {
    id: string;
    name: string;
    amount: string;
}

export interface Recipe {
    id: string;
    title: string;
    images: string[];
    prepTime: number; // in minutes
    ingredients: Ingredient[];
    instructions: string;
    notes?: string;
    categoryIds: string[];
    authorId: string;
    ratings: Rating[];
}

export interface User {
    id: string;
    name: string;
    avatar: string;
    favorites: string[];
}

export interface Category {
    id: string;
    name: string;
}

export interface Filter {
    category: string;
    time: string;
}

export interface DataBundle {
    recipes: Recipe[];
    users: User[];
    categories: Category[];
}
