import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { farmInputSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { loadMarketPrices } from "./utils/csvParser";
import { RecommendationEngine } from "./utils/recommendationEngine";
import { getWeatherData } from "./utils/weatherService";

export function registerRoutes(app: Express): Server {
  // Initialize market prices from CSV on startup
  try {
    const marketPrices = loadMarketPrices();
    storage.setMarketPrices(marketPrices);
    console.log(`Loaded ${marketPrices.length} market price records from CSV`);
  } catch (error) {
    console.error("Failed to load market prices:", error);
  }

  // Initialize crops from ontology file on startup
  storage.loadOntologyFromOwX().then(() => {
    console.log("Loaded crops from ontology OWX file");
  }).catch((err) => {
    console.error("Failed to load ontology:", err);
  });

  // Get all crops from ontology
  app.get("/api/crops", async (req, res) => {
    try {
      const crops = await storage.getAllCrops();
      res.json(crops);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get market prices with optional filters
  app.get("/api/market-prices", async (req, res) => {
    try {
      const { state, district, commodity } = req.query;
      
      const prices = await storage.getMarketPrices({
        state: state as string | undefined,
        district: district as string | undefined,
        commodity: commodity as string | undefined,
      });
      
      res.json(prices);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get weather data for a location
  app.get("/api/weather", async (req, res) => {
    try {
      const { state, district } = req.query;
      
      if (!state || !district) {
        return res.status(400).json({ error: "State and district are required" });
      }
      
      const weatherData = await getWeatherData(state as string, district as string);
      res.json(weatherData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Generate crop recommendations based on farm input
  app.post("/api/recommendations", async (req, res) => {
    try {
      // Validate input
      const parseResult = farmInputSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      
      const farmInput = parseResult.data;
      
      // Get weather data for the location
      const weatherData = await getWeatherData(farmInput.state, farmInput.district);
      
      // Generate recommendations using the engine
      const engine = new RecommendationEngine();
      const recommendations = await engine.generateRecommendations({
        farmInput,
        weatherData,
      });
      
      res.json({
        recommendations,
        weatherData,
        location: `${farmInput.district}, ${farmInput.state}`,
      });
    } catch (error: any) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
