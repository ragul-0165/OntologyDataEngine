import { CheckCircle, Droplet, Leaf, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export interface CropRecommendation {
  name: string;
  suitabilityScore: number;
  marketPrice: number;
  waterUsage: "Low" | "Medium" | "High";
  carbonFootprint: "Low" | "Medium" | "High";
  soilMatch: string;
  climateMatch: string;
  reasoning: string[];
}

interface CropRecommendationCardProps {
  crop: CropRecommendation;
}

export default function CropRecommendationCard({ crop }: CropRecommendationCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getSuitabilityBadge = (score: number) => {
    if (score >= 80) return { variant: "default" as const, label: "Excellent", color: "bg-primary" };
    if (score >= 60) return { variant: "secondary" as const, label: "Good", color: "bg-chart-2" };
    return { variant: "secondary" as const, label: "Moderate", color: "bg-chart-3" };
  };

  const getUsageColor = (level: string) => {
    if (level === "Low") return "text-primary";
    if (level === "Medium") return "text-chart-2";
    return "text-destructive";
  };

  const suitability = getSuitabilityBadge(crop.suitabilityScore);

  return (
    <Card className="hover-elevate" data-testid={`card-crop-${crop.name}`}>
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl" data-testid={`text-crop-name-${crop.name}`}>
              {crop.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Recommended for your farm</p>
          </div>
          <Badge variant={suitability.variant} className="text-base px-3 py-1">
            {crop.suitabilityScore}%
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <div className={`h-2 flex-1 rounded-full bg-muted overflow-hidden`}>
            <div
              className={`h-full ${suitability.color} transition-all`}
              style={{ width: `${crop.suitabilityScore}%` }}
            />
          </div>
          <span className="text-sm font-medium">{suitability.label}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2 border-t pt-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Market Price</p>
            <p className="text-xl font-bold" data-testid={`text-price-${crop.name}`}>
              ₹{crop.marketPrice.toLocaleString()}/quintal
            </p>
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Sustainability Metrics
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Droplet className={`w-4 h-4 ${getUsageColor(crop.waterUsage)}`} />
              <div>
                <p className="text-xs text-muted-foreground">Water Usage</p>
                <p className="text-sm font-semibold">{crop.waterUsage}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className={`w-4 h-4 ${getUsageColor(crop.carbonFootprint)}`} />
              <div>
                <p className="text-xs text-muted-foreground">Carbon Impact</p>
                <p className="text-sm font-semibold">{crop.carbonFootprint}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log(`Toggling details for ${crop.name}`);
              setShowDetails(!showDetails);
            }}
            className="w-full justify-between"
            data-testid={`button-details-${crop.name}`}
          >
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Why Recommended?
            </span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          {showDetails && (
            <div className="mt-4 space-y-3 text-sm">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Soil Compatibility</p>
                    <p className="text-muted-foreground">{crop.soilMatch}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Climate Suitability</p>
                    <p className="text-muted-foreground">{crop.climateMatch}</p>
                  </div>
                </div>
                {crop.reasoning.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">{reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
