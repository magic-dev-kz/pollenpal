# Changelog

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
