import React, { useState } from 'react';

const Settings = () => {
    const [formData, setFormData] = useState({
        url: '',
        modelName: '',
        apiKey: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setMessage('Configuration saved successfully!');
                setFormData({ url: '', modelName: '', apiKey: '' });
            } else {
                setMessage('Failed to save configuration. Please try again.');
            }
        } catch (error) {
            setMessage('Error: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-masterly-creamLight border border-masterly-border rounded-2xl shadow-sm">
            <h1 className="text-2xl font-bold mb-6 text-center text-masterly-navy">Settings</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="url" className="block text-sm font-medium text-masterly-navy mb-1">
                        URL
                    </label>
                    <input
                        type="url"
                        id="url"
                        name="url"
                        value={formData.url}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-masterly-border rounded-lg focus:outline-none focus:ring-2 focus:ring-masterly-orange focus:border-transparent bg-white"
                        placeholder="https://api.example.com"
                    />
                </div>

                <div>
                    <label htmlFor="modelName" className="block text-sm font-medium text-masterly-navy mb-1">
                        Model Name
                    </label>
                    <input
                        type="text"
                        id="modelName"
                        name="modelName"
                        value={formData.modelName}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-masterly-border rounded-lg focus:outline-none focus:ring-2 focus:ring-masterly-orange focus:border-transparent bg-white"
                        placeholder="gpt-4"
                    />
                </div>

                <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium text-masterly-navy mb-1">
                        API Key
                    </label>
                    <input
                        type="password"
                        id="apiKey"
                        name="apiKey"
                        value={formData.apiKey}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-masterly-border rounded-lg focus:outline-none focus:ring-2 focus:ring-masterly-orange focus:border-transparent bg-white"
                        placeholder="sk-..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-masterly-orange text-white py-2 px-4 rounded-full hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-masterly-orange focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Saving...' : 'Save Configuration'}
                </button>
            </form>

            {message && (
                <div className={`mt-4 p-3 rounded-md ${message.includes('successfully')
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default Settings;
