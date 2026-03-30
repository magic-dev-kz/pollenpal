# PollenPal — Design Spec
**Author:** Sky (Creative)
**Date:** 2026-03-29

## Visual Identity

### Color System
| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| --bg | #F0FFF4 | #0A1A12 | Background — soft green = nature, safety |
| --bg-card | #FFFFFF | #122A1C | Card surfaces |
| --text | #1A3A2A | #D6F5E0 | Primary text — dark green |
| --accent | #38A169 | #68D391 | Buttons, links, safe indicators |
| --danger-low | #F6E05E | same | Level 4-5 (moderate) |
| --danger-mid | #ED8936 | same | Level 2-3 (poor) |
| --danger-high | #E53E3E | same | Level 0-1 (severe) |
| --safe | #48BB78 | #50C878 | Level 8-10 (excellent) |

### Safety Score Color Mapping
| Score | Color | Label | Emoji |
|-------|-------|-------|-------|
| 8-10 | Green #48BB78 | Excellent | 🌿 |
| 6-7 | Light green #68D391 | Good | 😊 |
| 4-5 | Yellow #F6E05E | Moderate | 😐 |
| 2-3 | Orange #ED8936 | Poor | 😷 |
| 0-1 | Red #E53E3E | Severe | 🚨 |

### Typography
- Font: System sans-serif (Inter as web font when available)
- Score: 48px, bold, color-coded
- Commentary: 16px, italic-ish (normal weight, warm tone)
- Labels: 14px, secondary color
- Pollen values: 13px mono, right-aligned

### Layout
```
┌──────────────────────┐
│ 📍 City Name    🔍 🌙│ ← sticky location bar
├──────────────────────┤
│                      │
│    ┌──────────┐      │
│    │   8.2    │      │ ← Safety Score in SVG circle
│    │ Excellent│      │
│    └──────────┘      │
│                      │
│ ┌──────────────────┐ │
│ │ 💬 "Beautiful day│ │ ← Character comment card
│ │ AND clean air!..." │
│ └──────────────────┘ │
│                      │
│ 🌿 Birch    ████░ 42│ │
│ 🌾 Grass    ██░░░ 18│ │ ← Pollen breakdown bars
│ 🌼 Ragweed  █░░░░  5│ │
│ 🌻 Mugwort  ░░░░░  2│ │
│ 🌳 Alder    ███░░ 30│ │
│ 🫒 Olive    ░░░░░  0│ │
│                      │
│ ┌─────┐┌─────┐┌─────┐│
│ │Today││Tmrw ││Wed  ││ ← 3-day forecast
│ │ 8.2 ││ 6.5 ││ 9.0 ││
│ └─────┘└─────┘└─────┘│
│                      │
│ 💨 Wind: 12 km/h     │
│ 💧 Humidity: 68%     │ ← Weather factors
│ 🌧️ Rain: No          │
└──────────────────────┘
```

### Emotional Tone
- Warm, supportive, medical-trustworthy
- NOT clinical/scary — like a caring friend
- Commentary uses "you" language: "Your family will be fine today"
- Celebrates good days: "Perfect park weather!"
- Gentle on bad days: "Indoor play day. Here are some ideas..."

### Micro-interactions
- Score ring: animated stroke-dashoffset on load (0 → actual)
- Pollen bars: width animation from 0 → actual
- Forecast cards: staggered fade-in
- Comment card: subtle typewriter or fade-in
- Pull-to-refresh: rotate icon
- Theme toggle: smooth CSS transition

### Onboarding Screens
1. **Allergies** — grid of 6 pollen types with emoji, tap to select (multi)
2. **Location** — auto-detect button + manual search input
3. **Ready** — summary + "Let's Go!" CTA

Each screen: centered, max-width 400px, fade transitions between steps.
