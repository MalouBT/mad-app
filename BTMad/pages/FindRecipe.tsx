import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Page, Recipe, Filter, Category } from '../types';
import RecipeCard from '../components/RecipeCard';

interface FindRecipePageProps {
    navigate: (page: Page, data?: any) => void;
    recipes: Recipe[];
    categories: Category[];
    filters: Filter;
    setFilters: React.Dispatch<React.SetStateAction<Filter>>;
}

const FindRecipePage: React.FC<FindRecipePageProps> = ({ navigate, recipes, categories, filters, setFilters }) => {
    const [displayedCount, setDisplayedCount] = useState(20);
    const observer = useRef<IntersectionObserver | null>(null);
    
    const timeOptions = [
        { value: 'all', label: 'Alle' },
        { value: '15', label: 'Under 15 min' },
        { value: '30', label: 'Under 30 min' },
        { value: '60', label: 'Under 60 min' },
    ];

    const categoryOptions = useMemo(() => [
        { id: 'all', name: 'Alle Kategorier' },
        ...categories
    ], [categories]);
    
    const filteredRecipes = useMemo(() => {
        return recipes.filter(recipe => {
            const categoryMatch = filters.category === 'all' || recipe.categoryIds.includes(filters.category);
            const timeMatch = filters.time === 'all' || recipe.prepTime <= parseInt(filters.time);
            return categoryMatch && timeMatch;
        });
    }, [recipes, filters]);

    const lastRecipeElementRef = useCallback((node: HTMLDivElement) => {
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && displayedCount < filteredRecipes.length) {
                setDisplayedCount(prevCount => prevCount + 20);
            }
        });
        if (node) observer.current.observe(node);
    }, [displayedCount, filteredRecipes.length]);
    
    return (
        <div className="p-4 md:p-8">
            <button onClick={() => navigate(Page.Welcome)} className="mb-6 text-accent hover:underline">
                <i className="fas fa-arrow-left mr-2"></i>Tilbage til Velkomst
            </button>
            <h1 className="text-4xl font-bold text-center mb-8 text-light">Find en Opskrift</h1>

            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4 mb-8 sticky top-0 bg-primary py-4 z-10">
                <div className="w-full md:w-auto">
                    <label htmlFor="category-filter" className="sr-only">Kategori</label>
                    <select
                        id="category-filter"
                        value={filters.category}
                        onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-light text-primary p-3 rounded-lg shadow"
                    >
                        {categoryOptions.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>
                <div className="w-full md:w-auto">
                     <label htmlFor="time-filter" className="sr-only">Tilberedningstid</label>
                    <select
                        id="time-filter"
                        value={filters.time}
                        onChange={e => setFilters(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full bg-light text-primary p-3 rounded-lg shadow"
                    >
                        {timeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRecipes.slice(0, displayedCount).map((recipe, index) => {
                    const props = {
                        key: recipe.id,
                        recipe: recipe,
                        onClick: () => navigate(Page.RecipeDetail, { recipe })
                    };
                    if (index === displayedCount - 1) {
                         return <div ref={lastRecipeElementRef}><RecipeCard {...props} /></div>;
                    }
                    return <RecipeCard {...props} />;
                })}
            </div>
            {recipes.length > 0 && filteredRecipes.length === 0 && <p className="text-center text-light mt-8">Ingen opskrifter fundet med de valgte filtre.</p>}
            {recipes.length === 0 && <p className="text-center text-light mt-8">Der er ingen opskrifter endnu. Opret den første!</p>}
        </div>
    );
};

export default FindRecipePage;