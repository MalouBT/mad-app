import React, { useState, useEffect } from 'react';
import { Page, Recipe, User } from '../types';

interface RecipeDetailPageProps {
    recipe: Recipe;
    currentUser: User | null;
    onToggleFavorite: (recipeId: string) => void;
    onRate: (recipeId: string, rating: number) => void;
    navigate: (page: Page, data?: any) => void;
}

const RecipeDetailPage: React.FC<RecipeDetailPageProps> = ({ recipe, currentUser, onToggleFavorite, onRate, navigate }) => {
    const [userRating, setUserRating] = useState<number | undefined>(undefined);

    useEffect(() => {
        setUserRating(currentUser ? recipe.ratings.find(r => r.userId === currentUser.id)?.score : undefined);
    }, [recipe, currentUser]);

    const averageRating = recipe.ratings.length > 0
        ? (recipe.ratings.reduce((acc, r) => acc + r.score, 0) / recipe.ratings.length).toFixed(1)
        : 'N/A';
    
    const isFavorite = currentUser ? currentUser.favorites.includes(recipe.id) : false;

    const handleRating = (score: number) => {
        if (!currentUser) return;
        setUserRating(score);
        onRate(recipe.id, score);
    };

    return (
        <div className="bg-primary text-light min-h-screen">
            <div className="relative">
                <img src={recipe.images[0] || 'https://placehold.co/600x400/0f2d32/75fb9e?text=Billede+mangler'} alt={recipe.title} className="w-full h-64 md:h-96 object-cover" />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-primary to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 md:p-8">
                     <h1 className="text-4xl md:text-5xl font-bold text-light">{recipe.title}</h1>
                </div>
                {currentUser && (
                    <button onClick={() => onToggleFavorite(recipe.id)} className="absolute top-4 right-4 text-3xl text-light drop-shadow-lg" aria-label={isFavorite ? 'Fjern fra favoritter' : 'Tilføj til favoritter'}>
                        <i className={`fa-heart ${isFavorite ? 'fa-solid text-accent' : 'fa-regular'}`}></i>
                    </button>
                )}
            </div>
            
            <div className="p-4 md:p-8">
                <div className="flex items-center flex-wrap gap-x-6 gap-y-2 border-b border-gray-700 pb-4 mb-6">
                    <div className="flex items-center text-lg">
                        <i className="fas fa-star text-accent mr-2"></i>
                        <span>{averageRating} / 10 ({recipe.ratings.length} stemmer)</span>
                    </div>
                    <div className="flex items-center text-lg">
                        <i className="fas fa-clock text-accent mr-2"></i>
                        <span>{recipe.prepTime} minutter</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <h2 className="text-2xl font-bold mb-4 text-accent">Ingredienser</h2>
                        <ul className="space-y-2">
                            {recipe.ingredients.map(ing => (
                                <li key={ing.id} className="flex justify-between">
                                    <span>{ing.name}</span>
                                    <span className="text-gray-400">{ing.amount}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-bold mb-4 text-accent">Fremgangsmåde</h2>
                        <p className="whitespace-pre-wrap leading-relaxed">{recipe.instructions}</p>
                        {recipe.notes && (
                            <>
                                <h3 className="text-xl font-bold mt-6 mb-2 text-accent">Noter</h3>
                                <p className="text-gray-300 italic">{recipe.notes}</p>
                            </>
                        )}
                    </div>
                </div>

                {currentUser && (
                    <div className="mt-8 border-t border-gray-700 pt-6">
                        <h3 className="text-xl font-bold mb-4 text-center text-accent">Giv din bedømmelse</h3>
                        <div className="flex justify-center items-center space-x-1 md:space-x-2 flex-wrap gap-y-2">
                            {[...Array(11).keys()].map(i => (
                                <button 
                                    key={i}
                                    onClick={() => handleRating(i)} 
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors duration-200 ${userRating === i ? 'bg-accent text-primary' : 'bg-gray-700 text-light hover:bg-accent hover:text-primary'}`}
                                    aria-label={`Giv bedømmelsen ${i}`}
                                >
                                    {i}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-12 flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                     <button onClick={() => navigate(Page.FindRecipe)} className="bg-gray-700 text-light font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors">
                        <i className="fas fa-arrow-left mr-2"></i> Tilbage til Opskrifter
                    </button>
                    {currentUser && (
                        <button onClick={() => navigate(Page.CreateRecipe, { recipe })} className="bg-accent text-primary font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors">
                            <i className="fas fa-edit mr-2"></i> Rediger Opskrift
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipeDetailPage;