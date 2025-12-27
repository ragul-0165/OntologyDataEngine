import { type User, type InsertUser, type Crop, type MarketPrice } from "@shared/schema";
import { readFileSync } from "fs";
import path from "path";
import { parseStringPromise } from "xml2js";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Crop and market data
  getAllCrops(): Promise<Crop[]>;
  getCropByName(name: string): Promise<Crop | undefined>;
  getMarketPrices(filters?: { state?: string; district?: string; commodity?: string }): Promise<MarketPrice[]>;
  getMarketPriceForCrop(cropName: string, state?: string, district?: string): Promise<number | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private crops: Map<string, Crop>;
  private marketPrices: MarketPrice[];

  constructor() {
    this.users = new Map();
    this.crops = new Map();
    this.marketPrices = [];
    // Ontology is loaded lazily via loadOntologyFromOwX()
  }

  async loadOntologyFromOwX(owxRelativePath = path.join("attached_assets", "ontology_1762326684560.owx")) {
    const owxPath = path.resolve(process.cwd(), owxRelativePath);
    const xml = readFileSync(owxPath, "utf-8");
    const doc = await parseStringPromise(xml, { preserveChildrenOrder: true, explicitArray: true });

    // Helper maps
    const labelByIri = new Map<string, string>();
    const classOfIndividual = new Map<string, string[]>();
    const objectLinks: Array<{ subject: string; property: string; target: string }> = [];

    const root = doc["Ontology"] ?? {};

    // Collect rdfs:label annotations
    const annotations = root["AnnotationAssertion"] ?? [];
    for (const a of annotations) {
      const iri = a?.IRI?.[0];
      const lit = a?.Literal?.[0];
      if (typeof iri === "string" && typeof lit === "string") {
        labelByIri.set(iri, lit);
      }
    }

    // Collect ClassAssertion blocks
    const classAssertions = root["ClassAssertion"] ?? [];
    for (const ca of classAssertions) {
      // Simple form: <Class/><NamedIndividual/>
      const classIri = ca?.Class?.[0]?.$.IRI as string | undefined;
      const namedIri = ca?.NamedIndividual?.[0]?.$.IRI as string | undefined;
      if (classIri && namedIri) {
        const arr = classOfIndividual.get(namedIri) ?? [];
        arr.push(classIri);
        classOfIndividual.set(namedIri, arr);
      }

      // ObjectSomeValuesFrom form ties a NamedIndividual to a property and a target class/individual
      const osv = ca?.ObjectSomeValuesFrom?.[0];
      if (osv && ca?.NamedIndividual?.[0]?.$.IRI) {
        const subj = ca.NamedIndividual[0].$.IRI as string;
        const prop = osv?.ObjectProperty?.[0]?.$.IRI as string | undefined;
        // Prefer target NamedIndividual if present, else Class
        const targetInd = osv?.NamedIndividual?.[0]?.$.IRI as string | undefined;
        const targetClass = osv?.Class?.[0]?.$.IRI as string | undefined;
        if (subj && prop && (targetInd || targetClass)) {
          objectLinks.push({ subject: subj, property: prop, target: targetInd || targetClass! });
        }
      }
    }

    // Identify the IRI that represents the Crop class
    let cropClassIri: string | undefined;
    for (const [iri, label] of labelByIri.entries()) {
      if (label.toLowerCase() === "crop") {
        cropClassIri = iri;
        break;
      }
    }

    // Find individuals that are instance of Crop
    const cropIndividuals = new Set<string>();
    for (const [ind, classes] of classOfIndividual.entries()) {
      if (classes.includes(cropClassIri!)) {
        cropIndividuals.add(ind);
      }
    }

    // Build crops
    const crops: Crop[] = [];
    const soilLabels = new Set(["Clay", "Loam", "Sandy", "ClayLoam"]);
    const climateLabels = new Set(["Tropical", "Humid", "Dry", "Moderate"]);

    // Map property IRIs to readable names via labels
    const labelByPropIri = new Map<string, string>();
    for (const [iri, label] of labelByIri.entries()) {
      if (["growsIn", "suitableFor", "hasMarketValue", "hasSustainabilityScore"].includes(label)) {
        labelByPropIri.set(iri, label);
      }
    }

    for (const ind of cropIndividuals) {
      const name = labelByIri.get(ind) || ind.split("/").pop() || ind;
      const suitableSoils: string[] = [];
      const suitableClimates: string[] = [];
      let marketValue: Crop["marketValue"] = "Medium";
      let waterUsage: Crop["waterUsage"] = "Medium";
      let carbonFootprint: Crop["carbonFootprint"] = "Medium";

      // Links originating from this crop individual
      const links = objectLinks.filter(l => l.subject === ind);
      for (const link of links) {
        const propLabel = labelByPropIri.get(link.property);
        // Resolve target label via class of target individual or direct label
        let targetLabel = labelByIri.get(link.target);
        if (!targetLabel) {
          // If target is an individual, find one of its classes and label that
          const targetClasses = classOfIndividual.get(link.target) || [];
          for (const tc of targetClasses) {
            const lbl = labelByIri.get(tc);
            if (lbl) { targetLabel = lbl; break; }
          }
        }
        if (!targetLabel) continue;

        if (propLabel === "growsIn" && soilLabels.has(targetLabel)) {
          if (!suitableSoils.includes(targetLabel)) suitableSoils.push(targetLabel);
        }
        if ((propLabel === "suitableFor" || propLabel === "growsIn") && climateLabels.has(targetLabel)) {
          if (!suitableClimates.includes(targetLabel)) suitableClimates.push(targetLabel);
        }
        if (propLabel === "hasMarketValue") {
          const mv = targetLabel as Crop["marketValue"]; // High/Medium/Low
          if (["High", "Medium", "Low"].includes(mv)) marketValue = mv;
        }
        if (propLabel === "hasSustainabilityScore") {
          if (/HighWaterUse/i.test(targetLabel)) waterUsage = "High";
          if (/LowWaterUse/i.test(targetLabel) || /LowwaterUse/i.test(targetLabel)) waterUsage = "Low";
          if (/HighCarbonFootprint/i.test(targetLabel)) carbonFootprint = "High";
        }
      }

      const crop: Crop = {
        id: name.toLowerCase(),
        name,
        suitableSoils: suitableSoils.length ? suitableSoils : ["Loam"],
        suitableClimates: suitableClimates.length ? suitableClimates : ["Moderate"],
        waterUsage,
        carbonFootprint,
        marketValue,
      };
      this.crops.set(crop.name.toLowerCase(), crop);
      crops.push(crop);
    }

    if (crops.length === 0) {
      throw new Error("No crops parsed from ontology OWX file");
    }
  }

  setMarketPrices(prices: MarketPrice[]) {
    this.marketPrices = prices;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllCrops(): Promise<Crop[]> {
    return Array.from(this.crops.values());
  }

  async getCropByName(name: string): Promise<Crop | undefined> {
    return this.crops.get(name.toLowerCase());
  }

  async getMarketPrices(filters?: { state?: string; district?: string; commodity?: string }): Promise<MarketPrice[]> {
    let filtered = this.marketPrices;

    if (filters?.state) {
      filtered = filtered.filter(p => p.state.toLowerCase() === filters.state!.toLowerCase());
    }
    if (filters?.district) {
      filtered = filtered.filter(p => p.district.toLowerCase() === filters.district!.toLowerCase());
    }
    if (filters?.commodity) {
      filtered = filtered.filter(p => p.commodity.toLowerCase().includes(filters.commodity!.toLowerCase()));
    }

    return filtered;
  }

  /**
   * Generate possible commodity name variations for a given crop name.
   * Handles common variations like "Paddy" → ["Paddy", "Paddy Rice", "Rice"]
   */
  private getCommodityNameVariations(cropName: string): string[] {
    const name = cropName.toLowerCase().trim();
    const variations = new Set<string>([cropName]); // Include original
    
    // Common mappings
    const synonymMap: Record<string, string[]> = {
      "paddy": ["paddy", "paddy rice", "rice", "rice paddy"],
      "groundnut": ["groundnut", "ground nut", "peanut", "peanuts"],
      "maize": ["maize", "corn", "sweet corn"],
      "cotton": ["cotton", "cotton seed"],
    };
    
    // Check if we have a known synonym mapping
    if (synonymMap[name]) {
      synonymMap[name].forEach(v => variations.add(v));
    } else {
      // Fallback: try common patterns
      // If crop name is a single word, try adding common suffixes
      if (!name.includes(" ")) {
        variations.add(`${name} seed`);
        variations.add(`${name} grain`);
      }
    }
    
    return Array.from(variations);
  }

  async getMarketPriceForCrop(cropName: string, state?: string, district?: string): Promise<number | undefined> {
    // Try multiple commodity name variations
    const variations = this.getCommodityNameVariations(cropName);
    
    // First, try location-specific match with variations
    for (const variation of variations) {
      const prices = await this.getMarketPrices({ state, district, commodity: variation });
      if (prices.length > 0) {
        const sum = prices.reduce((acc, p) => acc + p.modalPrice, 0);
        return Math.round(sum / prices.length);
      }
    }
    
    // If no location match, try national match with variations
    for (const variation of variations) {
      const nationalPrices = await this.getMarketPrices({ commodity: variation });
      if (nationalPrices.length > 0) {
        const sum = nationalPrices.reduce((acc, p) => acc + p.modalPrice, 0);
        return Math.round(sum / nationalPrices.length);
      }
    }
    
    return undefined;
  }
}

export const storage = new MemStorage();
