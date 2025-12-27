import { Database, CloudSun, Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-primary" />
              About OntologyCrop
            </h4>
            <p className="text-sm text-muted-foreground">
              An AI-powered system using agricultural ontology to provide sustainable crop recommendations based on scientific reasoning.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              Data Sources
            </h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>Agricultural Market Data (Updated Daily)</li>
              <li>Weather API - Real-time Climate Data</li>
              <li>Agricultural Ontology Knowledge Base</li>
            </ul>
          </div>

          {/** Quick Links removed as requested **/}
        </div>

        <div className="text-center pt-8 border-t text-sm text-muted-foreground">
          <p>
            Powered by Agricultural Ontology & Explainable AI | 
            Market Data as of November 2025
          </p>
        </div>
      </div>
    </footer>
  );
}
