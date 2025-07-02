import React, { useState, useEffect } from 'react';
import { Page, Recipe, Category, Ingredient, User } from '../types';

interface CreateRecipePageProps {
    onSave: (recipe: Recipe) => void;
    navigate: (page: Page, data?: any) => void;
    existingRecipe?: Recipe | null;
    categories: Category[];
    currentUser: User | null;
}

const CreateRecipePage: React.FC<CreateRecipePageProps> = ({ onSave, navigate, existingRecipe, categories, currentUser }) => {
    const [title, setTitle] = useState('');
    const [images, setImages] = useState<string[]>(['']);
    const [prepTime, setPrepTime] = useState(30);
    const [ingredients, setIngredients] = useState<Ingredient[]>([{ id: `ing-${Date.now()}`, name: '', amount: '' }]);
    const [instructions, setInstructions] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    useEffect(() => {
        if (existingRecipe) {
            setTitle(existingRecipe.title);
            setImages(existingRecipe.images.length > 0 ? existingRecipe.images : ['']);
            setPrepTime(existingRecipe.prepTime);
            setIngredients(existingRecipe.ingredients);
            setInstructions(existingRecipe.instructions);
            setNotes(existingRecipe.notes || '');
            setSelectedCategories(existingRecipe.categoryIds);
        }
    }, [existingRecipe]);
    
    useEffect(() => {
        if (!currentUser) {
            alert("Du skal vælge en brugerprofil på forsiden for at kunne oprette eller redigere en opskrift.");
            navigate(Page.Welcome);
        }
    }, [currentUser, navigate]);

    const handleAddIngredient = () => {
        setIngredients([...ingredients, { id: `ing-${Date.now()}`, name: '', amount: '' }]);
    };
    
    const handleIngredientChange = (index: number, field: 'name' | 'amount', value: string) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setIngredients(newIngredients);
    };

    const handleRemoveIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const handleCategoryToggle = (categoryId: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };
    
    const handleSave = () => {
        if (!currentUser) {
            alert('Vælg venligst en brugerprofil først.');
            return;
        }
        if (!title || !instructions || ingredients.some(i => !i.name)) {
            alert('Udfyld venligst titel, fremgangsmåde og alle ingrediensnavne.');
            return;
        }

        const recipeToSave: Recipe = {
            id: existingRecipe?.id || `recipe-${Date.now()}`,
            title,
            images,
            prepTime,
            ingredients: ingredients.filter(i => i.name.trim() !== ''),
            instructions,
            notes,
            categoryIds: selectedCategories,
            authorId: existingRecipe?.authorId || currentUser.id,
            ratings: existingRecipe?.ratings || [],
        };
        
        onSave(recipeToSave);
    };
    
    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
             <button onClick={() => navigate(Page.Welcome)} className="mb-6 text-accent hover:underline">
                <i className="fas fa-arrow-left mr-2"></i>Tilbage til Velkomst
            </button>
            <h1 className="text-4xl font-bold text-center mb-8 text-light">
                {existingRecipe ? 'Rediger Opskrift' : 'Opret ny Opskrift'}
            </h1>
            
            <div className="space-y-6 bg-light text-primary p-6 rounded-lg shadow-xl">
                <div>
                    <label className="block text-lg font-bold mb-2" htmlFor="title">Titel</label>
                    <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg"/>
                </div>

                <div>
                    <label className="block text-lg font-bold mb-2">Billeder</label>
                    <div className="flex items-center space-x-4">
                        <img src={images[0] || 'https://placehold.co/400x400/0f2d32/75fb9e?text=Billede'} alt="Recipe" className="w-32 h-32 object-cover rounded-lg" />
                        <div>
                            <input type="text" placeholder="Indsæt billed-URL" value={images[0]} onChange={(e) => setImages([e.target.value])} className="w-full p-2 border border-gray-300 rounded-lg mb-2" />
                            <p className="text-sm text-gray-500">Kamera-upload er ikke implementeret endnu. Indsæt en URL til et billede.</p>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-lg font-bold mb-2" htmlFor="prepTime">Arbejdstid (minutter)</label>
                    <input id="prepTime" type="number" value={prepTime} onChange={e => setPrepTime(parseInt(e.target.value, 10))} className="w-full p-3 border border-gray-300 rounded-lg"/>
                </div>

                <div>
                    <h3 className="text-lg font-bold mb-2">Ingredienser</h3>
                    {ingredients.map((ing, index) => (
                        <div key={ing.id} className="flex items-center space-x-2 mb-2">
                            <input type="text" placeholder="Mængde" value={ing.amount} onChange={e => handleIngredientChange(index, 'amount', e.target.value)} className="w-1/3 p-2 border border-gray-300 rounded-lg" aria-label={`Mængde for ingrediens ${index + 1}`} />
                            <input type="text" placeholder="Ingrediens" value={ing.name} onChange={e => handleIngredientChange(index, 'name', e.target.value)} className="w-2/3 p-2 border border-gray-300 rounded-lg" aria-label={`Navn for ingrediens ${index + 1}`} />
                            <button onClick={() => handleRemoveIngredient(index)} className="text-red-500 hover:text-red-700 p-2" aria-label={`Fjern ingrediens ${index + 1}`}><i className="fas fa-trash"></i></button>
                        </div>
                    ))}
                    <button onClick={handleAddIngredient} className="mt-2 bg-primary text-light font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">+ Tilføj ingrediens</button>
                </div>

                <div>
                    <label className="block text-lg font-bold mb-2" htmlFor="instructions">Fremgangsmåde</label>
                    <textarea id="instructions" value={instructions} onChange={e => setInstructions(e.target.value)} rows={8} className="w-full p-3 border border-gray-300 rounded-lg"/>
                </div>
                
                <div>
                    <label className="block text-lg font-bold mb-2" htmlFor="notes">Noter (valgfri)</label>
                    <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full p-3 border border-gray-300 rounded-lg"/>
                </div>
                
                <div>
                    <h3 className="text-lg font-bold mb-2">Kategorier</h3>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => handleCategoryToggle(cat.id)}
                                className={`py-2 px-4 rounded-full font-semibold transition-colors ${selectedCategories.includes(cat.id) ? 'bg-accent text-primary' : 'bg-gray-200 text-gray-700'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                    <button onClick={() => navigate(existingRecipe ? Page.RecipeDetail : Page.Welcome, {recipe: existingRecipe})} className="bg-gray-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors">Annuller</button>
                    <button onClick={handleSave} className="bg-accent text-primary font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors">Gem Opskrift</button>
                </div>
            </div>
        </div>
    );
};

export default CreateRecipePage;