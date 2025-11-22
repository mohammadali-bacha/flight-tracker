import React from 'react';

interface TravelCardProps {
    airportName: string;
    airportCode: string;
}

export default function TravelCard({ airportName, airportCode }: TravelCardProps) {
    // Mock data for travel time
    const travelTime = "45 min";
    const trafficStatus = "Fluide";
    const distance = "32 km";

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

                <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl bg-black/20 p-3 text-center">
                        <div className="text-xs text-gray-500">Temps estimé</div>
                        <div className="text-xl font-bold text-white">{travelTime}</div>
                    </div>
                    <div className="rounded-xl bg-black/20 p-3 text-center">
                        <div className="text-xs text-gray-500">Distance</div>
                        <div className="text-xl font-bold text-white">{distance}</div>
                    </div>
                    <div className="rounded-xl bg-black/20 p-3 text-center">
                        <div className="text-xs text-gray-500">Trafic</div>
                        <div className="text-xl font-bold text-green-400">{trafficStatus}</div>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Destination:</span>
                        <span className="font-semibold text-white">{airportName} ({airportCode})</span>
                    </div>
                    <button className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
