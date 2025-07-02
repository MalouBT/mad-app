import React, { useState, useEffect, useCallback } from 'react';
import { Page, Recipe, User, Category, Filter, DataBundle } from './types';
import * as driveService from './services/driveService';
import WelcomePage from './pages/Welcome';
import FindRecipePage from './pages/FindRecipe';
import RecipeDetailPage from './pages/RecipeDetail';
import CreateRecipePage from './pages/CreateRecipe';
import UserPage from './pages/User';
import AdminPage from './pages/Admin';
import ConfigurationPage from './pages/Configuration';

const App: React.FC = () => {
    // Config, Auth, and data loading state
    const [isConfigured, setIsConfigured] = useState(false);
    const [isDriveReady, setIsDriveReady] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fileId, setFileId] = useState<string | null>(null);

    // App data state
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    
    // Navigation and selection state
    const [currentPage, setCurrentPage] = useState<Page>(Page.Welcome);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null); 
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
    const [findRecipeFilters, setFindRecipeFilters] = useState<Filter>({ category: 'all', time: 'all' });

    // --- Config and Initialization Flow ---
    useEffect(() => {
        const storedApiKey = localStorage.getItem('btmad_apiKey');
        const storedClientId = localStorage.getItem('btmad_clientId');
        if (storedApiKey && storedClientId) {
            driveService.configure({ apiKey: storedApiKey, clientId: storedClientId });
            setIsConfigured(true);
        } else {
            setIsLoading(false);
        }
    }, []);

    const handleSaveConfig = (apiKey: string, clientId: string) => {
        localStorage.setItem('btmad_apiKey', apiKey);
        localStorage.setItem('btmad_clientId', clientId);
        driveService.configure({ apiKey, clientId });
        setIsConfigured(true);
        setIsLoading(true); // Start loading process after config
    };
    
    useEffect(() => {
        if (!isConfigured) return;

        const init = async () => {
            try {
                await driveService.initClient((loggedIn) => {
                    setIsDriveReady(true);
                    setIsLoggedIn(loggedIn);
                    if (!loggedIn) {
                        setIsLoading(false);
                    }
                });
            } catch (err) {
                console.error("Initialization error", err);
                setError("Kunne ikke initialisere Google-integration. Tjek konsollen for detaljer og om dine API-nøgler er korrekte.");
                setIsLoading(false);
            }
        };
        init();
    }, [isConfigured]);
    
    useEffect(() => {
        if (!isLoggedIn || !isDriveReady) return;

        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const { fileId: foundFileId, data } = await driveService.findOrCreateDataFile();
                setFileId(foundFileId);
                if (data) {
                    setRecipes(data.recipes || []);
                    setUsers(data.users || []);
                    setCategories(data.categories || []);
                }
            } catch (err) {
                console.error("Error loading data from Drive", err);
                setError("Kunne ikke hente data fra Google Drev. Delte du filen korrekt?");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [isLoggedIn, isDriveReady]);

    // --- Data Persistence ---
    const saveData = useCallback(async (newData: Partial<DataBundle>) => {
        if (!fileId) {
            console.error("Save attempted without a fileId");
            setError("Kan ikke gemme: Ingen datafil fundet.");
            return;
        }
        const fullData: DataBundle = {
            recipes: newData.recipes !== undefined ? newData.recipes : recipes,
            users: newData.users !== undefined ? newData.users : users,
            categories: newData.categories !== undefined ? newData.categories : categories,
        };
        try {
            await driveService.saveData(fileId, fullData);
        } catch (e) {
            console.error("Failed to save data to drive", e);
            setError("Der skete en fejl under gem. Prøv igen.");
        }
    }, [fileId, recipes, users, categories]);


    // --- Auth Flow ---
    const handleLogin = useCallback(() => {
        driveService.requestToken(() => {
            setIsLoggedIn(true);
        });
    }, []);

    // Handle Admin page via URL hash
    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash === '#/admin') {
                setCurrentPage(Page.Admin);
            }
        };
        window.addEventListener('hashchange', handleHashChange, false);
        handleHashChange();
        return () => window.removeEventListener('hashchange', handleHashChange, false);
    }, []);


    // --- State Update Handlers ---
    const navigate = (page: Page, data?: any) => {
        if (page === Page.RecipeDetail && data?.recipe) setSelectedRecipe(data.recipe);
        if (page === Page.User && data?.user) setSelectedUser(data.user);
        if (page === Page.CreateRecipe && data?.recipe) {
            setEditingRecipe(data.recipe);
        } else {
            setEditingRecipe(null);
        }
        setCurrentPage(page);
    };

    const handleSaveRecipe = (recipe: Recipe) => {
        const existingIndex = recipes.findIndex(r => r.id === recipe.id);
        let updatedRecipes;
        if (existingIndex > -1) {
            updatedRecipes = recipes.map(r => r.id === recipe.id ? recipe : r);
        } else {
            updatedRecipes = [recipe, ...recipes];
        }
        setRecipes(updatedRecipes);
        saveData({ recipes: updatedRecipes });
        navigate(Page.RecipeDetail, { recipe });
    };

    const handleToggleFavorite = useCallback((recipeId: string) => {
        if (!selectedUser) return;
        const isFavorite = selectedUser.favorites.includes(recipeId);
        const updatedFavorites = isFavorite ? selectedUser.favorites.filter(id => id !== recipeId) : [...selectedUser.favorites, recipeId];
        const updatedUser = { ...selectedUser, favorites: updatedFavorites };
        
        const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
        setUsers(updatedUsers);
        setSelectedUser(updatedUser);
        saveData({ users: updatedUsers });
    }, [selectedUser, users, saveData]);

    const handleRateRecipe = (recipeId: string, rating: number) => {
        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe || !selectedUser) return;
        const newRating = { userId: selectedUser.id, score: rating };
        const existingRatingIndex = recipe.ratings.findIndex(r => r.userId === selectedUser.id);
        
        let updatedRatings = [...recipe.ratings];
        if (existingRatingIndex > -1) {
            updatedRatings[existingRatingIndex] = newRating;
        } else {
            updatedRatings.push(newRating);
        }
        
        const updatedRecipe = { ...recipe, ratings: updatedRatings };
        const updatedRecipes = recipes.map(r => r.id === recipeId ? updatedRecipe : r);
        setRecipes(updatedRecipes);
