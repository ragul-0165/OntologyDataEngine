import CropRecommendationCard from '../CropRecommendationCard'

export default function CropRecommendationCardExample() {
  const mockCrop = {
    name: "Paddy",
    suitabilityScore: 92,
    marketPrice: 2389,
    waterUsage: "High" as const,
    carbonFootprint: "Medium" as const,
    soilMatch: "Clay soil provides excellent water retention needed for paddy cultivation",
    climateMatch: "Humid tropical climate with high rainfall is ideal for rice production",
    reasoning: [
      "Ontology rule: Paddy requires clayey soil with high water retention capacity",
      "Current weather conditions show adequate humidity and temperature",
      "Strong market demand with stable prices in your region"
    ]
  };

  return <CropRecommendationCard crop={mockCrop} />
}
