import { Leaf, Database, CloudSun } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HeroBanner() {
  return (
    <section className="bg-primary/5 border-b">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground" data-testid="text-hero-title">
            Ontology-Driven Crop Recommendation System
          </h2>
          {/** Subtitle removed as requested **/}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Badge variant="secondary" className="gap-2 py-1.5 px-3">
              <Leaf className="w-4 h-4" />
              Agricultural Ontology
            </Badge>
            <Badge variant="secondary" className="gap-2 py-1.5 px-3">
              <CloudSun className="w-4 h-4" />
              Real-time Weather
            </Badge>
            <Badge variant="secondary" className="gap-2 py-1.5 px-3">
              <Database className="w-4 h-4" />
              Live Market Data
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
