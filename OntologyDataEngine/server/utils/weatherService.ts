import type { WeatherData } from '@shared/schema';

// Use OpenWeatherMap geocoding to resolve lat/lon, then fetch current weather by coords.
export async function getWeatherData(state: string, district: string): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) throw new Error('OPENWEATHER_API_KEY not set');

  const tryGeocode = async (query: string) => {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const arr: any[] = await res.json();
    if (!Array.isArray(arr) || arr.length === 0) return undefined;
    const item = arr[0];
    return { lat: item?.lat as number | undefined, lon: item?.lon as number | undefined };
  };

  // Try district+state, then district, then state, always with country IN
  let coords = await tryGeocode(`${district}, ${state}, IN`);
  if (!coords) coords = await tryGeocode(`${district}, IN`);
  if (!coords) coords = await tryGeocode(`${state}, IN`);
  if (!coords || coords.lat == null || coords.lon == null) {
    throw new Error(`Could not geocode location: ${district}, ${state}`);
  }

  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`;
  const weatherRes = await fetch(weatherUrl);
  if (!weatherRes.ok) {
    const text = await weatherRes.text();
    throw new Error(`Weather API error ${weatherRes.status}: ${text}`);
  }
  const data: any = await weatherRes.json();

  const temperature = Math.round((data?.main?.temp ?? 0) as number);
  const humidity = Math.round((data?.main?.humidity ?? 0) as number);
  const rainfall = Math.round(((data?.rain?.['1h'] ?? data?.rain?.['3h'] ?? 0) as number));
  const description = (data?.weather?.[0]?.description ?? 'current weather').toString();

  return { temperature, humidity, rainfall, description };
}
