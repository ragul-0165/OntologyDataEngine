import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface MarketPrice {
  state: string;
  district: string;
  commodity: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  date: string;
}

interface MarketPricesTableProps {
  prices: MarketPrice[];
}

export default function MarketPricesTable({ prices }: MarketPricesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("all");

  const filteredPrices = prices.filter(price => {
    const matchesSearch = price.commodity.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState === "all" || price.state === selectedState;
    return matchesSearch && matchesState;
  });

  const uniqueStates = Array.from(new Set(prices.map(p => p.state)));

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-2" data-testid="text-market-title">
            Current Market Prices
          </h3>
          <p className="text-muted-foreground">
            Real-time commodity prices across different states and districts
          </p>
        </div>

        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search commodity..."
                  value={searchTerm}
                  onChange={(e) => {
                    console.log('Search:', e.target.value);
                    setSearchTerm(e.target.value);
                  }}
                  className="pl-9"
                  data-testid="input-search-commodity"
                />
              </div>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-state">
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {uniqueStates.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium">Commodity</th>
                    <th className="text-left py-3 px-4 text-sm font-medium">State</th>
                    <th className="text-left py-3 px-4 text-sm font-medium">District</th>
                    <th className="text-right py-3 px-4 text-sm font-medium">Min Price</th>
                    <th className="text-right py-3 px-4 text-sm font-medium">Max Price</th>
                    <th className="text-right py-3 px-4 text-sm font-medium">Modal Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPrices.slice(0, 10).map((price, idx) => (
                    <tr key={idx} className="hover-elevate" data-testid={`row-market-${idx}`}>
                      <td className="py-3 px-4 font-medium">{price.commodity}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{price.state}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{price.district}</td>
                      <td className="py-3 px-4 text-right text-sm">₹{price.minPrice.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-sm">₹{price.maxPrice.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-semibold">₹{price.modalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPrices.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No market data found matching your filters
              </div>
            )}

            {filteredPrices.length > 10 && (
              <div className="text-center py-4 text-sm text-muted-foreground border-t">
                Showing 10 of {filteredPrices.length} results
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
