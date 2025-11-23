import React from 'react';
import { Flight } from '@/app/api/flights/route';

interface FlightCardProps {
    flight: Flight;
}

export default function FlightCard({ flight }: FlightCardProps) {
    const formatTime = (dateString: string) => {
        // Parse the ISO string which already contains timezone info
        const date = new Date(dateString);
        // Format in the original timezone by extracting hours and minutes
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'UTC', // We'll use the UTC time from the ISO string
        });
    };

    const formatTimeWithTimezone = (dateString: string) => {
        // Extract just the time part from ISO string (before timezone offset)
        const match = dateString.match(/T(\d{2}):(\d{2})/);
        if (match) {
            return `${match[1]}:${match[2]}`;
        }
        return new Date(dateString).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'On Time': return 'bg-green-500/20 text-green-400 border-green-500/20';
            case 'Delayed': return 'bg-red-500/20 text-red-400 border-red-500/20';
            case 'Cancelled': return 'bg-red-500/20 text-red-400 border-red-500/20';
            case 'In Air': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
            case 'Landed': return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
            case 'Boarding':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
            default: return 'bg-white/10 text-white border-white/10';
        }
    };

    return (
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl transition-all duration-500 hover:bg-black/50 hover:shadow-2xl hover:shadow-blue-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative z-10">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl backdrop-blur-md">
                            ✈️
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-white">{flight.flightNumber}</span>
                            <span className="text-sm text-gray-400">{flight.airline}</span>
                        </div>
                    </div>
                    <span className={`rounded-full border px-4 py-1.5 text-sm font-semibold tracking-wide shadow-sm backdrop-blur-md ${getStatusColor(flight.status)}`}>
                        {flight.status}
                    </span>
                </div>

                {/* Detailed Info Grid */}
                <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-8 border-t border-white/10 pt-6">
                    {/* Recommended Arrival */}
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Arrivée conseillée</span>
                        <span className="text-xl font-bold text-white">
                            {(() => {
                                const date = new Date(flight.origin.time);
                                date.setHours(date.getHours() - 2);
                                return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                            })()}
                        </span>
                    </div>

                    {/* Terminal */}
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Terminal</span>
                        <span className="text-xl font-bold text-blue-400">
                            {flight.origin.terminal || '-'}
                        </span>
                    </div>

                    {/* Check-in (Simulated/Generic based on Terminal) */}
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Enregistrement</span>
                        <span className="text-sm font-medium text-white">
                            {flight.origin.terminal ? `Zone ${flight.origin.terminal}` : 'Voir écrans'}
                        </span>
                        <span className="text-xs text-gray-500">Comptoirs -</span>
                    </div>

                    {/* Boarding Status */}
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Embarquement</span>
                        <span className={`text-sm font-bold uppercase ${flight.status === 'Boarding' ? 'text-green-400 animate-pulse' :
                            flight.status === 'In Air' || flight.status === 'Landed' ? 'text-gray-500' : 'text-white'
                            }`}>
                            {flight.status === 'In Air' || flight.status === 'Landed' ? 'TERMINÉ' :
                                flight.status === 'Boarding' ? 'EN COURS' : 'À VENIR'}
                        </span>
                    </div>

                    {/* Gate */}
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Porte</span>
                        <span className="text-2xl font-black text-purple-400">
                            {flight.origin.gate || '-'}
                        </span>
                    </div>
                </div>

                {/* Route Info (Simplified) */}
                <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-center md:justify-between bg-black/20 rounded-2xl p-6">
                    {/* Origin */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="text-4xl font-black tracking-tighter text-white">{flight.origin.code}</div>
                        <div className="text-sm font-medium text-gray-400">{flight.origin.city}</div>
                        <div className="mt-1 text-2xl font-bold text-white">{formatTimeWithTimezone(flight.origin.time)}</div>
                    </div>

                    {/* Flight Path Visual */}
                    <div className="flex flex-col items-center justify-center px-4 w-full md:w-auto">
                        <div className="relative flex h-1 w-full items-center justify-center md:w-48">
                            <div className="absolute h-full w-full bg-white/10 rounded-full" />
                            <div className="absolute h-full w-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-50 rounded-full" />
                            <div className="absolute z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black border border-white/30">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white rotate-90 md:rotate-0">
                                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-col items-center gap-1">
                            <span className="text-[10px] uppercase tracking-wider text-gray-500">Durée de vol estimée</span>
                            <span className="text-sm font-bold text-white">
                                {(() => {
                                    const start = new Date(flight.origin.time).getTime();
                                    const end = new Date(flight.destination.time).getTime();
                                    const durationMs = end - start;
                                    const hours = Math.floor(durationMs / (1000 * 60 * 60));
                                    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                                    return `${hours}h ${minutes}m`;
                                })()}
                            </span>
                        </div>
                    </div>

                    {/* Destination */}
                    <div className="flex-1 text-center md:text-right">
                        <div className="text-4xl font-black tracking-tighter text-white">{flight.destination.code}</div>
                        <div className="text-sm font-medium text-gray-400">{flight.destination.city}</div>
                        <div className="mt-1 text-2xl font-bold text-white">{formatTimeWithTimezone(flight.destination.time)}</div>
                        {flight.destination.baggage && (
                            <div className="mt-3 flex flex-col items-center md:items-end">
                                <span className="text-xs font-medium uppercase tracking-wider text-yellow-500/80">Bagages</span>
                                <div className="flex items-center gap-2 rounded-xl bg-yellow-500/10 px-4 py-2 border border-yellow-500/20 animate-pulse">
                                    <span className="text-2xl font-black text-yellow-400">Tapis {flight.destination.baggage}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
