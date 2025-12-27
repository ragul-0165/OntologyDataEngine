interface GenerateExplanationArgs {
  cropName: string;
  soilMatch: string;
  climateMatch: string;
  marketPrice: number;
  location: string;
  weather: { temperature: number; humidity: number; rainfall: number; description: string };
}

export async function generateExplanation(args: GenerateExplanationArgs): Promise<string | undefined> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) return undefined;

  const prompt = `You are an agronomy assistant. Explain concisely (in 2-4 sentences) why the crop "${args.cropName}" is recommended for ${args.location} given:
- Soil: ${args.soilMatch}
- Climate: ${args.climateMatch}
- Weather: ${args.weather.temperature}°C, ${args.weather.humidity}% humidity, rainfall ${args.weather.rainfall}mm, ${args.weather.description}
- Typical local market price (modal): ₹${args.marketPrice}
Focus on agronomic suitability and market context.`;

  try {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          { role: 'system', content: 'You are a precise, neutral agronomy assistant.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 180,
      }),
      // 8s timeout via AbortSignal if environment supports
    });
    if (!res.ok) {
      return undefined;
    }
    const data: any = await res.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content;
    return text?.trim();
  } catch {
    return undefined;
  }
}


