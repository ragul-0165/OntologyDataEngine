# Design Guidelines: Ontology-Driven Crop Recommendation System

## Design Approach

**Selected Approach:** Design System - Material Design principles adapted for agricultural/governmental applications
**Justification:** Information-dense application requiring clear hierarchy, form inputs, data visualization, and trust-building for farmer users. Prioritizes usability, accessibility, and mobile-first design for rural connectivity.

**Key Design Principles:**
- Clarity over decoration: Every element serves a functional purpose
- Progressive disclosure: Show essential information first, details on demand
- Trust signals: Scientific credibility through structured data presentation
- Mobile-first: Optimized for smartphone usage in rural areas

---

## Core Design Elements

### A. Typography

**Font Family:** 
- Primary: Inter or Roboto via Google Fonts CDN
- System fallback: -apple-system, BlinkMacSystemFont, "Segoe UI"

**Hierarchy:**
- Page Title: text-4xl font-bold (farmer dashboard, recommendations)
- Section Headers: text-2xl font-semibold 
- Card Titles: text-xl font-medium
- Body Text: text-base font-normal
- Labels: text-sm font-medium uppercase tracking-wide
- Data Values: text-lg font-semibold (prices, scores)
- Helper Text: text-sm font-normal

---

### B. Layout System

**Spacing Primitives:** Tailwind units of 4, 6, 8, 12, 16, 24
- Component padding: p-6 (cards), p-8 (sections)
- Vertical rhythm: space-y-8 (sections), space-y-4 (form groups)
- Horizontal spacing: gap-6 (grids), gap-4 (inline elements)

**Container Structure:**
- Max-width: max-w-7xl mx-auto px-4
- Form containers: max-w-2xl mx-auto
- Data tables: w-full with horizontal scroll on mobile

**Grid Layouts:**
- Crop recommendation cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Input form: Single column on all viewports for clarity
- Market data: Responsive table/card hybrid

---

### C. Component Library

#### Header & Navigation
- Sticky header with application title and subtitle
- Navigation: "New Recommendation" | "Market Prices" | "About Ontology"
- Mobile: Hamburger menu (Heroicons: Bars3Icon)

#### Hero Section
- **No large hero image** - This is a utility application
- Compact banner (h-32 to h-40) with:
  - App title: "Ontology-Driven Crop Recommendation System"
  - Tagline: "Sustainable Farming with Explainable AI"
  - Trust badge: "Powered by Agricultural Ontology & Real-time Data"

#### Form Components (Primary User Input)
**Location Input:**
- Dropdown selects for State and District (populated from CSV)
- Icons: MapPinIcon (Heroicons)

**Soil & Climate Inputs:**
- Radio button groups for soil type (Clay, Loam, Sandy, Clay Loam)
- Radio buttons for climate (Tropical, Humid, Dry, Moderate)
- Each option shows icon + label

**Additional Parameters:**
- Number input for farm size (acres)
- Current weather display (fetched from API): temp, humidity, rainfall
- Auto-detect location button (optional convenience)

**Submit Button:**
- Large, prominent: py-4 px-8 text-lg font-semibold
- Full-width on mobile, centered on desktop
- Icon: SparklesIcon or BeakerIcon

#### Recommendation Cards (Core Output)
**Card Structure (3-column grid on desktop):**
```
[Crop Icon/Image placeholder]
Crop Name (text-2xl font-bold)
Market Price: ₹X,XXX/quintal (text-xl)
Suitability Score: XX% (large, prominent)

Why Recommended: (text-base)
• Soil Match: [ontology reasoning]
• Climate Fit: [explanation]
• Water Usage: Low/Medium/High
• Carbon Footprint: [metric]

[View Details Button]
```

**Visual Indicators:**
- Suitability badges: 80-100% (Excellent), 60-79% (Good), 40-59% (Moderate)
- Sustainability icons: Water droplet, leaf for carbon
- Use Heroicons: CheckCircleIcon, ExclamationTriangleIcon

#### Market Data Table
- Sortable columns: State, District, Commodity, Price, Date
- Mobile: Card layout showing essential fields
- Filters: State dropdown, commodity search
- Desktop: Sticky header with horizontal scroll

#### Explainable AI Section
**Reasoning Display:**
- Expandable accordion per crop
- Visual flowchart/steps showing ontology reasoning path
- Highlighting matched rules from OWX file
- Icons for each reasoning step (Heroicons: ArrowRightIcon)

#### Footer
- Compact (py-8)
- Credits: Data sources (OpenWeatherMap, Market CSV date)
- Links: Privacy, Contact, Ontology Details
- Trust elements: "Based on Agricultural Science Ontology"

---

### D. Animations

**Minimal, Purposeful Only:**
- Form submission: Loading spinner (simple rotate animation)
- Card appearance: Subtle fade-in on recommendation generation (300ms)
- Accordion expand/collapse: Smooth height transition (200ms)
- No scroll-triggered animations or decorative effects

---

## Images

**No hero images required** for this utility application.

**Supporting Images:**
- Crop icon placeholders in recommendation cards (can use emoji or simple SVG icons)
- Optional: Small weather condition icons from Heroicons
- Trust badge/certification graphic (optional, small)

---

## Page Structure

**Single-Page Application Flow:**

1. **Header** (sticky, h-16)
2. **Hero Banner** (compact, h-32 to h-40)
3. **Input Form Section** (py-16, max-w-2xl centered)
   - Section title
   - Form groups with clear labels
   - Weather data display (if location entered)
   - Submit button
4. **Recommendations Section** (py-16, conditional display)
   - Results header with query summary
   - 3-column grid of crop cards
   - Each card fully populated with data
5. **Market Prices Section** (py-16)
   - Table/card hybrid
   - Filter controls
6. **Footer** (py-12)

**Key UX Patterns:**
- Progressive form: Location → Soil/Climate → Submit
- Instant feedback on form validation
- Clear loading states during API calls
- Results appear below form (no page navigation)
- Persistent access to market data

---

## Accessibility

- All form inputs with associated labels (for/id pairing)
- ARIA labels for icon buttons
- Keyboard navigation throughout
- Focus indicators on all interactive elements
- Semantic HTML: `<main>`, `<section>`, `<article>` for cards
- Color-independent status indicators (use icons + text)