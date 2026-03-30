# PollenPal — Product Specification
**Author:** Sanya (Product)
**Date:** 2026-03-29

## Formula
- **Persona:** Mom of allergic child, 30-40, every morning decides: walk or stay inside
- **One function:** Morning pollen forecast with specific advice
- **Enemy:** Allergy Plus (broken), ZYRTEC (conflict of interest)
- **Emotion:** Anxiety for child + fatigue from unpredictability
- **Result:** "Went for a walk without an episode. Because we knew when it was safe."

## Product Vision
A beautiful, character-driven allergy weather app that tells you EXACTLY what's in the air and what to do about it.

## Core Features

### 1. Current Pollen Dashboard
- Current pollen levels by type (birch, grass, ragweed, mugwort, alder, olive)
- Color-coded severity (green/yellow/orange/red/purple)
- Overall "Safety Score" 1-10
- Weather conditions that affect allergies (wind, humidity, rain)

### 2. Character Commentary
- Warm, empathetic personality (like MoodCast but for allergies)
- Context-aware advice: "Birch pollen is high today. If you must go outside, wear a mask and take your antihistamine 30 min before."
- Encouraging on good days: "Clear skies AND low pollen! Perfect day for the park."
- 40+ unique phrases covering all combinations

### 3. 3-Day Forecast
- Simple timeline: today, tomorrow, day after
- Each day shows: pollen level + weather + advice
- Highlights best day for outdoor activities

### 4. Location
- Auto-detect via Geolocation API
- Manual city search
- Save favorite location in localStorage

### 5. Pollen Types Explainer
- Tap any pollen type to learn: what it looks like, when it peaks, cross-reactivity
- Educational value builds trust

## Design Direction

### Palette
- Background: soft green (#F0FFF4) — "nature, safety, freshness"
- Danger accent: warm amber/red gradient for high pollen
- Safe accent: cool green/blue for low pollen
- Text: dark green (#1A3A2A)
- Cards: white with subtle green tint

### Mood
- Calm, reassuring, medical-trustworthy
- NOT clinical/scary — supportive and warm
- Icons: simple line art, leaf/flower motifs
- Font: Inter or system sans-serif

### Layout (mobile-first)
1. Location bar (sticky top)
2. Safety Score (big number, color-coded)
3. Character comment card
4. Pollen breakdown (6 types, bar chart)
5. 3-day forecast cards
6. Weather factors (wind, humidity, rain)

## Technical Spec

### API
- Open-Meteo Air Quality API: `https://air-quality-api.open-meteo.com/v1/air-quality`
- Parameters: `latitude, longitude, hourly=birch_pollen,grass_pollen,ragweed_pollen,mugwort_pollen,alder_pollen,olive_pollen`
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Weather: `https://api.open-meteo.com/v1/forecast` (for wind, humidity, rain)
- All FREE, no API key

### Tech Stack
- Single HTML file, zero dependencies
- IIFE, 'use strict'
- localStorage for settings + cache (with try/catch)
- escapeHtml() for all user input
- Geolocation API for auto-detect
- ARIA attributes, keyboard navigation
- Responsive (360px — 1440px)
- Dark/light theme (prefers-color-scheme)
- lang="en"

### Data Flow
1. Get user location (auto or manual)
2. Fetch pollen data from Open-Meteo
3. Fetch weather data from Open-Meteo
4. Calculate Safety Score (weighted average of all pollen types)
5. Select character comment based on score + conditions
6. Render dashboard
7. Cache response for 1 hour in localStorage

### Safety Score Algorithm
```
score = 10 - (weighted_pollen_average / max_possible * 10)
weights: {grass: 0.25, birch: 0.20, ragweed: 0.20, mugwort: 0.15, alder: 0.10, olive: 0.10}
```
- 8-10: Excellent (green)
- 6-7: Good (light green)
- 4-5: Moderate (yellow)
- 2-3: Poor (orange)
- 0-1: Severe (red)

## Onboarding
1. "What are you allergic to?" — multi-select: grass, tree (birch/alder), ragweed, mugwort, olive, "not sure"
2. "Where do you live?" — auto-detect or manual
3. "PollenPal will help you plan your days around pollen." → Start

## Success Criteria
- [ ] All 6 pollen types displayed with real data
- [ ] Safety Score calculated correctly
- [ ] 40+ character phrases
- [ ] 3-day forecast working
- [ ] Location auto-detect + manual search
- [ ] Onboarding flow
- [ ] Dark/light theme
- [ ] Mobile responsive
- [ ] Accessible (ARIA, keyboard)
- [ ] Score: 9.0+/10 from House
