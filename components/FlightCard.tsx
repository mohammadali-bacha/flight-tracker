import React from 'react';
import { Flight } from '@/app/api/flights/route';

interface FlightCardProps {
    flight: Flight;
}

export default function FlightCard({ flight }: FlightCardProps) {
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'On Time':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Delayed':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'In Air':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'Boarding':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-2xl transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10">
            {/* Ambient Background Glow */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[64px] transition-opacity duration-500 group-hover:opacity-70" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/10 blur-[64px] transition-opacity duration-500 group-hover:opacity-70" />

            <div className="relative z-10 flex flex-col gap-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-300 shadow-inner shadow-white/5">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.216 50.552 50.552 0 00-2.658.813m-15.482 0A50.55 50.55 0 0112 13.489a50.55 50.55 0 0112-3.342" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold tracking-tight text-white">{flight.airline}</h3>
                            <p className="font-mono text-sm font-medium text-blue-400/80">{flight.flightNumber}</p>
                        </div>
                    </div>
                    <span className={`rounded-full border px-4 py-1.5 text-sm font-semibold tracking-wide shadow-sm backdrop-blur-md ${getStatusColor(flight.status)}`}>
                        {flight.status}
                    </span>
                </div>

                {/* Route Info */}
                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                    {/* Origin */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 md:text-6xl">{flight.origin.code}</div>
                        <div className="mt-1 text-lg font-medium text-gray-400">{flight.origin.city}</div>
                        {(flight.origin.terminal || flight.origin.gate) && (
                            <div className="mt-2 flex items-center justify-center gap-3 md:justify-start">
                                {flight.origin.terminal && (
                                    <span className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400">
                                        Terminal {flight.origin.terminal}
                                    </span>
                                )}
                                {flight.origin.gate && (
                                    <span className="rounded-lg bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-400">
                                        Porte {flight.origin.gate}
                                    </span>
                                )}
                            </div>
                        )}
                        <div className="mt-4 space-y-1">
                            <div className="text-3xl font-bold text-white">{formatTime(flight.origin.time)}</div>
                            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">{formatDate(flight.origin.time)}</div>
                        </div>
                    </div>

                    {/* Flight Path Visual */}
                    <div className="flex flex-col items-center justify-center px-4 py-6 w-full md:px-8 md:py-0 md:w-auto">
                        <div className="relative flex h-40 w-1 items-center justify-center md:h-1 md:w-96">
                            {/* Track Line */}
                            <div className="absolute h-full w-1 bg-white/10 md:h-1 md:w-full rounded-full" />
                            {/* Progress Gradient */}
                            <div className="absolute h-full w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-80 md:h-1 md:w-full md:bg-gradient-to-r rounded-full" />

                            {/* Plane Icon - Points DOWN on mobile, RIGHT on desktop */}
                            <div className="absolute z-10 flex h-14 w-14 items-center justify-center rounded-full bg-black border-2 border-white/30 shadow-[0_0_30px_rgba(59,130,246,0.6)]">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white rotate-90 md:rotate-0">
                                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                </svg>
                            </div>

                            {/* Dots */}
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] md:left-0 md:-translate-x-1.5 md:top-1/2 md:-translate-y-1/2" />
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)] md:left-auto md:right-0 md:translate-x-1.5 md:top-1/2 md:-translate-y-1/2" />
                        </div>
                        <div className="mt-6 flex items-center gap-3 rounded-full bg-white/10 px-6 py-2 text-base font-semibold text-white backdrop-blur-md border border-white/10 shadow-lg md:text-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-blue-400 md:h-5 md:w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>8h 35m</span>
                        </div>
                    </div>

                    {/* Destination */}
                    <div className="flex-1 text-center md:text-right">
                        <div className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 md:text-6xl">{flight.destination.code}</div>
                        <div className="mt-1 text-lg font-medium text-gray-400">{flight.destination.city}</div>
                        {(flight.destination.terminal || flight.destination.gate) && (
                            <div className="mt-2 flex items-center justify-center gap-3 md:justify-end">
                                {flight.destination.terminal && (
                                    <span className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400">
                                        Terminal {flight.destination.terminal}
                                    </span>
                                )}
                                {flight.destination.gate && (
                                    <span className="rounded-lg bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-400">
                                        Porte {flight.destination.gate}
                                    </span>
                                )}
                            </div>
                        )}
                        <div className="mt-4 space-y-1">
                            <div className="text-3xl font-bold text-white">{formatTime(flight.destination.time)}</div>
                            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">{formatDate(flight.destination.time)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
