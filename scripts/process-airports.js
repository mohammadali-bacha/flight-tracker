const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../airports.csv');
const outputPath = path.join(__dirname, '../app/data/airports.json');
const outputDir = path.dirname(outputPath);

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const fileContent = fs.readFileSync(csvPath, 'utf-8');
const lines = fileContent.split('\n');

const airports = {};

// Skip header
for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parser that handles quoted fields
    const parts = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            parts.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    parts.push(current);

    // Columns based on header:
    // 0: id, 1: ident, 2: type, 3: name, 4: latitude_deg, 5: longitude_deg, 
    // 6: elevation_ft, 7: continent, 8: iso_country, 9: iso_region, 
    // 10: municipality, 11: scheduled_service, 12: icao_code, 13: iata_code
    
    const iataCode = parts[13] ? parts[13].replace(/"/g, '') : '';
    
    if (iataCode && iataCode.length === 3) {
        const lat = parseFloat(parts[4]);
        const lon = parseFloat(parts[5]);
        const city = parts[10] ? parts[10].replace(/"/g, '') : '';
        const country = parts[8] ? parts[8].replace(/"/g, '') : '';
        const name = parts[3] ? parts[3].replace(/"/g, '') : '';
        
        // Only add if we have valid coordinates
        if (!isNaN(lat) && !isNaN(lon)) {
            airports[iataCode] = {
                lat,
                lon,
                city,
                country,
                name
            };
        }
    }
}

fs.writeFileSync(outputPath, JSON.stringify(airports, null, 2));
console.log(`Processed ${Object.keys(airports).length} airports with IATA codes.`);
