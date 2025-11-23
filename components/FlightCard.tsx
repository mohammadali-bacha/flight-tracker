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
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl backdrop-blur-md">
                            ✈️
                        </div>
                        <div>
                        </div>
                        <span className={`rounded-full border px-4 py-1.5 text-sm font-semibold tracking-wide shadow-sm backdrop-blur-md ${getStatusColor(flight.status)}`}>
                            {flight.status}
                        </span>
                    </div>

                    {/* Route Info - Grid Layout for robustness */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        {/* Origin */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <div className="text-6xl font-black tracking-tighter text-white md:text-7xl">{flight.origin.code}</div>
                            <div className="mt-1 text-lg font-medium text-gray-400 truncate w-full max-w-[200px] md:max-w-none md:text-2xl">{flight.origin.city}</div>

                            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                                {flight.origin.terminal && (
                                    <span className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 text-sm font-bold text-blue-400 whitespace-nowrap">
                                        Term {flight.origin.terminal}
                                    </span>
                                )}
                                {flight.origin.gate && (
                                    <span className="rounded-lg bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 text-sm font-bold text-purple-400 whitespace-nowrap">
                                        Porte {flight.origin.gate}
                                    </span>
                                )}
                            </div>

                            <div className="mt-6 space-y-1">
                                <div className="text-4xl font-bold text-white md:text-5xl">{formatTimeWithTimezone(flight.origin.time)}</div>
                                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest md:text-base">{formatDate(flight.origin.time)}</div>
                            </div>
                        </div>

                        {/* Flight Path Visual */}
                        <div className="flex flex-col items-center justify-center py-4 md:py-0">
                            <div className="relative flex h-32 w-1 items-center justify-center md:h-1 md:w-full">
                                {/* Track Line */}
                                <div className="absolute h-full w-0.5 bg-white/10 md:h-0.5 md:w-full rounded-full" />
                                {/* Progress Gradient */}
                                <div className="absolute h-full w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-80 md:h-0.5 md:w-full md:bg-gradient-to-r rounded-full" />

                                {/* Plane Icon */}
                                <div className="absolute z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black border border-white/20 shadow-[0_0_20px_rgba(59,130,246,0.5)] md:h-14 md:w-14">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white rotate-180 md:rotate-90 md:h-7 md:w-7">
                                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                    </svg>
                                </div>

                                {/* Dots */}
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] md:left-0 md:-translate-x-1 md:top-1/2 md:-translate-y-1/2 md:h-3 md:w-3" />
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)] md:left-auto md:right-0 md:translate-x-1 md:top-1/2 md:-translate-y-1/2 md:h-3 md:w-3" />
                            </div>

                            {/* Duration Badge */}
                            <div className="mt-6 flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-gray-400 backdrop-blur-md border border-white/5 md:text-base">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-blue-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>8h 35m</span>
                            </div>
                        </div>

                        {/* Destination */}
                        <div className="flex flex-col items-center md:items-end text-center md:text-right">
                            <div className="text-6xl font-black tracking-tighter text-white md:text-7xl">{flight.destination.code}</div>
                            <div className="mt-1 text-lg font-medium text-gray-400 truncate w-full max-w-[200px] md:max-w-none md:text-2xl">{flight.destination.city}</div>

                            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 md:justify-end">
                                {flight.destination.terminal && (
                                    <span className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 text-sm font-bold text-blue-400 whitespace-nowrap">
                                        Term {flight.destination.terminal}
                                    </span>
                                )}
                                {flight.destination.gate && (
                                    <span className="rounded-lg bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 text-sm font-bold text-purple-400 whitespace-nowrap">
                                        Porte {flight.destination.gate}
                                    </span>
                                )}
                                {flight.destination.baggage && (
                                    <span className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 text-sm font-bold text-yellow-400 whitespace-nowrap animate-pulse">
                                        Tapis {flight.destination.baggage}
                                    </span>
                                )}
                            </div>

                            <div className="mt-6 space-y-1">
                                <div className="text-4xl font-bold text-white md:text-5xl">{formatTimeWithTimezone(flight.destination.time)}</div>
                                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest md:text-base">{formatDate(flight.destination.time)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
