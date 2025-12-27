import { Sprout } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground" data-testid="text-app-title">
              OntologyCrop
            </h1>
            <p className="text-sm text-muted-foreground">Sustainable Farming with Explainable AI</p>
          </div>
        </div>
      </div>
    </header>
  );
}
