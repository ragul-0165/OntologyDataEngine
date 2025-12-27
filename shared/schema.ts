import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Crop knowledge from ontology
export interface Crop {
  id: string;
  name: string;
  suitableSoils: string[]; // Clay, Loam, Sandy, ClayLoam
  suitableClimates: string[]; // Tropical, Humid, Dry, Moderate
  waterUsage: "Low" | "Medium" | "High";
  carbonFootprint: "Low" | "Medium" | "High";
  marketValue: "Low" | "Medium" | "High";
}

// Market price data from CSV
export interface MarketPrice {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}

// Farm input from user
export interface FarmInput {
  state: string;
  district: string;
  soilType: string;
  climate: string;
  farmSize: number;
}

export const farmInputSchema = z.object({
  state: z.string().min(1),
  district: z.string().min(1),
  soilType: z.enum(["Clay", "Loam", "Sandy", "ClayLoam"]),
  climate: z.enum(["Tropical", "Humid", "Dry", "Moderate"]),
  farmSize: z.number().positive(),
});

export type FarmInputType = z.infer<typeof farmInputSchema>;

// Crop recommendation output
export interface CropRecommendation {
  cropName: string;
  suitabilityScore: number;
  marketPrice: number;
  waterUsage: "Low" | "Medium" | "High";
  carbonFootprint: "Low" | "Medium" | "High";
  soilMatch: string;
  climateMatch: string;
  reasoning: string[];
}

// Weather data
export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  description: string;
}