setSelectedRecipe(updatedRecipe);
        saveData({ recipes: updatedRecipes });
    };

    const handleSaveUser = (user: User) => {
        const updatedUsers = [...users, user];
        setUsers(updatedUsers);
        saveData({ users: updatedUsers });
    };
    
    const handleSaveCategory = (category: Category) => {
        const updatedCategories = [...categories, category];
        setCategories(updatedCategories);
        saveData({ categories: updatedCategories });
    };
    
    // --- Render Logic ---
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-light" aria-live="polite">
                <i className="fas fa-spinner fa-spin text-4xl text-accent"></i>
                <p className="mt-4 text-lg">Initialiserer...</p>
            </div>
        );
    }
    
    if (!isConfigured) {
        return <ConfigurationPage onSave={handleSaveConfig} />;
    }

    if (!isLoggedIn) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center text-light">
                 <h1 className="text-5xl font-bold mb-4">Velkommen til Mad App</h1>
                 <p className="text-xl mb-12">Log ind med din Google-konto for at få adgang til dine opskrifter.</p>
                 <button onClick={handleLogin} className="bg-accent text-primary font-bold py-4 px-10 rounded-lg text-lg hover:bg-opacity-80 transition-colors duration-300 shadow-lg">
                    <i className="fab fa-google mr-3"></i> Log ind med Google
                 </button>
            </div>
        );
    }
    
    if (error) {
        return <div className="p-8 text-center text-red-400">
            <h2 className="text-2xl font-bold">Der opstod en fejl</h2>
            <p className="mt-2">{error}</p>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="mt-4 bg-accent text-primary font-bold py-2 px-4 rounded-lg">Nulstil konfiguration og prøv igen</button>
        </div>
    }

    const renderPage = () => {
        switch (currentPage) {
            case Page.Welcome:
                return <WelcomePage navigate={navigate} users={users} onSelectUser={setSelectedUser} currentUser={selectedUser} />;
            case Page.FindRecipe:
                return <FindRecipePage navigate={navigate} recipes={recipes} categories={categories} filters={findRecipeFilters} setFilters={setFindRecipeFilters} />;
            case Page.RecipeDetail:
                if (selectedRecipe) {
                    return <RecipeDetailPage recipe={selectedRecipe} currentUser={selectedUser} onToggleFavorite={handleToggleFavorite} onRate={handleRateRecipe} navigate={navigate} />;
                }
                return <WelcomePage navigate={navigate} users={users} onSelectUser={setSelectedUser} currentUser={selectedUser} />;
            case Page.CreateRecipe:
                return <CreateRecipePage onSave={handleSaveRecipe} navigate={navigate} existingRecipe={editingRecipe} categories={categories} currentUser={selectedUser} />;
            case Page.User:
                if (selectedUser) {
                    const userRecipes = recipes.filter(r => selectedUser.favorites.includes(r.id));
                    return <UserPage user={selectedUser} favoriteRecipes={userRecipes} navigate={navigate} categories={categories} />;
                }
                return <WelcomePage navigate={navigate} users={users} onSelectUser={setSelectedUser} currentUser={selectedUser} />;
            case Page.Admin:
                return <AdminPage onSaveUser={handleSaveUser} onSaveCategory={handleSaveCategory} categories={categories} users={users} />;
            default:
                return <WelcomePage navigate={navigate} users={users} onSelectUser={setSelectedUser} currentUser={selectedUser} />;
        }
    };

    return <div className="min-h-screen bg-primary font-sans">{renderPage()}</div>;
};

export default App;
