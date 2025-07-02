import React, { useState } from 'react';
import { User, Category, Page } from '../types';

interface AdminPageProps {
    users: User[];
    categories: Category[];
    onSaveUser: (user: User) => void;
    onSaveCategory: (category: Category) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ users, categories, onSaveUser, onSaveCategory }) => {
    const [newUserName, setNewUserName] = useState('');
    const [newUserAvatar, setNewUserAvatar] = useState('https://picsum.photos/seed/newuser/100/100');
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserName) return;
        const newUser: User = {
            id: `user-${Date.now()}`,
            name: newUserName,
            avatar: newUserAvatar || `https://picsum.photos/seed/${newUserName}/100/100`,
            favorites: [],
        };
        onSaveUser(newUser);
        setNewUserName('');
        setNewUserAvatar(`https://picsum.photos/seed/newuser${Date.now()}/100/100`);
    };

    const handleCreateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName) return;
        const newCategory: Category = {
            id: `cat-${Date.now()}`,
            name: newCategoryName,
        };
        onSaveCategory(newCategory);
        setNewCategoryName('');
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto text-light">
             <a href="#" onClick={(e) => { e.preventDefault(); window.history.back(); }} className="mb-6 text-accent hover:underline">
                <i className="fas fa-arrow-left mr-2"></i>Tilbage
            </a>
            <h1 className="text-4xl font-bold text-center mb-8">Admin Panel</h1>
            <p className="text-center text-gray-400 mb-12">Denne side er kun tilgængelig via direkte URL. Her kan du tilføje brugere og kategorier til appen.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User Management */}
                <div className="bg-light/10 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4 text-accent">Brugeradministration</h2>
                    
                    <form onSubmit={handleCreateUser} className="mb-6 space-y-4">
                        <input
                            type="text"
                            placeholder="Ny brugers navn"
                            value={newUserName}
                            onChange={e => setNewUserName(e.target.value)}
                            className="w-full p-3 bg-primary border border-gray-600 rounded-lg text-light"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Avatar URL"
                            value={newUserAvatar}
                            onChange={e => setNewUserAvatar(e.target.value)}
                            className="w-full p-3 bg-primary border border-gray-600 rounded-lg text-light"
                        />
                        <button type="submit" className="w-full bg-accent text-primary font-bold py-3 rounded-lg hover:bg-opacity-80 transition-colors">Opret Bruger</button>
                    </form>

                    <h3 className="text-xl font-semibold mb-3">Eksisterende Brugere</h3>
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {users.map(user => (
                            <li key={user.id} className="flex items-center bg-primary p-2 rounded">
                                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mr-4 object-cover"/>
                                <span>{user.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Category Management */}
                <div className="bg-light/10 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4 text-accent">Kategoriadministration</h2>

                    <form onSubmit={handleCreateCategory} className="mb-6 space-y-4">
                        <input
                            type="text"
                            placeholder="Ny kategori"
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                            className="w-full p-3 bg-primary border border-gray-600 rounded-lg text-light"
                            required
                        />
                        <button type="submit" className="w-full bg-accent text-primary font-bold py-3 rounded-lg hover:bg-opacity-80 transition-colors">Opret Kategori</button>
                    </form>

                    <h3 className="text-xl font-semibold mb-3">Eksisterende Kategorier</h3>
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {categories.map(category => (
                            <li key={category.id} className="bg-primary p-2 rounded">
                                {category.name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;