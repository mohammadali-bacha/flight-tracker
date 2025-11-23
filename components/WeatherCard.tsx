import React, { useState, useEffect } from 'react';

interface WeatherCardProps {
    city: string;
    latitude: number;
    longitude: number;
}

interface WeatherData {
    temperature: number;
    weatherCode: number;
    isDay: number;
}

export default function WeatherCard({ city, latitude, longitude }: WeatherCardProps) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day`
                );
                const data = await response.json();
                setWeather({
                    temperature: data.current.temperature_2m,
                    weatherCode: data.current.weather_code,
                    isDay: data.current.is_day,
                });
            } catch (error) {
                console.error('Failed to fetch weather:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (latitude !== undefined && longitude !== undefined) {
            fetchWeather();
        }
    }, [latitude, longitude]);

    const getWeatherIcon = (code: number, isDay: number) => {
        // WMO Weather interpretation codes (WW)
        // 0: Clear sky
        // 1, 2, 3: Mainly clear, partly cloudy, and overcast
        // 45, 48: Fog and depositing rime fog
        // 51, 53, 55: Drizzle: Light, moderate, and dense intensity
        // 61, 63, 65: Rain: Slight, moderate and heavy intensity
        // 71, 73, 75: Snow fall: Slight, moderate, and heavy intensity
        // 95: Thunderstorm: Slight or moderate

        if (code === 0) return isDay ? '☀️' : '🌙';
        if (code >= 1 && code <= 3) return isDay ? '🌤️' : '☁️';
        if (code >= 45 && code <= 48) return '🌫️';
        if (code >= 51 && code <= 67) return '🌧️';
        if (code >= 71 && code <= 77) return '❄️';
        if (code >= 95) return '⚡';
        return '🌤️';
    };

    const getWeatherDescription = (code: number) => {
        if (code === 0) return 'Ciel dégagé';
        if (code >= 1 && code <= 3) return 'Nuageux';
        if (code >= 45 && code <= 48) return 'Brume';
        if (code >= 51 && code <= 67) return 'Pluie';
        if (code >= 71 && code <= 77) return 'Neige';
        if (code >= 95) return 'Orage';
        return 'Variable';
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:shadow-2xl hover:shadow-yellow-500/10 h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Météo à l'arrivée</h3>
                        <p className="text-sm text-gray-400">{city}</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-1 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
                    </div>
                ) : weather ? (
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-4xl font-bold text-white">{Math.round(weather.temperature)}°C</span>
                            <span className="text-sm text-gray-400">{getWeatherDescription(weather.weatherCode)}</span>
                        </div>
                        <div className="text-5xl animate-pulse">
                            {getWeatherIcon(weather.weatherCode, weather.isDay)}
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-400">Météo indisponible</div>
                )}

                <div className="mt-4 text-xs text-gray-500">
                    Mise à jour en temps réel
                </div>
            </div>
        </div>
    );
}
