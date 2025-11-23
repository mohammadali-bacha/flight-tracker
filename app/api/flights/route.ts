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
        baggage?: string;
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
            baggage: '5', // Added for testing
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
        // AirLabs API
        const API_KEY = 'd1d40d2b-4015-46a3-b77c-01096738e6fd';

        const url = `https://airlabs.co/api/v9/flight?flight_iata=${query}&api_key=${API_KEY}`;
        console.log(`Calling AirLabs API for query: ${query}`);

        const response = await fetch(url);
        const data = await response.json();

        console.log('AirLabs Response Status:', response.status);
        console.log('AirLabs Data:', JSON.stringify(data).substring(0, 200) + '...'); // Log first 200 chars

        // AirLabs returns data in a 'response' field.
        // It can be an array OR a single object depending on the query.
        let apiFlightsArray: any[] = [];

        if (data.response) {
            if (Array.isArray(data.response)) {
                apiFlightsArray = data.response;
            } else {
                apiFlightsArray = [data.response];
            }
        }

        if (apiFlightsArray.length > 0) {
            console.log(`Found ${apiFlightsArray.length} flights from AirLabs`);
            const realFlights: Flight[] = apiFlightsArray.map((apiFlight: any) => {
                const originCode = apiFlight.dep_iata;
                const destCode = apiFlight.arr_iata;

                const originAirport = AIRPORTS[originCode];
                const destAirport = AIRPORTS[destCode];

                const originCoords = originAirport ? { lat: originAirport.lat, lon: originAirport.lon } : { lat: 0, lon: 0 };
                const destCoords = destAirport ? { lat: destAirport.lat, lon: destAirport.lon } : { lat: 0, lon: 0 };

                // Map status
                let status: Flight['status'] = 'Scheduled';
                switch (apiFlight.status) {
                    case 'active': status = 'In Air'; break;
                    case 'landed': status = 'Landed'; break;
                    case 'cancelled': status = 'Cancelled'; break;
                    case 'scheduled': status = 'On Time'; break;
                    default: status = 'Scheduled';
                }

                return {
                    id: `${apiFlight.flight_iata}-${apiFlight.dep_time}`,
                    flightNumber: apiFlight.flight_iata,
                    airline: apiFlight.airline_name || apiFlight.airline_iata || 'Unknown Airline',
                    origin: {
                        code: originCode,
                        city: originAirport ? originAirport.city : originCode,
                        time: apiFlight.dep_estimated || apiFlight.dep_actual || apiFlight.dep_time,
                        timezone: 'UTC', // AirLabs doesn't always provide timezone directly in this endpoint, defaulting to UTC or need logic
                        latitude: originCoords.lat,
                        longitude: originCoords.lon,
                        terminal: apiFlight.dep_terminal,
                        gate: apiFlight.dep_gate,
                    },
                    destination: {
                        code: destCode,
                        city: destAirport ? destAirport.city : destCode,
                        time: apiFlight.arr_estimated || apiFlight.arr_actual || apiFlight.arr_time,
                        timezone: 'UTC',
                        latitude: destCoords.lat,
                        longitude: destCoords.lon,
                        terminal: apiFlight.arr_terminal,
                        gate: apiFlight.arr_gate,
                        baggage: apiFlight.arr_baggage,
                    },
                    status: status,
                    delay: apiFlight.dep_delayed || 0,
                };
            });

            // Deduplicate flights based on ID
            const uniqueFlights = Array.from(new Map(realFlights.map(item => [item.id, item])).values());

            if (uniqueFlights.length > 0) {
                return NextResponse.json([uniqueFlights[0]]);
            }
        }
    } catch (error) {
        console.error('AirLabs API failed, falling back to mock:', error);
    }

    // Simulate network delay for mock
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json(filteredFlights);
}
