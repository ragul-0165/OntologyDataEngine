import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import FarmInputForm, { type FarmData } from "@/components/FarmInputForm";
import RecommendationsSection from "@/components/RecommendationsSection";
import MarketPricesTable, { type MarketPrice } from "@/components/MarketPricesTable";
import Footer from "@/components/Footer";
import { type CropRecommendation } from "@/components/CropRecommendationCard";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RecommendationResponse {
  recommendations: Array<{
    cropName: string;
    suitabilityScore: number;
    marketPrice: number;
    waterUsage: "Low" | "Medium" | "High";
    carbonFootprint: "Low" | "Medium" | "High";
    soilMatch: string;
    climateMatch: string;
    reasoning: string[];
  }>;
  weatherData: {
    temperature: number;
    humidity: number;
    rainfall: number;
    description: string;
  };
  location: string;
}

export default function Home() {
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState<{ temperature: number; humidity: number; rainfall: number } | null>(null);
  const { toast } = useToast();

  // Fetch market prices
  const { data: marketPricesData } = useQuery<MarketPrice[]>({
    queryKey: ["/api/market-prices"],
  });

  const marketPrices = marketPricesData || [];

  // Mutation for generating recommendations
  const recommendationMutation = useMutation({
    mutationFn: async (farmData: FarmData) => {
      const response = await apiRequest("POST", "/api/recommendations", farmData);
      const data: RecommendationResponse = await response.json();
      return data;
    },
    onSuccess: (data) => {
      const mappedRecommendations: CropRecommendation[] = data.recommendations.map((rec) => ({
        name: rec.cropName,
        suitabilityScore: rec.suitabilityScore,
        marketPrice: rec.marketPrice,
        waterUsage: rec.waterUsage,
        carbonFootprint: rec.carbonFootprint,
        soilMatch: rec.soilMatch,
        climateMatch: rec.climateMatch,
        reasoning: rec.reasoning,
      }));
      
      setRecommendations(mappedRecommendations);
      setLocation(data.location);
      setWeather(data.weatherData);

      // Scroll to recommendations
      setTimeout(() => {
        document.getElementById('recommendations')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      toast({
        title: "Recommendations Generated",
        description: `Found ${data.recommendations.length} suitable crops for your farm conditions.`,
      });
    },
    onError: (error: Error) => {
      console.error("Failed to generate recommendations:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = (data: FarmData) => {
    console.log('Generating recommendations for:', data);
    recommendationMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroBanner />
      <FarmInputForm 
        onSubmit={handleFormSubmit}
        weather={weather}
      />
      <div id="recommendations">
        <RecommendationsSection recommendations={recommendations} location={location} />
      </div>
      <MarketPricesTable prices={marketPrices} />
      <Footer />
    </div>
  );
}
