'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchForm from '@/components/SearchForm';
import FlightCard from '@/components/FlightCard';
import TravelCard from '@/components/TravelCard';
import WeatherCard from '@/components/WeatherCard';
import { Flight } from '@/app/api/flights/route';

export default function FlightTrackerClient() {
    const [flights, setFlights] = useState<Flight[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

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

    const handleSearch = async (query: string) => {
        setIsLoading(true);
        setHasSearched(true);
        try {
            const response = await fetch(`/api/flights?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            setFlights(data);
        } catch (error) {
            console.error('Failed to fetch flights:', error);
            setFlights([]);
        } finally {
            setIsLoading(false);
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

            <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-8">
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
                <SearchForm onSearch={handleSearch} isLoading={isLoading} />

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
                                    {/* Placeholder for future feature or empty space */}
                                    <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:shadow-2xl hover:shadow-purple-500/10 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-3xl mb-2">❤️</div>
                                            <p className="text-sm text-gray-400">Bon voyage ma vie d'amour</p>
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
