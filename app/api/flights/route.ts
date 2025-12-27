import { NextResponse } from 'next/server';
import airportsData from '@/app/data/airports.json';

const AIRPORTS: Record<string, { lat: number; lon: number; city: string; country: string; name: string }> = airportsData as any;

// API Keys
const AERODATABOX_KEY = '949165b5e9msh34d2536ab2f8171p1e5eb4jsn8458f3d291a0';
const AIRLABS_KEY = 'd1d40d2b-4015-46a3-b77c-01096738e6fd';

export interface Flight {
    id: string;
    flightNumber: string;
    airline: string;
    origin: {
        code: string;
        city: string;
        time: string;
        timezone: string;
        latitude: number;
        longitude: number;
        terminal?: string;
        gate?: string;
    };
    destination: {
        code: string;
        city: string;
        time: string;
        timezone: string;
        latitude: number;
        longitude: number;
        terminal?: string;
        gate?: string;
        baggage?: string;
    };
    status: 'On Time' | 'Delayed' | 'Boarding' | 'In Air' | 'Landed' | 'Cancelled' | 'Scheduled';
    delay?: number;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const dateParam = searchParams.get('date');

    if (!query) {
        return NextResponse.json([]);
    }

    const cleanQuery = query.replace(/\s/g, '').toUpperCase();
    const searchDate = dateParam || new Date().toISOString().split('T')[0];

    console.log(`Searching for flight ${cleanQuery} on ${searchDate}`);

    // Try AeroDataBox first (supports all dates)
    try {
        const aeroDataBoxFlight = await fetchFromAeroDataBox(cleanQuery, searchDate);
        if (aeroDataBoxFlight) {
            console.log('Found flight from AeroDataBox');
            return NextResponse.json([aeroDataBoxFlight]);
        }
    } catch (error) {
        console.error('AeroDataBox error:', error);
    }

    // Fallback to AirLabs for today's flights
    const today = new Date().toISOString().split('T')[0];
    if (searchDate === today) {
        try {
            const airLabsFlight = await fetchFromAirLabs(cleanQuery);
            if (airLabsFlight) {
                console.log('Found flight from AirLabs');
                return NextResponse.json([airLabsFlight]);
            }
        } catch (error) {
            console.error('AirLabs error:', error);
        }
    }

    return NextResponse.json([]);
}

async function fetchFromAeroDataBox(flightNumber: string, date: string): Promise<Flight | null> {
    const url = `https://aerodatabox.p.rapidapi.com/flights/number/${flightNumber}/${date}`;
    
    console.log(`Calling AeroDataBox: ${url}`);
    
    const response = await fetch(url, {
        headers: {
            'X-RapidAPI-Key': AERODATABOX_KEY,
            'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
        }
    });

    if (!response.ok) {
        console.log(`AeroDataBox returned ${response.status}`);
        return null;
    }

    const data = await response.json();
    console.log('AeroDataBox response:', JSON.stringify(data).substring(0, 300));

    if (!data || !Array.isArray(data) || data.length === 0) {
        return null;
    }

    const flight = data[0];
    
    const originCode = flight.departure?.airport?.iata;
    const destCode = flight.arrival?.airport?.iata;
    
    const originAirport = AIRPORTS[originCode?.toUpperCase()];
    const destAirport = AIRPORTS[destCode?.toUpperCase()];

    // Map status
    let status: Flight['status'] = 'Scheduled';
    const flightStatus = flight.status?.toLowerCase() || '';
    if (flightStatus.includes('landed') || flightStatus.includes('arrived')) {
        status = 'Landed';
    } else if (flightStatus.includes('active') || flightStatus.includes('en route') || flightStatus.includes('airborne')) {
        status = 'In Air';
    } else if (flightStatus.includes('cancelled')) {
        status = 'Cancelled';
    } else if (flightStatus.includes('delayed')) {
        status = 'Delayed';
    } else if (flightStatus.includes('boarding')) {
        status = 'Boarding';
    } else if (flightStatus.includes('scheduled') || flightStatus.includes('expected')) {
        status = 'On Time';
    }

    return {
        id: `${flightNumber}-${date}`,
        flightNumber: flight.number || flightNumber,
        airline: flight.airline?.name || 'Unknown Airline',
        origin: {
            code: originCode || '',
            city: originAirport?.city || flight.departure?.airport?.name || originCode || '',
            time: flight.departure?.scheduledTime?.local || flight.departure?.scheduledTime?.utc || '',
            timezone: 'Local',
            latitude: originAirport?.lat || 0,
            longitude: originAirport?.lon || 0,
            terminal: flight.departure?.terminal,
            gate: flight.departure?.gate,
        },
        destination: {
            code: destCode || '',
            city: destAirport?.city || flight.arrival?.airport?.name || destCode || '',
            time: flight.arrival?.scheduledTime?.local || flight.arrival?.scheduledTime?.utc || '',
            timezone: 'Local',
            latitude: destAirport?.lat || 0,
            longitude: destAirport?.lon || 0,
            terminal: flight.arrival?.terminal,
            gate: flight.arrival?.gate,
            baggage: flight.arrival?.baggageBelt,
        },
        status: status,
        delay: flight.departure?.delay || 0,
    };
}

async function fetchFromAirLabs(flightNumber: string): Promise<Flight | null> {
    const url = `https://airlabs.co/api/v9/flight?flight_iata=${flightNumber}&api_key=${AIRLABS_KEY}`;
    
    console.log(`Calling AirLabs: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.error || !data.response) {
        return null;
    }

    const flight = data.response;
    
    const originCode = flight.dep_iata;
    const destCode = flight.arr_iata;
    
    const originAirport = AIRPORTS[originCode?.toUpperCase()];
    const destAirport = AIRPORTS[destCode?.toUpperCase()];

    let status: Flight['status'] = 'Scheduled';
    switch (flight.status) {
        case 'active': status = 'In Air'; break;
        case 'landed': status = 'Landed'; break;
        case 'cancelled': status = 'Cancelled'; break;
        case 'scheduled': status = 'On Time'; break;
    }

    return {
        id: `${flightNumber}-${flight.dep_time || 'today'}`,
        flightNumber: flight.flight_iata,
        airline: flight.airline_name || flight.airline_iata || 'Unknown Airline',
        origin: {
            code: originCode || '',
            city: originAirport?.city || originCode || '',
            time: flight.dep_time || '',
            timezone: 'UTC',
            latitude: originAirport?.lat || 0,
            longitude: originAirport?.lon || 0,
            terminal: flight.dep_terminal,
            gate: flight.dep_gate,
        },
        destination: {
            code: destCode || '',
            city: destAirport?.city || destCode || '',
            time: flight.arr_time || '',
            timezone: 'UTC',
            latitude: destAirport?.lat || 0,
            longitude: destAirport?.lon || 0,
            terminal: flight.arr_terminal,
            gate: flight.arr_gate,
            baggage: flight.arr_baggage,
        },
        status: status,
        delay: flight.dep_delayed || 0,
    };
}
