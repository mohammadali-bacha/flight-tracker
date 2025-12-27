import { NextResponse } from 'next/server';
import airportsData from '@/app/data/airports.json';

// Simple check for Safari-compatible dates: replace " " with "T"
const toISODate = (str: string) => {
    if (!str) return '';
    return str.replace(' ', 'T');
};

// Type definition for the imported JSON
const AIRPORTS: Record<string, { lat: number; lon: number; city: string; country: string; name: string }> = airportsData as any;

// Helper function for fetch with timeout (8 seconds for Netlify)
async function fetchWithTimeout(url: string, timeout = 8000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
}

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

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');
        const dateParam = searchParams.get('date'); // Format: YYYY-MM-DD

        if (!query) {
            return NextResponse.json([]);
        }
        // AirLabs API
        const API_KEY = 'd1d40d2b-4015-46a3-b77c-01096738e6fd';

        // Clean up query (remove spaces, upper case)
        const cleanQuery = query.replace(/\s/g, '').toUpperCase();
        
        // Determine if we're looking for today, past, or future date
        const today = new Date().toISOString().split('T')[0];
        const isFutureDate = dateParam && dateParam > today;
        const isPastDate = dateParam && dateParam < today;
        
        let apiFlightsArray: any[] = [];
        
        // For future dates or past dates, use schedules endpoint; for today, use flight endpoint
        if (isFutureDate || isPastDate) {
            // Use schedules API for future/past dates
            const schedulesUrl = `https://airlabs.co/api/v9/schedules?flight_iata=${cleanQuery}&api_key=${API_KEY}`;
            console.log(`Calling AirLabs Schedules API for query: ${query}, date: ${dateParam} (${isFutureDate ? 'future' : 'past'})`);
            
            try {
                const schedulesResponse = await fetchWithTimeout(schedulesUrl);
                const schedulesData = await schedulesResponse.json();
                
                console.log('AirLabs Schedules Response Status:', schedulesResponse.status);
                console.log('AirLabs Schedules Data:', JSON.stringify(schedulesData).substring(0, 500) + '...');
                
                if (schedulesData.error) {
                    console.log('AirLabs Schedules API returned error:', schedulesData.error.code, '-', schedulesData.error.message);
                } else if (schedulesData.response) {
                    if (Array.isArray(schedulesData.response)) {
                        apiFlightsArray = schedulesData.response;
                    } else {
                        apiFlightsArray = [schedulesData.response];
                    }
                }
            } catch (schedulesError) {
                console.error('Error calling schedules API:', schedulesError);
            }
            
            // If schedules didn't return results, try flight API as fallback
            if (apiFlightsArray.length === 0) {
                console.log('Schedules API returned no results, trying flight API as fallback...');
                const flightUrl = `https://airlabs.co/api/v9/flight?flight_iata=${cleanQuery}&api_key=${API_KEY}`;
                const flightResponse = await fetchWithTimeout(flightUrl);
                const flightData = await flightResponse.json();
                
                if (flightData.response) {
                    if (Array.isArray(flightData.response)) {
                        apiFlightsArray = flightData.response;
                    } else {
                        apiFlightsArray = [flightData.response];
                    }
                }
            }
        } else {
            // Use flight API for today/current flights
            let url = `https://airlabs.co/api/v9/flight?flight_iata=${cleanQuery}&api_key=${API_KEY}`;
            console.log(`Calling AirLabs Flight API for query: ${query}, date: ${dateParam || 'today'}`);
            
            const response = await fetchWithTimeout(url);
            const data = await response.json();
            
            console.log('AirLabs Flight Response Status:', response.status);
            console.log('AirLabs Flight Data:', JSON.stringify(data).substring(0, 200) + '...');
            
            if (data.error) {
                console.log('AirLabs Flight API returned error:', data.error.code, '-', data.error.message);
            } else if (data.response) {
                if (Array.isArray(data.response)) {
                    apiFlightsArray = data.response;
                } else {
                    apiFlightsArray = [data.response];
                }
            }
        }

        if (apiFlightsArray.length > 0) {
            console.log(`Found ${apiFlightsArray.length} flights from AirLabs`);
            
            // For future/past dates from schedules API, don't filter strictly
            // The schedules API returns recurring schedules, not specific dates
            let filteredFlights = apiFlightsArray;
            
            // Only filter for today's flights (from flight API which has actual dates)
            if (dateParam && !isFutureDate && !isPastDate) {
                filteredFlights = apiFlightsArray.filter((apiFlight: any) => {
                    const dateFields = [
                        apiFlight.dep_date,
                        apiFlight.dep_time,
                        apiFlight.dep_estimated,
                        apiFlight.dep_actual,
                        apiFlight.dep_scheduled
                    ].filter(Boolean);
                    
                    for (const dateField of dateFields) {
                        try {
                            let flightDateStr = '';
                            if (typeof dateField === 'string') {
                                if (dateField.match(/^\d{4}-\d{2}-\d{2}/)) {
                                    flightDateStr = dateField.split('T')[0].split(' ')[0];
                                } else {
                                    const parsed = new Date(dateField);
                                    if (!isNaN(parsed.getTime())) {
                                        flightDateStr = parsed.toISOString().split('T')[0];
                                    }
                                }
                            }
                            
                            if (flightDateStr === dateParam) {
                                return true;
                            }
                        } catch (e) {
                            // Continue
                        }
                    }
                    return false;
                });
                console.log(`Filtered to ${filteredFlights.length} flights for today ${dateParam}`);
            } else if (isFutureDate || isPastDate) {
                // For future/past dates, use all results from schedules API
                console.log(`Using ${filteredFlights.length} flights for ${isFutureDate ? 'future' : 'past'} date ${dateParam}`);
            }
            
            const realFlights: Flight[] = filteredFlights.map((apiFlight: any) => {
                const originCode = apiFlight.dep_iata;
                const destCode = apiFlight.arr_iata;

                const originAirport = AIRPORTS[originCode?.toUpperCase()];
                const destAirport = AIRPORTS[destCode?.toUpperCase()];

                const originCoords = originAirport ? { lat: originAirport.lat, lon: originAirport.lon } : { lat: 0, lon: 0 };
                const destCoords = destAirport ? { lat: destAirport.lat, lon: destAirport.lon } : { lat: 0, lon: 0 };

                // Map status - for future dates, always show as Scheduled
                let status: Flight['status'] = 'Scheduled';
                if (isFutureDate) {
                    status = 'Scheduled';
                } else {
                    switch (apiFlight.status) {
                        case 'active': status = 'In Air'; break;
                        case 'landed': status = 'Landed'; break;
                        case 'cancelled': status = 'Cancelled'; break;
                        case 'scheduled': status = 'On Time'; break;
                        default: status = 'Scheduled';
                    }
                }

                // Build time strings
                let depTime = apiFlight.dep_estimated || apiFlight.dep_actual || apiFlight.dep_time;
                let arrTime = apiFlight.arr_estimated || apiFlight.arr_actual || apiFlight.arr_time;
                
                // For future/past dates, combine requested date with schedule times
                if ((isFutureDate || isPastDate) && dateParam) {
                    // Extract just the time portion from schedule
                    const extractTime = (timeStr: string | undefined): string => {
                        if (!timeStr) return '00:00:00';
                        // If it's just HH:MM format
                        if (timeStr.match(/^\d{2}:\d{2}$/)) return `${timeStr}:00`;
                        // If it includes T, extract time after T
                        if (timeStr.includes('T')) {
                            const parts = timeStr.split('T');
                            return parts[1] || '00:00:00';
                        }
                        // If it includes space, extract time after space
                        if (timeStr.includes(' ')) {
                            const parts = timeStr.split(' ');
                            return parts[1] || '00:00:00';
                        }
                        return timeStr;
                    };
                    
                    const depTimeOnly = extractTime(apiFlight.dep_time);
                    const arrTimeOnly = extractTime(apiFlight.arr_time);
                    
                    depTime = `${dateParam}T${depTimeOnly}`;
                    arrTime = `${dateParam}T${arrTimeOnly}`;
                    
                    console.log(`Built times for ${dateParam}: dep=${depTime}, arr=${arrTime}`);
                }

                return {
                    id: `${apiFlight.flight_iata}-${apiFlight.dep_time || apiFlight.dep_date}-${dateParam || 'today'}`,
                    flightNumber: apiFlight.flight_iata,
                    airline: apiFlight.airline_name || apiFlight.airline_iata || 'Unknown Airline',
                    origin: {
                        code: originCode,
                        city: originAirport ? originAirport.city : originCode,
                        time: toISODate(apiFlight.dep_estimated || apiFlight.dep_actual || depTime),
                        timezone: 'UTC',
                        latitude: originCoords.lat,
                        longitude: originCoords.lon,
                        terminal: apiFlight.dep_terminal,
                        gate: apiFlight.dep_gate,
                    },
                    destination: {
                        code: destCode,
                        city: destAirport ? destAirport.city : destCode,
                        time: toISODate(apiFlight.arr_estimated || apiFlight.arr_actual || arrTime),
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
        console.error('AirLabs API failed:', error);
        // Return error response instead of empty array
        return NextResponse.json(
            { error: 'Failed to fetch flight data', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }

    // No flight found - return empty array
    return NextResponse.json([]);
}
