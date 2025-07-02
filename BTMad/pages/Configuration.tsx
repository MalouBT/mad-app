import React, { useState } from 'react';

interface ConfigurationPageProps {
    onSave: (apiKey: string, clientId: string) => void;
}

const ConfigurationPage: React.FC<ConfigurationPageProps> = ({ onSave }) => {
    const [apiKey, setApiKey] = useState('');
    const [clientId, setClientId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey && clientId) {
            onSave(apiKey, clientId);
        } else {
            alert('Udfyld venligst begge felter.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-light">
            <div className="max-w-2xl w-full bg-light/10 p-8 rounded-lg shadow-2xl">
                <h1 className="text-3xl font-bold text-center mb-4 text-accent">Opsætning af App</h1>
                <p className="text-center mb-6 text-gray-300">
                    For at denne app kan forbinde sikkert til dit Google Drev, skal den bruge dine personlige API-nøgler.
                    Disse nøgler gemmes **kun** lokalt i din browser og bliver aldrig delt.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="api-key" className="block text-sm font-bold mb-2 text-gray-200">Google API Key</label>
                        <input
                            id="api-key"
                            type="text"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Indtast din API Key"
                            className="w-full p-3 bg-primary border border-gray-600 rounded-lg text-light"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="client-id" className="block text-sm font-bold mb-2 text-gray-200">Google Client ID</label>
                        <input
                            id="client-id"
                            type="text"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            placeholder="Indtast dit Client ID"
                            className="w-full p-3 bg-primary border border-gray-600 rounded-lg text-light"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-accent text-primary font-bold py-3 rounded-lg hover:bg-opacity-80 transition-colors"
                    >
                        Gem og fortsæt
                    </button>
                </form>

                <div className="mt-8 text-sm text-gray-400 border-t border-gray-700 pt-4">
                    <h3 className="font-bold text-light mb-2">Hvorfor er dette nødvendigt?</h3>
                    <p>
                        Ved at bruge dine egne nøgler sikrer du, at kun du (og dem du deler med) har kontrol over appens adgang til Google Drev.
                        Du kan oprette nøglerne gratis på <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-accent underline">Google Cloud Console</a>.
                        Husk at tilføje din app-URL (f.eks. `https://DIT-NAVN.github.io`) til de "Autoriserede JavaScript-oprindelser" for dit Client ID.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConfigurationPage;
