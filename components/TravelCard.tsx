'use client';

import React, { useState, useEffect } from 'react';

interface TravelCardProps {
    airportName: string;
    airportCode: string;
    latitude: number;
    longitude: number;
}

interface RouteInfo {
    duration: number; // en secondes
    distance: number; // en mètres
}

export default function TravelCard({ airportName, airportCode, latitude, longitude }: TravelCardProps) {
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [hasAttempted, setHasAttempted] = useState(false);

    const calculateRoute = async (userLat: number, userLon: number) => {
        try {
            setLoading(true);
            setError(null);

            console.log('Calculating route from:', userLat, userLon, 'to:', latitude, longitude);

            // Vérifier que les coordonnées sont valides
            if (!latitude || !longitude || latitude === 0 || longitude === 0) {
                setError("Coordonnées de l'aéroport non disponibles");
                setLoading(false);
                return;
            }

            // Utiliser OSRM (Open Source Routing Machine) pour calculer le trajet
            const url = `https://router.project-osrm.org/route/v1/driving/${userLon},${userLat};${longitude},${latitude}?overview=false`;
            console.log('OSRM URL:', url);

            const response = await fetch(url);
            const data = await response.json();

            console.log('OSRM Response:', data);

            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                setRouteInfo({
                    duration: data.routes[0].duration,
                    distance: data.routes[0].distance,
                });
                setUserLocation({ lat: userLat, lon: userLon });
            } else {
                console.error('OSRM Error:', data);
                setError(`Impossible de calculer le trajet (${data.code || 'erreur inconnue'})`);
            }
        } catch (err) {
            console.error('Erreur lors du calcul du trajet:', err);
            setError("Erreur de calcul du trajet");
        } finally {
            setLoading(false);
        }
    };

    const requestLocation = () => {
        setHasAttempted(true);

        if (!('geolocation' in navigator)) {
            setError("Géolocalisation non disponible sur votre appareil");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                calculateRoute(userLat, userLon);
            },
            (err) => {
                console.error('Erreur de géolocalisation:', err);
                if (err.code === 1) {
                    setError("Permission refusée. Cliquez pour réessayer.");
                } else if (err.code === 2) {
                    setError("Position indisponible");
                } else {
                    setError("Erreur de géolocalisation");
                }
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // Cache 5 minutes
            }
        );
    };

    useEffect(() => {
        // Vérifier si les coordonnées de l'aéroport sont valides
        if (!latitude || !longitude || latitude === 0 || longitude === 0) {
            setError("Coordonnées de l'aéroport non disponibles");
            return;
        }

        // Tenter automatiquement une fois
        if (!hasAttempted) {
            requestLocation();
        }
    }, [latitude, longitude]);

    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}min`;
        }
        return `${minutes} min`;
    };

    const formatDistance = (meters: number): string => {
        const km = (meters / 1000).toFixed(1);
        return `${km} km`;
    };

    const getTrafficStatus = (duration: number): { text: string; color: string } => {
        // Simple heuristique : si c'est moins de 30 min, c'est fluide
        if (duration < 1800) return { text: "Fluide", color: "text-green-400" };
        if (duration < 3600) return { text: "Modéré", color: "text-yellow-400" };
        return { text: "Dense", color: "text-red-400" };
    };

    const openInMaps = () => {
        if (userLocation) {
            // Ouvrir dans Google Maps
            const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lon}&destination=${latitude},${longitude}&travelmode=driving`;
            window.open(url, '_blank');
        }
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:shadow-2xl hover:shadow-pink-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative z-10">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/20 text-pink-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Trajet vers l'aéroport</h3>
                        <p className="text-sm text-gray-400">Depuis votre position actuelle</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-500 border-t-transparent"></div>
                    </div>
                ) : error ? (
                    <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-4 text-center">
                        <p className="text-sm text-orange-400 mb-3">{error}</p>
                        <button
                            onClick={requestLocation}
                            className="rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 px-4 py-2 text-sm font-semibold text-orange-300 transition-colors flex items-center gap-2 mx-auto"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            Activer la géolocalisation
                        </button>
                    </div>
                ) : routeInfo ? (
                    <>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="rounded-xl bg-black/20 p-3 text-center">
                                <div className="text-xs text-gray-500">Temps estimé</div>
                                <div className="text-xl font-bold text-white">{formatDuration(routeInfo.duration)}</div>
                            </div>
                            <div className="rounded-xl bg-black/20 p-3 text-center">
                                <div className="text-xs text-gray-500">Distance</div>
                                <div className="text-xl font-bold text-white">{formatDistance(routeInfo.distance)}</div>
                            </div>
                            <div className="rounded-xl bg-black/20 p-3 text-center">
                                <div className="text-xs text-gray-500">Trafic</div>
                                <div className={`text-xl font-bold ${getTrafficStatus(routeInfo.duration).color}`}>
                                    {getTrafficStatus(routeInfo.duration).text}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">Destination:</span>
                                <span className="font-semibold text-white">{airportName} ({airportCode})</span>
                            </div>
                            <button
                                onClick={openInMaps}
                                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                                title="Ouvrir dans Google Maps"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                            </button>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}
