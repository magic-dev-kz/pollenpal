# Changelog

## v12.0 (2026-03-29) — Quick-switch, Filters & Summary

**Location Quick-Switch**
- When 2+ locations are saved, horizontal swipe-like tab bar appears below the location bar
- Tapping a tab instantly switches to that location and reloads data
- Active location tab highlighted with accent border and background
- Scrollable with snap behavior for many locations

**Pollen Type Filter**
- Toggle chips in the pollen breakdown card to show/hide individual pollen types
- Useful for hiding irrelevant pollen types (e.g., olive pollen for non-Mediterranean users)
- Hidden types persist across sessions via localStorage
- Visual feedback: dimmed + strikethrough for hidden types

**Daily Summary Notification Text**
- Concise one-line summary inserted after the character comment: "Today: Safe to go out. Grass pollen low."
- Color-coded circle icon (green/yellow/red) matching safety score
- Combines safety recommendation with dominant pollen level

### Technical
- Service worker cache bumped to `pollenpal-v12.0`
- Version label updated to v12

---

## v11.0 (2026-03-29) — Micro-polish
- Onboarding allergy option buttons larger (18px padding, min-height 56px) for easier mobile tapping
- Score ring glow intensity now scales with score value via `--ring-glow-intensity`
- Service worker cache bumped to `pollenpal-v11.0`

---

## v10.0 (2026-03-29) — Visual Polish
- Score number font larger (3.8rem to 4.5rem) for readability
- Forecast card active (today) glow stronger for better visibility
- Version label updated to v10
- Service worker cache bumped to `pollenpal-v10.0`

---

## v9.0 (2026-03-29) — Share on X & Allergy Type Icons

### Share on X
- "Share on X" button on the results screen.
- Pre-filled tweet: "Safety score today: X/10. Free pollen forecast: [URL]".

### Allergy Type Icons
- Emoji icons already displayed next to each pollen type name (confirmed existing).

### Technical
- Service worker cache bumped to `pollenpal-v9.0`.
- Version label updated to v9.

---

## v8.0 (2026-03-29) — Activity Planner, Trend Chart & Season Alert

**Outdoor Activity Planner**
- "Best time to go outside today" card finds the hour with the lowest pollen from hourly data
- Displays optimal time with score, status icon, and whether the hour has passed
- Color-coded icon based on conditions: star (excellent), sun (acceptable), cloud (elevated)

**Weekly Pollen Trend**
- SVG line chart showing pollen safety scores across 7 days
- Gradient fill under the line with color-coded dots per day
- Score labels above each data point for quick reference
- Day labels (Today, Tmrw, Mon, Tue, etc.) below the chart

**Allergy Season Alert**
- Detects when average daily safety score is below 5 for 3+ consecutive days
- Shows a prominent banner: "Allergy Season Detected!" with practical advice
- Recommendations include preventive antihistamines, keeping windows closed, post-outdoor showers
- Automatically hidden when conditions improve

### Technical
- Service worker cache bumped to `pollenpal-v8.0`
- Version label updated to v8

---

## v7.0 (2026-03-30) — PWA Install, Auto-Refresh & Timestamp

**PWA Install Prompt**
- Shows an install banner after 2+ visits to the app
- Uses the `beforeinstallprompt` event for native install flow
- Dismissible with close button; dismiss state persisted in localStorage
- Does not show if app is already installed (standalone mode detected)

**Auto-Refresh**
- Pollen and weather data automatically refresh every 30 minutes while the app is open
- On tab return after 30+ minutes of being hidden, data refreshes immediately
- Clears API cache before refresh to ensure fresh data

**Last Updated Timestamp**
- "Updated just now" / "Updated X min ago" / "Updated X hours ago" displayed under the safety score
- Updates every 30 seconds without re-fetching data
- Timestamp resets on each data load

### Technical
- Service worker cache bumped to `pollenpal-v7.0`
- Version label updated to v7

---

## v6.0 (2026-03-29) — Micro-interactions & Polish
- **Score countUp**: Safety score animates from 0 to target value over 1 second with eased cubic interpolation on each data load
- **Forecast card stagger**: 3 forecast cards appear with staggered delay (100ms/200ms/300ms) using opacity+transform transition
- **Focus-visible**: All interactive elements (buttons, links, inputs, sliders, toggles) have explicit `:focus-visible` outline styles for keyboard navigation
- **Medication taken toast**: Clicking "Took my meds" shows a green toast "Logged! Stay safe 🌿" for 2.5 seconds with slide-up animation
- Service worker cache version bumped to v6.0
- Version label updated to v6
- All new animations respect `prefers-reduced-motion: reduce`

## v5.0 (2026-03-29) — Medication Log & Activity Insights
- **Medication Log**: "Took my meds" button with timestamp logging. Weekly view (Mon-Sun) showing taken/missed status with green checkmarks and red crosses. All data persisted in localStorage
- **Activity Recommendation**: After 3-day forecast, displays actionable guidance based on safety score — "Good for outdoor activities" (score 7+), "Limit outdoor time" (score 4-6), or "Stay inside" (score <4). Color-coded with icons
- **Share Week Summary**: Button to copy full 7-day forecast as formatted text to clipboard. Uses Web Share API with clipboard fallback and visual toast confirmation
- Service worker cache version bumped to v5.0
- manifest.json version updated to 5.0
- Version label updated to v5

## v4.0 (2026-03-29) — Smart Features Update
- **Share Safety Score**: Canvas-generated 600x400 card with score ring, city, date, pollen bars, and "Safe to go out"/"Stay inside" recommendation. Web Share API with PNG download fallback
- **Medication Reminder**: Toggle to enable morning allergy medicine reminders. In-app banner appears before noon with daily dismiss tracking via localStorage
- **Pollen Calendar (7-day)**: Color-coded weekly view with daily safety scores. Green (safe) to red (dangerous) visual coding for week planning. API upgraded to 7-day forecast
- **Custom Alert Threshold**: Slider (1-10) to set personal alert threshold. Prominent alert when score drops below threshold. Persisted in localStorage. Integrates with safety alert banner
- Service worker cache version bumped to v4.0
- Version label updated to v4

## v3.0 (2026-03-29) — Premium Visual Redesign
- Multi-layered radial-gradient overlays on body background (light + dark themes)
- Spring-curve entrance animations (cardIn) for cards, forecast cards, weather items, saved locations, allergy options
- New CSS custom properties: --shadow-lg, --shadow-card, --shadow-glow for dual-layer shadow system
- Enhanced glassmorphism: saturate(180%) blur(20px) on header, cards, modals, weather items
- Primary buttons: gradient background with animated background-position, glow box-shadow on hover, active scale(0.95)
- All interactive buttons: hover lift (translateY + scale), active scale(0.95)
- Typography: font-weight 800-900 for headings, letter-spacing -0.02em tighter tracking
- Onboarding: animated glow background with radial overlays, staggered entrance for allergy options
- Forecast cards: staggered spring entrance, gradient text on scores
- Score ring: gradient stroke support via CSS (url(#scoreGradient))
- Form inputs: focus glow ring (0 0 0 4px rgba(accent, 0.1)) on search and onboarding inputs
- Weather items: spring entrance with staggered delays, enhanced hover shadows
- Modal: spring transition curve, glow shadow
- Saved locations: spring entrance with staggered delays
- Reduced-motion media query updated to cover all new animations
- manifest.json version updated to 3.0

## v1.0 (2026-03-29)
- Initial release
- Ship-ready (9.0/10)
- PWA (service worker + manifest)
- WCAG AA accessible
- Works offline
