import { NextResponse } from 'next/server';
import airportsData from '@/app/data/airports.json';

// Simple check for Safari-compatible dates: replace " " with "T"
const toISODate = (str: string) => {
    if (!str) return '';
    return str.replace(' ', 'T');
};

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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const dateParam = searchParams.get('date'); // Format: YYYY-MM-DD

    if (!query) {
        return NextResponse.json([]);
    }

    try {
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
                const schedulesResponse = await fetch(schedulesUrl);
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
                const flightResponse = await fetch(flightUrl);
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
            
            const response = await fetch(url);
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
            
            // Filter by date if provided
            let filteredFlights = apiFlightsArray;
            if (dateParam) {
                filteredFlights = apiFlightsArray.filter((apiFlight: any) => {
                    // For schedules API, check dep_date field directly (most reliable)
                    if (apiFlight.dep_date) {
                        let flightDateStr = apiFlight.dep_date;
                        // Handle different formats: "2024-12-28" or "2024-12-28T06:40:00"
                        if (flightDateStr.includes('T')) {
                            flightDateStr = flightDateStr.split('T')[0];
                        } else if (flightDateStr.includes(' ')) {
                            flightDateStr = flightDateStr.split(' ')[0];
                        }
                        if (flightDateStr === dateParam) {
                            console.log(`Match found: dep_date ${apiFlight.dep_date} matches ${dateParam}`);
                            return true;
                        }
                    }
                    
                    // Try multiple date fields and formats (for flight API and fallback)
                    const dateFields = [
                        apiFlight.dep_time,
                        apiFlight.dep_estimated,
                        apiFlight.dep_actual,
                        apiFlight.dep_scheduled
                    ].filter(Boolean);
                    
                    for (const dateField of dateFields) {
                        try {
                            // Handle different date formats
                            let flightDateStr = '';
                            if (typeof dateField === 'string') {
                                // If it's already in YYYY-MM-DD format
                                if (dateField.match(/^\d{4}-\d{2}-\d{2}/)) {
                                    flightDateStr = dateField.split('T')[0].split(' ')[0];
                                } else {
                                    // Try to parse it
                                    const parsed = new Date(dateField);
                                    if (!isNaN(parsed.getTime())) {
                                        flightDateStr = parsed.toISOString().split('T')[0];
                                    }
                                }
                            }
                            
                            if (flightDateStr === dateParam) {
                                console.log(`Match found: ${dateField} matches ${dateParam}`);
                                return true;
                            }
                        } catch (e) {
                            // Continue to next field
                        }
                    }
                    return false;
                });
                console.log(`Filtered to ${filteredFlights.length} flights for date ${dateParam} out of ${apiFlightsArray.length} total`);
                
                // Don't return flights if they don't match the requested date
                // This ensures different dates show different data
            }
            
            const realFlights: Flight[] = filteredFlights.map((apiFlight: any) => {
                const originCode = apiFlight.dep_iata;
                const destCode = apiFlight.arr_iata;

                const originAirport = AIRPORTS[originCode?.toUpperCase()];
                const destAirport = AIRPORTS[destCode?.toUpperCase()];

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

                // For schedules API, build time string from date and time
                let depTime = apiFlight.dep_estimated || apiFlight.dep_actual || apiFlight.dep_time;
                let arrTime = apiFlight.arr_estimated || apiFlight.arr_actual || apiFlight.arr_time;
                
                // Handle schedules API format (has separate dep_date and dep_time fields)
                if (isFutureDate && apiFlight.dep_date) {
                    if (apiFlight.dep_time) {
                        // If dep_time is just time (HH:MM), combine with date
                        if (apiFlight.dep_time.match(/^\d{2}:\d{2}/)) {
                            depTime = `${apiFlight.dep_date}T${apiFlight.dep_time}:00`;
                        } else if (apiFlight.dep_time.includes('T')) {
                            depTime = apiFlight.dep_time;
                        } else {
                            depTime = `${apiFlight.dep_date}T${apiFlight.dep_time}`;
                        }
                    } else {
                        // Fallback: use date at midnight
                        depTime = `${apiFlight.dep_date}T00:00:00`;
                    }
                }
                
                if (isFutureDate && apiFlight.arr_date) {
                    if (apiFlight.arr_time) {
                        if (apiFlight.arr_time.match(/^\d{2}:\d{2}/)) {
                            arrTime = `${apiFlight.arr_date}T${apiFlight.arr_time}:00`;
                        } else if (apiFlight.arr_time.includes('T')) {
                            arrTime = apiFlight.arr_time;
                        } else {
                            arrTime = `${apiFlight.arr_date}T${apiFlight.arr_time}`;
                        }
                    } else {
                        arrTime = `${apiFlight.arr_date}T00:00:00`;
                    }
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
    }

    // No flight found - return empty array
    return NextResponse.json([]);
}
