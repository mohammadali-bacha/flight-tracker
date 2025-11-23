import React, { useState } from 'react';

interface SearchFormProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
            <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-30 blur transition duration-500 group-hover:opacity-70" />
                <div className="relative flex items-center gap-2 rounded-xl bg-black/80 p-2 ring-1 ring-white/10 backdrop-blur-xl">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value.toUpperCase())}
                        placeholder="Search by flight number (e.g., AA123), airline, or city..."
                        className="flex-1 bg-transparent px-2 py-3 text-base md:text-lg text-white placeholder-gray-500 focus:outline-none min-w-0"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-105 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 md:px-6 md:py-2.5 md:text-base whitespace-nowrap"
                    >
                        {isLoading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-black" />
                        ) : (
                            'Search'
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
