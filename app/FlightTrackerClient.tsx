'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchForm from '@/components/SearchForm';
import FlightCard from '@/components/FlightCard';
import TravelCard from '@/components/TravelCard';
import WeatherCard from '@/components/WeatherCard';
import { Flight } from '@/app/api/flights/route';

// Generate date options for yesterday, today, tomorrow
function getDateOptions() {
    const today = new Date();
    const dates = [];
    
    for (let i = -1; i <= 1; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        let label = '';
        if (i === -1) label = 'Hier';
        else if (i === 0) label = "Aujourd'hui";
        else if (i === 1) label = 'Demain';
        
        const shortLabel = date.toLocaleDateString('fr-FR', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
        });
        
        dates.push({ value: dateStr, label, shortLabel });
    }
    
    return dates;
}

export default function FlightTrackerClient() {
    const [flights, setFlights] = useState<Flight[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [currentQuery, setCurrentQuery] = useState<string>('');
    
    const dateOptions = getDateOptions();

    // Wrap the search logic in a component that uses useSearchParams
    const SearchController = () => {
        const searchParams = useSearchParams();

        useEffect(() => {
            const query = searchParams.get('flight') || searchParams.get('q');
            if (query && !hasSearched) {
                handleSearch(query);
            }
        }, [searchParams]);

        return null;
    };

    const handleSearch = async (query: string, date?: string) => {
        setIsLoading(true);
        setHasSearched(true);
        setCurrentQuery(query);
        
        // Use provided date or current selectedDate
        const searchDate = date || selectedDate;
        
        try {
            const url = `/api/flights?query=${encodeURIComponent(query)}&date=${searchDate}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                console.error('API error:', data.error);
                setFlights([]);
            } else if (Array.isArray(data)) {
                setFlights(data);
            } else {
                setFlights([]);
            }
        } catch (error) {
            console.error('Failed to fetch flights:', error);
            setFlights([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        if (currentQuery) {
            handleSearch(currentQuery, date);
        }
    };

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
            <Suspense fallback={null}>
                <SearchController />
            </Suspense>
            {/* Background Effects */}
            <div className="absolute -left-4 top-0 h-96 w-96 rounded-full bg-purple-500/20 blur-[128px]" />
            <div className="absolute -right-4 bottom-0 h-96 w-96 rounded-full bg-blue-500/20 blur-[128px]" />

            <div className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center gap-8 mx-auto">
                {/* Header */}
                <div className="text-center">
                    <div className="mb-4 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
                        <span className="mr-2 text-lg">✈️</span>
                        <span className="text-sm font-medium text-white">Voyages de Céline</span>
                    </div>
                    <h1 className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-5xl font-bold text-transparent sm:text-6xl">
                        Infos de vol pour mon impératrice
                    </h1>
                    <p className="mt-4 text-lg text-gray-400">
                        {flights.length > 0
                            ? `Ton vol ${flights[0].flightNumber} est affiché ci-dessous. Tu peux chercher un autre vol ici :`
                            : "Entre ton numéro de vol pour voir les détails et ton trajet."
                        }
                    </p>
                </div>

                {/* Search */}
                <div className="w-full max-w-2xl">
                    <SearchForm onSearch={handleSearch} isLoading={isLoading} />
                </div>
                
                {/* Date Selector - Show when we have a query */}
                {currentQuery && (
                    <div className="flex gap-2 justify-center flex-wrap">
                        {dateOptions.map((dateOption) => (
                            <button
                                key={dateOption.value}
                                type="button"
                                onClick={() => handleDateSelect(dateOption.value)}
                                disabled={isLoading}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    selectedDate === dateOption.value
                                        ? 'bg-white text-black shadow-lg'
                                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-xs opacity-70">{dateOption.label}</span>
                                    <span className="text-xs font-semibold">{dateOption.shortLabel}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Results */}
                <div className="w-full space-y-6">
                    {isLoading ? (
                        <div className="flex flex-col gap-4">
                            <div className="h-64 w-full animate-pulse rounded-2xl bg-white/5" />
                        </div>
                    ) : hasSearched && flights.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
                            <p className="text-lg text-gray-400">Aucun vol trouvé pour cette recherche.</p>
                        </div>
                    ) : (
                        flights.map((flight) => (
                            <div key={flight.id} className="grid gap-6 lg:grid-cols-3">
                                <div className="lg:col-span-3">
                                    <FlightCard flight={flight} />
                                </div>
                                <div className="lg:col-span-1">
                                    <TravelCard
                                        airportName={flight.origin.city}
                                        airportCode={flight.origin.code}
                                        latitude={flight.origin.latitude}
                                        longitude={flight.origin.longitude}
                                    />
                                </div>
                                <div className="lg:col-span-1">
                                    <WeatherCard
                                        city={flight.destination.city}
                                        latitude={flight.destination.latitude}
                                        longitude={flight.destination.longitude}
                                    />
                                </div>
                                <div className="lg:col-span-1">
                                    <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:shadow-2xl hover:shadow-pink-500/10 flex flex-col justify-between">
                                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                                        <div className="relative z-10">
                                            <div className="mb-4 flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/20 text-pink-400">
                                                    <span className="text-xl">❤️</span>
                                                </div>
                                                <h3 className="text-lg font-semibold text-white">
                                                    {flight.status === 'Landed' ? 'Bien arrivée ?' :
                                                        flight.status === 'In Air' ? 'Je pense à toi' :
                                                            'Bon voyage mon amour'}
                                                </h3>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs">✓</div>
                                                    <span>Passeport & Billets</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs">✓</div>
                                                    <span>Tél, Mac & Chargeurs</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs">✓</div>
                                                    <span>Écouteurs & Playlist</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs">✓</div>
                                                    <span>Pastilles d'hydratation</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs">✓</div>
                                                    <span>Vitamines & Magnésium</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs">✓</div>
                                                    <span>M'envoyer un bisou</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative z-10 mt-6">
                                            <a
                                                href={`https://www.flightradar24.com/data/flights/${flight.flightNumber.replace(/\s/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                                            >
                                                <span>🌍 Suivre sur la carte</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
