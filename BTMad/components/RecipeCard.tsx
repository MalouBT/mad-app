import React from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
    recipe: Recipe;
    onClick: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
    const averageRating = recipe.ratings.length > 0
        ? (recipe.ratings.reduce((acc, r) => acc + r.score, 0) / recipe.ratings.length).toFixed(1)
        : 'N/A';

    return (
        <div 
            className="w-full bg-light text-primary rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onClick()}
            aria-label={`Se opskriften for ${recipe.title}`}
        >
            <div className="relative">
                <img src={recipe.images[0] || 'https://placehold.co/600x400/0f2d32/75fb9e?text=Billede+mangler'} alt={recipe.title} className="w-full h-48 object-cover" />
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 flex flex-col justify-end p-4">
                     <div className="absolute top-2 right-2 flex items-center space-x-4 bg-primary bg-opacity-70 rounded-full px-3 py-1 text-sm">
                        <div className="flex items-center text-light">
                            <i className="fas fa-star text-accent mr-1"></i>
                            <span>{averageRating}</span>
                        </div>
                        <div className="flex items-center text-light">
                            <i className="fas fa-clock text-accent mr-1"></i>
                            <span>{recipe.prepTime} min</span>
                        </div>
                    </div>
                    <h3 className="text-light font-bold text-xl">{recipe.title}</h3>
                </div>
            </div>
        </div>
    );
};

export default RecipeCard;