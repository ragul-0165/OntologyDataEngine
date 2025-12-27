# OntologyCrop - Ontology-Driven Crop Recommendation System

## Overview

OntologyCrop is an AI-powered agricultural recommendation system that combines ontology-based reasoning with real-time data to provide sustainable crop recommendations for farmers. The system analyzes soil conditions, climate data, and market prices to suggest optimal crops using explainable AI principles. Built with a modern React frontend and Express backend, it processes agricultural ontology (OWX format), live weather data, and CSV-based market pricing to deliver scientifically-backed farming decisions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript and Vite as the build tool

**UI Component System**: Shadcn/ui (New York variant) built on Radix UI primitives
- Material Design principles adapted for agricultural/governmental applications
- Mobile-first responsive design optimized for smartphone usage in rural areas
- Progressive disclosure pattern showing essential information first

**State Management**:
- TanStack Query (React Query) for server state management
- Query client configured with infinite stale time and disabled refetching
- Local component state using React hooks

**Styling**:
- Tailwind CSS with custom design tokens
- CSS variables for theme customization (light/dark mode support)
- Custom spacing primitives (4, 6, 8, 12, 16, 24px units)
- Typography: Inter/Roboto primary fonts with system fallbacks

**Routing**: Wouter (lightweight client-side routing)

**Key Design Decisions**:
- Single-page application with minimal routes (Home, 404)
- Form-first interface for farm input collection
- Card-based layout for crop recommendations with expandable details
- Accessibility-first approach with ARIA labels and semantic HTML

### Backend Architecture

**Runtime**: Node.js with TypeScript (ESNext modules)

**Framework**: Express.js with middleware for:
- JSON body parsing with raw body verification
- CORS handling
- Request/response logging with timing metrics

**API Design**: RESTful endpoints
- `/api/crops` - Get all crops from ontology
- `/api/market-prices` - Get market prices with optional filters (state/district/commodity)
- `/api/weather` - Get weather data for location
- `/api/recommendations` - POST endpoint for generating crop recommendations

**Business Logic Components**:

1. **Recommendation Engine** (`RecommendationEngine` class)
   - Calculates crop suitability scores based on multi-factor analysis
   - Combines ontology rules with real-time environmental data
   - Generates explainable reasoning for each recommendation
   - Filters results to show only viable options (>50% suitability)

2. **Storage Layer** (`MemStorage` class implementing `IStorage` interface)
   - In-memory data store for rapid prototyping
   - Initialized with ontology-derived crop knowledge
   - Methods for user management and data retrieval
   - Designed for easy replacement with persistent storage

3. **CSV Parser** 
   - Parses market price data from CSV files
   - Handles quoted fields and special characters
   - Loads data on server startup

4. **Weather Service**
   - Mock weather data based on geographic patterns
   - Designed for replacement with OpenWeatherMap API integration
   - Returns temperature, humidity, rainfall, and climate description

**Data Models** (defined in shared schema):
- `Crop`: Ontology-derived crop knowledge (suitable soils, climates, water usage, carbon footprint)
- `MarketPrice`: CSV-sourced market pricing data
- `FarmInput`: User-provided farm characteristics
- `CropRecommendation`: Generated recommendation with reasoning

**Development Approach**:
- Mock data and services for rapid development
- Clear interfaces for production API integration
- Shared TypeScript types between client and server
- Path aliases for clean imports (@/, @shared/)

### Data Storage Solutions

**Current Implementation**: In-memory storage (MemStorage)
- User data stored in Map structures
- Crop ontology data preloaded on initialization
- Market prices loaded from CSV on server startup

**Database Configuration**: PostgreSQL with Drizzle ORM
- Schema defined in `shared/schema.ts`
- Drizzle Kit configured for migrations
- User table with UUID primary keys
- Ready for Neon serverless database integration

**Rationale**: In-memory storage chosen for initial development speed, with clear migration path to PostgreSQL when persistence is required. Drizzle ORM provides type-safe database access and migration tooling.

### Authentication and Authorization

**Current State**: Basic user schema defined but authentication not yet implemented

**Prepared Infrastructure**:
- User model with username/password fields in database schema
- Zod validation schemas for user input
- Session middleware support via connect-pg-simple (for PostgreSQL sessions)

**Future Implementation Path**: Session-based authentication with encrypted passwords and PostgreSQL-backed session storage.

### External Dependencies

**Third-Party UI Libraries**:
- Radix UI - Headless accessible components (@radix-ui/react-*)
- Shadcn/ui - Pre-styled component system
- Lucide React - Icon library
- class-variance-authority - CSS variant management
- Tailwind CSS - Utility-first styling

**Data Management**:
- TanStack Query v5 - Async state management
- React Hook Form - Form validation and state
- Zod - Schema validation and type inference
- date-fns - Date formatting and manipulation

**Database & ORM**:
- Drizzle ORM - Type-safe SQL query builder
- @neondatabase/serverless - Neon PostgreSQL driver
- drizzle-zod - Automatic Zod schema generation from database schema

**Development Tools**:
- Vite - Build tool and dev server
- tsx - TypeScript execution
- esbuild - Production bundling
- Replit plugins - Runtime error overlay, cartographer, dev banner

**Planned External APIs**:
- OpenWeatherMap API - Real-time weather data (currently mocked)
- Agricultural market data APIs - Live commodity pricing (currently CSV-based)

**CSV Data Sources**:
- Market price data loaded from local CSV files
- Format: State, District, Market, Commodity, Variety, Grade, Arrival Date, Min/Max/Modal Price

**Ontology Files**:
- OWX (Web Ontology Language XML) format
- Contains agricultural knowledge: crop-soil relationships, climate suitability, sustainability metrics
- Parsed and loaded into in-memory crop database on startup
