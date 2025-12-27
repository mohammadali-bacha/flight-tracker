import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json([]);
    }

    try {
        // AirLabs API
        const API_KEY = 'd1d40d2b-4015-46a3-b77c-01096738e6fd';

        // Clean up query (remove spaces, upper case)
        const cleanQuery = query.replace(/\s/g, '').toUpperCase();
        
        // Use schedules API to get all schedules for this flight
        const schedulesUrl = `https://airlabs.co/api/v9/schedules?flight_iata=${cleanQuery}&api_key=${API_KEY}`;
        console.log(`Calling AirLabs Schedules API for all schedules: ${query}`);
        
        const response = await fetch(schedulesUrl);
        const data = await response.json();
        
        console.log('AirLabs Schedules Response Status:', response.status);
        
        if (data.error) {
            console.log('AirLabs Schedules API returned error:', data.error.code, '-', data.error.message);
            return NextResponse.json([]);
        }
        
        let schedulesArray: any[] = [];
        if (data.response) {
            if (Array.isArray(data.response)) {
                schedulesArray = data.response;
            } else {
                schedulesArray = [data.response];
            }
        }
        
        console.log(`Found ${schedulesArray.length} schedules for flight ${cleanQuery}`);
        
        // Return raw schedules data so client can extract dates
        return NextResponse.json(schedulesArray);
    } catch (error) {
        console.error('AirLabs Schedules API failed:', error);
        return NextResponse.json([]);
    }
}

