import type { Crop, CropRecommendation, FarmInput, WeatherData } from '@shared/schema';
import { storage } from '../storage';
import { generateExplanation } from './grok';

export interface RecommendationEngineOptions {
  farmInput: FarmInput;
  weatherData?: WeatherData;
}

export class RecommendationEngine {
  async generateRecommendations(options: RecommendationEngineOptions): Promise<CropRecommendation[]> {
    const { farmInput, weatherData } = options;
    const allCrops = await storage.getAllCrops();
    
    const recommendations: CropRecommendation[] = [];
    
    for (const crop of allCrops) {
      const suitability = this.calculateSuitability(crop, farmInput, weatherData);
      
      if (suitability.score > 50) {
        const marketPrice = await storage.getMarketPriceForCrop(
          crop.name,
          farmInput.state,
          farmInput.district
        );
        
        const base: CropRecommendation = {
          cropName: crop.name,
          suitabilityScore: suitability.score,
          marketPrice: marketPrice || 0,
          waterUsage: crop.waterUsage,
          carbonFootprint: crop.carbonFootprint,
          soilMatch: suitability.soilReasoning,
          climateMatch: suitability.climateReasoning,
          reasoning: suitability.additionalReasons,
        };

        // Optionally augment reasoning with LLM explanation (non-blocking on failure)
        if (weatherData) {
          const explanation = await generateExplanation({
            cropName: crop.name,
            soilMatch: base.soilMatch,
            climateMatch: base.climateMatch,
            marketPrice: base.marketPrice,
            location: `${farmInput.district}, ${farmInput.state}`,
            weather: weatherData,
          });
          if (explanation) base.reasoning = [...base.reasoning, explanation];
        }

        recommendations.push(base);
      }
    }
    
    // Sort by suitability score descending
    recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    
    return recommendations;
  }
  
  private calculateSuitability(
    crop: Crop,
    farmInput: FarmInput,
    weatherData?: WeatherData
  ): {
    score: number;
    soilReasoning: string;
    climateReasoning: string;
    additionalReasons: string[];
  } {
    let score = 0;
    let soilPoints = 0;
    let climatePoints = 0;
    let weatherPoints = 0;
    let sustainabilityPoints = 0;
    const reasons: string[] = [];
    
    // Soil match (40 points)
    const soilMatch = crop.suitableSoils.some(s => s.toLowerCase() === farmInput.soilType.toLowerCase());
    let soilReasoning = '';
    
    if (soilMatch) {
      score += 40; soilPoints += 40;
      soilReasoning = `${farmInput.soilType} soil is optimal for ${crop.name} cultivation based on ontology rules`;
      reasons.push(`Ontology rule: ${crop.name} thrives in ${farmInput.soilType} soil conditions`);
    } else {
      soilReasoning = `${farmInput.soilType} soil is not the ideal match for ${crop.name}, which prefers ${crop.suitableSoils.join(' or ')} soil`;
      score += 10; soilPoints += 10;
    }
    
    // Climate match (40 points)
    const climateMatch = crop.suitableClimates.some(c => c.toLowerCase() === farmInput.climate.toLowerCase());
    let climateReasoning = '';
    
    if (climateMatch) {
      score += 40; climatePoints += 40;
      climateReasoning = `${farmInput.climate} climate conditions are ideal for ${crop.name} growth`;
      reasons.push(`Climate requirements perfectly align with ${farmInput.climate} conditions`);
    } else {
      climateReasoning = `${farmInput.climate} climate may pose challenges for ${crop.name}, which prefers ${crop.suitableClimates.join(' or ')} conditions`;
      score += 10; climatePoints += 10;
    }
    
    // Weather data bonus (10 points)
    if (weatherData) {
      if (crop.waterUsage === "High" && weatherData.humidity > 70) {
        score += 10; weatherPoints += 10;
        reasons.push(`Current high humidity (${weatherData.humidity}%) supports water-intensive crops`);
      } else if (crop.waterUsage === "Low" && weatherData.humidity < 60) {
        score += 10; weatherPoints += 10;
        reasons.push(`Low humidity conditions favor drought-tolerant varieties`);
      } else {
        score += 5; weatherPoints += 5;
        reasons.push(`Weather conditions are moderately suitable`);
      }
    }
    
    // Sustainability bonus (10 points)
    if (crop.carbonFootprint === "Low") {
      score += 5; sustainabilityPoints += 5;
      reasons.push(`Low carbon footprint supports sustainable farming practices`);
    }
    
    if (crop.waterUsage === "Low" && farmInput.climate === "Dry") {
      score += 5; sustainabilityPoints += 5;
      reasons.push(`Water-efficient crop is well-suited for dry climate conditions`);
    }
    
    // Market value consideration
    if (crop.marketValue === "High") {
      reasons.push(`High market value provides strong economic returns`);
    }
    
    const total = Math.min(100, Math.round(score));
    const breakdown = `Score breakdown → Soil: ${soilPoints}, Climate: ${climatePoints}, Weather: ${weatherPoints}, Sustainability: ${sustainabilityPoints}; Total: ${total}%`;
    reasons.unshift(breakdown);

    return {
      score: total,
      soilReasoning,
      climateReasoning,
      additionalReasons: reasons,
    };
  }
}
