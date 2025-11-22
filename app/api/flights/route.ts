import { NextResponse } from 'next/server';

export interface Flight {
    id: string;
    flightNumber: string;
    airline: string;
    origin: {
        code: string;
        city: string;
        time: string; // ISO string
        timezone: string;
        latitude: number;
        longitude: number;
        terminal?: string;
        gate?: string;
    };
    destination: {
        code: string;
        city: string;
        time: string; // ISO string
        timezone: string;
        latitude: number;
        longitude: number;
        terminal?: string;
        gate?: string;
    };
    status: 'On Time' | 'Delayed' | 'Boarding' | 'In Air' | 'Landed';
}

const AIRPORT_COORDINATES: Record<string, { lat: number; lon: number; city: string; timezone: string }> = {
    // Americas
    'JFK': { lat: 40.6413, lon: -73.7781, city: 'New York', timezone: 'America/New_York' },
    'LAX': { lat: 33.9416, lon: -118.4085, city: 'Los Angeles', timezone: 'America/Los_Angeles' },
    'SFO': { lat: 37.6213, lon: -122.3790, city: 'San Francisco', timezone: 'America/Los_Angeles' },

    // Europe
    'LHR': { lat: 51.4700, lon: -0.4543, city: 'London', timezone: 'Europe/London' },
    'CDG': { lat: 49.0097, lon: 2.5479, city: 'Paris', timezone: 'Europe/Paris' },
    'LYS': { lat: 45.7256, lon: 5.0811, city: 'Lyon', timezone: 'Europe/Paris' },
    'AMS': { lat: 52.3105, lon: 4.7683, city: 'Amsterdam', timezone: 'Europe/Amsterdam' },
    'FRA': { lat: 50.0379, lon: 8.5622, city: 'Frankfurt', timezone: 'Europe/Berlin' },
    'MAD': { lat: 40.4936, lon: -3.5668, city: 'Madrid', timezone: 'Europe/Madrid' },
    'FCO': { lat: 41.8003, lon: 12.2389, city: 'Rome', timezone: 'Europe/Rome' },

    // Middle East
    'DXB': { lat: 25.2532, lon: 55.3657, city: 'Dubai', timezone: 'Asia/Dubai' },
    'DOH': { lat: 25.2731, lon: 51.6080, city: 'Doha', timezone: 'Asia/Qatar' },
    'AUH': { lat: 24.4330, lon: 54.6511, city: 'Abu Dhabi', timezone: 'Asia/Dubai' },
    'IST': { lat: 41.2753, lon: 28.7519, city: 'Istanbul', timezone: 'Europe/Istanbul' },
    'CAI': { lat: 30.1219, lon: 31.4056, city: 'Cairo', timezone: 'Africa/Cairo' },

    // Asia
    'HND': { lat: 35.5494, lon: 139.7798, city: 'Tokyo', timezone: 'Asia/Tokyo' },
    'SIN': { lat: 1.3644, lon: 103.9915, city: 'Singapore', timezone: 'Asia/Singapore' },
    'HKG': { lat: 22.3080, lon: 113.9185, city: 'Hong Kong', timezone: 'Asia/Hong_Kong' },
    'BKK': { lat: 13.6900, lon: 100.7501, city: 'Bangkok', timezone: 'Asia/Bangkok' },

    // Africa / Morocco
    'CMN': { lat: 33.3675, lon: -7.5898, city: 'Casablanca', timezone: 'Africa/Casablanca' },
    'RAK': { lat: 31.6069, lon: -8.0363, city: 'Marrakech', timezone: 'Africa/Casablanca' },
};

