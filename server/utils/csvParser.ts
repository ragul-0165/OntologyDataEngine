import { readFileSync } from 'fs';
import { join } from 'path';
import type { MarketPrice } from '@shared/schema';

export function parseMarketPricesCSV(csvPath: string): MarketPrice[] {
  const csvContent = readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  // Skip header row
  const dataLines = lines.slice(1);
  
  const prices: MarketPrice[] = [];
  
  for (const line of dataLines) {
    // Handle quoted CSV fields
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim());
    
    if (fields.length >= 10) {
      const [state, district, market, commodity, variety, grade, arrivalDate, minPriceStr, maxPriceStr, modalPriceStr] = fields;
      
      const minPrice = parseInt(minPriceStr) || 0;
      const maxPrice = parseInt(maxPriceStr) || 0;
      const modalPrice = parseInt(modalPriceStr) || 0;
      
      prices.push({
        state: state.replace(/"/g, ''),
        district: district.replace(/"/g, ''),
        market: market.replace(/"/g, ''),
        commodity: commodity.replace(/"/g, ''),
        variety: variety.replace(/"/g, ''),
        grade: grade.replace(/"/g, ''),
        arrivalDate: arrivalDate.replace(/"/g, ''),
        minPrice,
        maxPrice,
        modalPrice,
      });
    }
  }
  
  return prices;
}

export function loadMarketPrices(): MarketPrice[] {
  const csvPath = join(process.cwd(), 'attached_assets', '9ef84268-d588-465a-a308-a864a43d0070_1762326696503.csv');
  return parseMarketPricesCSV(csvPath);
}
