import { useEffect, useMemo, useState } from "react";
import { MapPin, CloudRain, Thermometer, Droplets, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface FarmInputFormProps {
  onSubmit: (data: FarmData) => void;
  weather?: {
    temperature: number;
    humidity: number;
    rainfall: number;
  } | null;
}

export interface FarmData {
  state: string;
  district: string;
  soilType: string;
  climate: string;
  farmSize: number;
}

export default function FarmInputForm({ onSubmit, weather }: FarmInputFormProps) {
  const [formData, setFormData] = useState<FarmData>({
    state: "",
    district: "",
    soilType: "",
    climate: "",
    farmSize: 1,
  });

  // Build state → districts map from CSV-backed endpoint
  const [locations, setLocations] = useState<Record<string, Set<string>>>({});
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingLocations(true);
        setLocationError(null);
        const res = await fetch('/api/market-prices');
        if (!res.ok) throw new Error(`Failed to load locations (${res.status})`);
        const data: Array<{ state: string; district: string }> = await res.json();
        const map: Record<string, Set<string>> = {};
        for (const row of data) {
          const s = row.state?.toString().trim();
          const d = row.district?.toString().trim();
          if (!s || !d) continue;
          if (!map[s]) map[s] = new Set<string>();
          map[s].add(d);
        }

        // Ensure Tamil Nadu and its districts are present (additive; keeps existing states/districts unchanged)
        const tamilNaduDistricts = [
          "Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem","Erode","Tirunelveli","Thoothukudi",
          "Vellore","Kanchipuram","Tiruppur","Thanjavur","Dindigul","Cuddalore","Villupuram","Tiruvarur",
          "Pudukkottai","Nagapattinam","Ramanathapuram","Sivaganga","Karur","Namakkal","Krishnagiri",
          "Dharmapuri","Kallakurichi","Tenkasi","Chengalpattu","Ariyalur","Perambalur","Mayiladuthurai",
          "Tiruvallur","Ranipet","Tirupattur","The Nilgiris"
        ];
        if (!map["Tamil Nadu"]) map["Tamil Nadu"] = new Set<string>();
        for (const d of tamilNaduDistricts) map["Tamil Nadu"].add(d);
        if (!cancelled) setLocations(map);
      } catch (e: any) {
        if (!cancelled) setLocationError(e?.message || 'Failed to load states');
      } finally {
        if (!cancelled) setLoadingLocations(false);
      }
    })();
    return () => { cancelled = true };
  }, []);

  const stateOptions = useMemo(() => Object.keys(locations).sort(), [locations]);
  const districtOptions = useMemo(() => {
    const set = locations[formData.state];
    return set ? Array.from(set).sort() : [];
  }, [locations, formData.state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    onSubmit(formData);
  };

  return (
    <section className="py-16 bg-background">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold mb-2" data-testid="text-form-title">
            Enter Your Farm Details
          </h3>
          <p className="text-muted-foreground">
            Provide information about your farm location and conditions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h4 className="text-lg font-medium">Location</h4>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="state" className="text-sm font-medium">
                    State
                  </Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => setFormData({ ...formData, state: value, district: "" })}
                  >
                    <SelectTrigger id="state" data-testid="select-state">
                      <SelectValue placeholder={loadingLocations ? "Loading states..." : "Select your state"} />
                    </SelectTrigger>
                    <SelectContent>
                      {stateOptions.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {locationError && (
                    <p className="text-xs text-destructive mt-2">{locationError}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="district" className="text-sm font-medium">
                    District
                  </Label>
                  <Select
                    value={formData.district}
                    onValueChange={(value) => setFormData({ ...formData, district: value })}
                    disabled={!formData.state}
                  >
                    <SelectTrigger id="district" data-testid="select-district">
                      {formData.district || "Select your district"}
                    </SelectTrigger>
                    <SelectContent>
                      {districtOptions.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="w-5 h-5 text-primary" />
                <h4 className="text-lg font-medium">Soil & Climate</h4>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Soil Type</Label>
                <RadioGroup
                  value={formData.soilType}
                  onValueChange={(value) => setFormData({ ...formData, soilType: value })}
                  className="grid grid-cols-2 gap-3"
                >
                  {["Clay", "Loam", "Sandy", "ClayLoam"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={`soil-${type}`} data-testid={`radio-soil-${type}`} />
                      <Label htmlFor={`soil-${type}`} className="font-normal cursor-pointer">
                        {type === "ClayLoam" ? "Clay Loam" : type}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Climate Condition</Label>
                <RadioGroup
                  value={formData.climate}
                  onValueChange={(value) => setFormData({ ...formData, climate: value })}
                  className="grid grid-cols-2 gap-3"
                >
                  {["Tropical", "Humid", "Dry", "Moderate"].map((climate) => (
                    <div key={climate} className="flex items-center space-x-2">
                      <RadioGroupItem value={climate} id={`climate-${climate}`} data-testid={`radio-climate-${climate}`} />
                      <Label htmlFor={`climate-${climate}`} className="font-normal cursor-pointer">
                        {climate}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="farmSize" className="text-sm font-medium">
                  Farm Size (acres)
                </Label>
                <Input
                  id="farmSize"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="Enter farm size"
                  value={formData.farmSize}
                  onChange={(e) => setFormData({ ...formData, farmSize: parseFloat(e.target.value) || 1 })}
                  data-testid="input-farm-size"
                />
              </div>

              
            </div>
          </Card>

          {weather && formData.district && (
            <Card className="p-6 bg-primary/5">
              <div className="space-y-4">
                <h4 className="text-lg font-medium flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-primary" />
                  Current Weather Conditions
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Temperature</p>
                      <p className="text-lg font-semibold" data-testid="text-temperature">{weather.temperature}°C</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Humidity</p>
                      <p className="text-lg font-semibold" data-testid="text-humidity">{weather.humidity}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Rainfall</p>
                      <p className="text-lg font-semibold" data-testid="text-rainfall">{weather.rainfall}mm</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!formData.state || !formData.district || !formData.soilType || !formData.climate || formData.farmSize <= 0}
            data-testid="button-get-recommendations"
          >
            Get Crop Recommendations
          </Button>
        </form>
      </div>
    </section>
  );
}