const MOCK_FLIGHTS: Flight[] = [
    {
        id: '1',
        flightNumber: 'AA123',
        airline: 'American Airlines',
        origin: {
            code: 'JFK',
            city: 'New York',
            time: '2025-11-21T08:00:00-05:00',
            timezone: 'EST',
            latitude: 40.6413,
            longitude: -73.7781,
            terminal: '4',
            gate: 'B32',
        },
        destination: {
            code: 'LHR',
            city: 'London',
            time: '2025-11-21T20:00:00+00:00',
            timezone: 'GMT',
            latitude: 51.4700,
            longitude: -0.4543,
            terminal: '3',
            gate: 'A12',
        },
        status: 'On Time',
    },
    {
        id: '2',
        flightNumber: 'BA456',
        airline: 'British Airways',
        origin: {
            code: 'LHR',
            city: 'London',
            time: '2025-11-21T10:00:00+00:00',
            timezone: 'GMT',
            latitude: 51.4700,
            longitude: -0.4543,
            terminal: '5',
            gate: 'A22',
        },
        destination: {
            code: 'JFK',
            city: 'New York',
            time: '2025-11-21T13:00:00-05:00',
            timezone: 'EST',
            latitude: 40.6413,
            longitude: -73.7781,
            terminal: '7',
            gate: 'C45',
        },
        status: 'In Air',
    },
    {
        id: '3',
        flightNumber: 'DL789',
        airline: 'Delta Air Lines',
        origin: {
            code: 'LAX',
            city: 'Los Angeles',
            time: '2025-11-21T09:00:00-08:00',
            timezone: 'PST',
            latitude: 33.9416,
            longitude: -118.4085,
        },
        destination: {
            code: 'HND',
            city: 'Tokyo',
            time: '2025-11-22T14:00:00+09:00',
            timezone: 'JST',
            latitude: 35.5494,
            longitude: 139.7798,
        },
        status: 'Boarding',
    },
    {
        id: '4',
        flightNumber: 'UA101',
        airline: 'United Airlines',
        origin: {
            code: 'SFO',
            city: 'San Francisco',
            time: '2025-11-21T11:30:00-08:00',
            timezone: 'PST',
            latitude: 37.6213,
            longitude: -122.3790,
        },
        destination: {
            code: 'SIN',
            city: 'Singapore',
            time: '2025-11-22T19:30:00+08:00',
            timezone: 'SGT',
            latitude: 1.3644,
            longitude: 103.9915,
        },
        status: 'Delayed',
    },
    {
        id: '5',
        flightNumber: 'AF202',
        airline: 'Air France',
        origin: {
            code: 'CDG',
            city: 'Paris',
            time: '2025-11-21T14:00:00+01:00',
            timezone: 'CET',
            latitude: 49.0097,
            longitude: 2.5479,
        },
        destination: {
            code: 'DXB',
            city: 'Dubai',
            time: '2025-11-21T23:45:00+04:00',
            timezone: 'GST',
            latitude: 25.2532,
            longitude: 55.3657,
        },
        status: 'On Time',
    },
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json(MOCK_FLIGHTS);
    }

    // Keep mock data as fallback
    const filteredFlights = MOCK_FLIGHTS.filter((flight) =>
        flight.flightNumber.toLowerCase().includes(query.toLowerCase()) ||
        flight.airline.toLowerCase().includes(query.toLowerCase()) ||
        flight.origin.city.toLowerCase().includes(query.toLowerCase()) ||
        flight.destination.city.toLowerCase().includes(query.toLowerCase())
    );

    try {
        const API_KEY = '1073db5dc5e93ff5ee9bdad11020495f';
        const response = await fetch(
            `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}&flight_iata=${query}`
        );
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            const realFlights: Flight[] = data.data.map((apiFlight: any) => {
                const originCode = apiFlight.departure.iata;
                const destCode = apiFlight.arrival.iata;

                const originCoords = AIRPORT_COORDINATES[originCode] || { lat: 0, lon: 0 };
                const destCoords = AIRPORT_COORDINATES[destCode] || { lat: 0, lon: 0 };

                return {
                    id: `${apiFlight.flight.iata}-${apiFlight.departure.scheduled}`,
                    flightNumber: apiFlight.flight.iata,
                    airline: apiFlight.airline.name,
                    origin: {
                        code: originCode,
                        city: apiFlight.departure.airport,
                        time: apiFlight.departure.scheduled,
                        timezone: apiFlight.departure.timezone || 'UTC',
                        latitude: originCoords.lat,
                        longitude: originCoords.lon,
                        terminal: apiFlight.departure.terminal,
                        gate: apiFlight.departure.gate,
                    },
                    destination: {
                        code: destCode,
                        city: apiFlight.arrival.airport,
                        time: apiFlight.arrival.scheduled,
                        timezone: apiFlight.arrival.timezone || 'UTC',
                        latitude: destCoords.lat,
                        longitude: destCoords.lon,
                        terminal: apiFlight.arrival.terminal,
                        gate: apiFlight.arrival.gate,
                    },
                    status: apiFlight.flight_status === 'active' ? 'In Air' :
                        apiFlight.flight_status === 'landed' ? 'Landed' :
                            apiFlight.flight_status === 'scheduled' ? 'On Time' :
                                apiFlight.flight_status.charAt(0).toUpperCase() + apiFlight.flight_status.slice(1),
                };
            });

            // Deduplicate flights based on ID
            const uniqueFlights = Array.from(new Map(realFlights.map(item => [item.id, item])).values());

            if (uniqueFlights.length > 0) {
                // STRICTLY return only the first flight found to avoid duplicates in UI
                return NextResponse.json([uniqueFlights[0]]);
            }
        }
    } catch (error) {
        console.error('Real API failed, falling back to mock:', error);
    }

    // Simulate network delay for mock
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json(filteredFlights);
}
