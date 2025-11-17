import RecommendationsSection from '../RecommendationsSection'

export default function RecommendationsSectionExample() {
  const mockRecommendations = [
    {
      name: "Paddy",
      suitabilityScore: 92,
      marketPrice: 2389,
      waterUsage: "High" as const,
      carbonFootprint: "Medium" as const,
      soilMatch: "Clay soil provides excellent water retention for paddy",
      climateMatch: "Humid tropical climate is ideal for rice",
      reasoning: ["High water retention in clay soil", "Adequate rainfall patterns"]
    },
    {
      name: "Cotton",
      suitabilityScore: 85,
      marketPrice: 7050,
      waterUsage: "Medium" as const,
      carbonFootprint: "Low" as const,
      soilMatch: "Well-drained loamy soil suits cotton cultivation",
      climateMatch: "Moderate temperatures favor cotton growth",
      reasoning: ["Good drainage in selected soil", "Suitable temperature range"]
    },
    {
      name: "Groundnut",
      suitabilityScore: 78,
      marketPrice: 5000,
      waterUsage: "Low" as const,
      carbonFootprint: "Low" as const,
      soilMatch: "Sandy loam allows proper root development",
      climateMatch: "Warm climate supports groundnut maturation",
      reasoning: ["Nitrogen-fixing legume improves soil", "Drought-tolerant variety"]
    }
  ];

  return (
    <RecommendationsSection 
      recommendations={mockRecommendations}
      location="Ernakulam, Kerala"
    />
  )
}
