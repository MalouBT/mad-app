import React from 'react';
import { Page, User } from '../types';

interface WelcomePageProps {
    navigate: (page: Page, data?: any) => void;
    users: User[];
    currentUser: User | null;
    onSelectUser: (user: User) => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ navigate, users, currentUser, onSelectUser }) => {
    const handleSelectUser = (user: User) => {
        onSelectUser(user);
        navigate(Page.User, { user });
    };
    
    const isUserSelected = !!currentUser;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center text-light">
            <h1 className="text-5xl font-bold mb-4">Velkommen til Mad App</h1>
            <p className="text-xl mb-12">Find inspiration eller del dine egne mesterværker.</p>
            
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 mb-12">
                <button
                    onClick={() => navigate(Page.CreateRecipe)}
                    disabled={!isUserSelected}
                    className="bg-accent text-primary font-bold py-4 px-10 rounded-lg text-lg transition-all duration-300 shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed enabled:hover:bg-opacity-80"
                    aria-disabled={!isUserSelected}
                >
                    Opret Opskrift
                </button>
                <button
                    onClick={() => navigate(Page.FindRecipe)}
                    disabled={!isUserSelected}
                    className="bg-light text-primary font-bold py-4 px-10 rounded-lg text-lg transition-all duration-300 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed enabled:hover:bg-gray-200"
                    aria-disabled={!isUserSelected}
                >
                    Hvad skal vi lave?
                </button>
            </div>

            {!isUserSelected && users.length > 0 && (
                 <p className="text-accent text-lg mb-6 animate-pulse">Vælg din brugerprofil for at fortsætte</p>
            )}

            <div className="w-full max-w-2xl">
                <h2 className="text-2xl font-semibold mb-6">Vores Kokke</h2>
                 {users.length > 0 ? (
                    <div className="flex justify-center flex-wrap gap-6">
                        {users.map(user => (
                            <div 
                                key={user.id} 
                                className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-all duration-200 ${currentUser?.id === user.id ? 'bg-accent/20 scale-110' : 'hover:bg-light/10'}`}
                                onClick={() => onSelectUser(user)}
                                onDoubleClick={() => handleSelectUser(user)}
                                role="button"
                                tabIndex={0}
                                onKeyPress={(e) => e.key === 'Enter' && onSelectUser(user)}
                                aria-label={`Vælg bruger ${user.name}`}
                            >
                                <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-4 border-accent object-cover shadow-md" />
                                <span className="mt-2 text-md font-medium">{user.name}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">Ingen brugere oprettet endnu. Gå til <a href="#/admin" className="text-accent underline">Admin-siden</a> for at oprette den første bruger.</p>
                )}
            </div>
        </div>
    );
};

export default WelcomePage;