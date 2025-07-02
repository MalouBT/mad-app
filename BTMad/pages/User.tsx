import React, { useState, useMemo } from 'react';
import { Page, User, Recipe, Category } from '../types';
import RecipeCard from '../components/RecipeCard';

interface UserPageProps {
    user: User;
    favoriteRecipes: Recipe[];
    navigate: (page: Page, data?: any) => void;
    categories: Category[];
}

const UserPage: React.FC<UserPageProps> = ({ user, favoriteRecipes, navigate, categories }) => {
    const [filter, setFilter] = useState('all');

    const filteredFavorites = useMemo(() => {
        if (filter === 'all') return favoriteRecipes;
        return favoriteRecipes.filter(recipe => recipe.categoryIds.includes(filter));
    }, [filter, favoriteRecipes]);

    const categoryOptions = useMemo(() => {
        const favoriteCategoryIds = new Set(favoriteRecipes.flatMap(r => r.categoryIds));
        const options = categories.filter(c => favoriteCategoryIds.has(c.id));
        return [{id: 'all', name: 'Alle Favoritter'}, ...options];
    }, [favoriteRecipes, categories]);
    
    return (
        <div className="p-4 md:p-8">
            <button onClick={() => navigate(Page.Welcome)} className="mb-6 text-accent hover:underline">
                 <i className="fas fa-arrow-left mr-2"></i>Tilbage til Velkomst
            </button>
            <div className="flex flex-col items-center mb-8">
                <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full border-4 border-accent object-cover shadow-lg mb-4"/>
                <h1 className="text-4xl font-bold text-light">{user.name}s Favoritter</h1>
            </div>

            {favoriteRecipes.length > 0 && (
                <div className="flex justify-center mb-8">
                    <select 
                        value={filter} 
                        onChange={e => setFilter(e.target.value)}
                        className="bg-light text-primary p-3 rounded-lg shadow"
                        aria-label="Filtrer favoritter efter kategori"
                    >
                        {categoryOptions.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>
            )}
            
            {filteredFavorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredFavorites.map(recipe => (
                        <RecipeCard key={recipe.id} recipe={recipe} onClick={() => navigate(Page.RecipeDetail, { recipe })} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-light mt-8">
                    {user.name} har endnu ikke tilføjet nogen favoritter.
                </p>
            )}
        </div>
    );
};

export default UserPage;