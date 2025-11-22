import { NextResponse } from 'next/server';
import airportsData from '@/app/data/airports.json';

// Type definition for the imported JSON
const AIRPORTS: Record<string, { lat: number; lon: number; city: string; country: string; name: string }> = airportsData as any;

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
    status: 'On Time' | 'Delayed' | 'Boarding' | 'In Air' | 'Landed' | 'Cancelled' | 'Scheduled';
    delay?: number; // Delay in minutes
}

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
        delay: 0,
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
        delay: 0,
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
        delay: 0,
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
        delay: 45,
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
        delay: 0,
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

                const originAirport = AIRPORTS[originCode];
                const destAirport = AIRPORTS[destCode];

                const originCoords = originAirport ? { lat: originAirport.lat, lon: originAirport.lon } : { lat: 0, lon: 0 };
                const destCoords = destAirport ? { lat: destAirport.lat, lon: destAirport.lon } : { lat: 0, lon: 0 };

                return {
                    id: `${apiFlight.flight.iata}-${apiFlight.departure.scheduled}`,
                    flightNumber: apiFlight.flight.iata,
                    airline: apiFlight.airline.name,
                    origin: {
                        code: originCode,
                        city: apiFlight.departure.airport,
                        time: apiFlight.departure.estimated || apiFlight.departure.actual || apiFlight.departure.scheduled, // Use estimated/actual if available
                        timezone: apiFlight.departure.timezone || 'UTC',
                        latitude: originCoords.lat,
                        longitude: originCoords.lon,
                        terminal: apiFlight.departure.terminal,
                        gate: apiFlight.departure.gate,
                    },
                    destination: {
                        code: destCode,
                        city: apiFlight.arrival.airport,
                        time: apiFlight.arrival.estimated || apiFlight.arrival.actual || apiFlight.arrival.scheduled, // Use estimated/actual if available
                        timezone: apiFlight.arrival.timezone || 'UTC',
                        latitude: destCoords.lat,
                        longitude: destCoords.lon,
                        terminal: apiFlight.arrival.terminal,
                        gate: apiFlight.arrival.gate,
                        baggage: apiFlight.arrival.baggage, // Map baggage info
                    },
                    status: apiFlight.flight_status === 'active' ? 'In Air' :
                        apiFlight.flight_status === 'landed' ? 'Landed' :
                            apiFlight.flight_status === 'cancelled' ? 'Cancelled' :
                                apiFlight.flight_status === 'scheduled' ? 'On Time' :
                                    apiFlight.flight_status.charAt(0).toUpperCase() + apiFlight.flight_status.slice(1),
                    delay: apiFlight.departure.delay || 0,
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
