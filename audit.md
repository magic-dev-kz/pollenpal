# PollenPal -- Deep Audit by House

**Date:** 2026-03-29
**Auditor:** House (analyst-tester, OpenClaw)
**File:** `/Volumes/OpenClaw/sandbox/projects/pollenpal/index.html`
**Lines:** 995

---

## SCORE: 7.4/10

---

### Kritical Bugs

**1. `force` parameter in `loadData()` does nothing (line 702-704)**

```js
Promise.all([
  force ? fetchPollenData(lat, lon) : fetchPollenData(lat, lon),
  force ? fetchWeatherData(lat, lon) : fetchWeatherData(lat, lon)
])
```

Both branches of the ternary are **identical**. The `force` flag is ignored. Cache is cleared in `forceRefresh()` via `LS.remove()` before calling `loadData(true)`, so the refresh *works by accident* -- but only because the cache keys in `forceRefresh()` use `toFixed(2)` and `fetchPollenData` also uses `toFixed(2)`. This is fragile and the `force` param is dead code / misleading. If someone refactors `forceRefresh` without understanding this implicit coupling, cache-busting breaks silently.

**2. Geolocation reverse geocode is broken (line 830-833)**

```js
searchCity(pos.coords.latitude.toFixed(2)+','+pos.coords.longitude.toFixed(2))
```

This passes coordinates as the `name` parameter to the Open-Meteo Geocoding API. The API searches by **city name**, not coordinates. This request will almost certainly return no results. Then the fallback sets `name: 'Current Location'` which is useless -- the user permanently sees "Current Location" as their city name with no way to know what city was detected.

Immediately after, line 833 tries a second reverse-geocode with `name=` (empty string), which will also fail.

**Fix:** Use Open-Meteo's reverse geocoding or a dedicated reverse geocoding endpoint (e.g., Nominatim) to convert lat/lon to a city name.

**3. No `forecast_days` alignment with weather API (line 519-520)**

The weather API call does not include `&forecast_days=3`, so daily min/max temperature data may only return 1 day (API default is 7, so this works by luck, but should be explicit for consistency).

---

### Serious Bugs

**4. Cache key mismatch potential in `forceRefresh()` (line 720-724)**

`forceRefresh()` builds cache keys as:
```js
var lat = state.location.lat.toFixed(2);
var lon = state.location.lon.toFixed(2);
LS.remove('pollen_' + lat + '_' + lon);
```

But `LS.remove` prepends `pp_` internally. And `fetchPollenData` builds the key as `'pollen_' + lat.toFixed(2) + '_' + lon.toFixed(2)` on **numbers**. If `state.location.lat` is already a string (e.g., from localStorage deserialization), `.toFixed(2)` may throw or produce different results. No type coercion is done.

**5. Onboarding search results are not sanitized via DOM (lines 861-864)**

While `escapeHtml()` is used on `c.name` and `c.country` within the template literal, the result is injected into `data-name` and `data-country` HTML attributes via string concatenation:

```js
'data-name="'+escapeHtml(c.name)+'" data-country="'+escapeHtml(c.country||'')+'"'
```

`escapeHtml()` escapes `<>&` but does **not** escape double quotes. If a city name contains `"`, this breaks out of the attribute and creates an XSS vector. For example, a city named `foo" onmouseover="alert(1)` would inject an event handler.

**Fix:** Either also escape `"` in `escapeHtml()`, or use `setAttribute()` instead of string building.

**6. Same XSS issue in main search modal (lines 943-945)**

Identical vulnerability in `initSearch()` where `data-name` and `data-country` attributes are built from API data.

**7. Weather data null checks are incomplete (lines 561-568)**

If `weatherData.current` is present but `temperature_2m` is `undefined` (API hiccup), `weather.temp` will be `undefined`, not `null`. Then `weather.temp !== null` evaluates to `true`, and `undefined.toFixed(0)` on line 672 throws a runtime error, crashing the entire render.

**8. No debounce cancellation on search modal close**

When the user closes the search modal, the pending debounce timer is not cleared. If the API response arrives after closing, it writes results into the hidden modal's DOM. Not a crash, but wastes bandwidth and can cause flicker on next open.

---

### Minor Bugs

**9. "Day After" is not a standard label (line 577)**

`dayNames = ['Today', 'Tomorrow', 'Day After']` -- "Day After" is unusual. Most weather apps say the actual day name (e.g., "Wednesday"). This also fails to convey which day if the user checks at midnight.

**10. Score decimal display glitch for score = 10.0 (line 610)**

```js
Math.floor(score) + '<span class="decimal">.' + Math.round((score % 1) * 10) + '</span>'
```

When score = 10.0 (all pollen = 0), displays "10.0" which is correct. But when score rounds to something like 9.95, `Math.round(0.95 * 10) = 10`, showing "9.10" instead of "10.0". Edge case but mathematically possible.

**11. Print stylesheet is minimal (line 227)**

Only makes location bar static and hides overlays. The green-on-white color scheme prints fine, but the SVG score ring with colored strokes may not render well on monochrome printers.

**12. `allergy-grid` re-renders on every click (line 811)**

Every click on an allergy button calls `renderStep()` which rebuilds the entire step DOM. This causes focus loss -- the user clicks a button, focus resets to body. Keyboard users cannot tab through options.

**13. No `aria-live` on content-area**

`content-area` (line 258) updates dynamically but has no `aria-live` attribute. Screen readers won't announce when the dashboard loads or when errors appear. (`city-display` has `aria-live`, but the main content does not.)

**14. Onboarding overlay `role="dialog"` but no focus trap**

The onboarding overlay (line 233) has `role="dialog"` and `aria-modal="true"`, but there is no focus trap implementation. Users can Tab out of the dialog into the hidden content behind it.

**15. Search modal also lacks focus trap (line 262)**

Same issue -- `aria-modal="true"` but no focus trap.

---

### UX Observations

**16. No "Skip" button on onboarding step 1**

If a user doesn't know their allergies and doesn't want to select "Not Sure", there's no way to skip. The "Continue" button auto-selects "not_sure" if nothing is chosen (line 815), which is good fallback logic, but the UX doesn't communicate this.

**17. No loading indicator on city search**

When typing in either the onboarding or modal search, there's no spinner or "Searching..." text. On slow connections, the user sees nothing for 350ms+ debounce + API latency.

**18. 350ms debounce is reasonable** -- good choice.

**19. No way to change allergies after onboarding**

Once onboarding is complete, there is no settings screen to modify allergy preferences. The only way is to clear localStorage manually.

**20. Forecast cards have `tabindex="0"` but no interaction**

Forecast cards (line 650) are focusable but clicking/pressing Enter does nothing. This is confusing for keyboard users who expect interactive elements when they can focus them.

**21. No offline support / service worker**

For a "check in the morning" app, having a PWA with offline caching would significantly improve UX. The cached data in localStorage is good, but the app shell itself requires network.

**22. `</output>` typo in HTML (line 250)**

```html
<button class="btn-icon theme-toggle" id="btn-theme" aria-label="Toggle dark mode" title="Toggle dark mode"></output>
```

Closing tag is `</output>` instead of `</button>`. Browsers auto-correct this, but it is invalid HTML.

---

### What is Excellent

1. **escapeHtml() exists and is used consistently** on user-visible text. The DOM-based implementation (`createTextNode` + `innerHTML`) is safe and correct (aside from the attribute issue noted above).

2. **localStorage wrapped in try/catch** via the `LS` utility object. Handles private browsing and quota errors gracefully.

3. **IIFE + 'use strict'** -- proper encapsulation, no global pollution except the intentional `window._ppRefresh`.

4. **Green palette is excellent for the domain.** The color progression from green (safe) through yellow/orange to red (severe) is intuitive and follows universal UX conventions for health/safety apps. The color blind-friendly aspect could be improved (red/green), but labels + emoji compensate.

5. **40+ unique phrases** across 5 severity levels with weather-aware variants (rainy, windy). The phrases are genuinely useful, actionable, and family-focused. This is the best feature of the product.

6. **Weighted score algorithm is sound.** 6 pollen types with sensible weights (grass 0.25 highest, alder/olive 0.10 lowest). Weights sum to 1.0. Score correctly inverts (high pollen = low score). Edge cases: all 0 = 10.0, all max = 0.0. Both work correctly.

7. **Skeleton loading states** are well-implemented and match the dashboard layout.

8. **Dark mode** with smooth transitions and proper `theme-color` meta tag update.

9. **ARIA attributes** are present on most interactive elements: `role="dialog"`, `aria-label`, `aria-live`, `role="meter"` with valuemin/valuemax/valuenow on pollen bars, `aria-hidden` on decorative elements.

10. **Responsive design** handles 360px-1440px well. The 380px breakpoint adjusts grid and score ring size.

11. **Deterministic phrase selection** (`day % pool.length`) means the same phrase shows all day -- no jarring changes on refresh. Clever.

12. **API caching with 1-hour TTL** -- appropriate for pollen data that doesn't change by the minute.

13. **Personal warnings** based on selected allergies -- genuinely useful personalization.

---

### Recommendations

**Priority 1 (Must Fix):**
- Fix the `escapeHtml()` to also escape `"` and `'` for attribute contexts, or switch to `setAttribute()` for data attributes (XSS risk)
- Fix the broken reverse geocoding for geolocation detection
- Fix `</output>` typo to `</button>`
- Add null/undefined guard for weather values before calling `.toFixed()`

**Priority 2 (Should Fix):**
- Remove dead `force` ternary in `loadData()` -- just call the functions directly
- Add focus trap to onboarding and search modal dialogs
- Add `aria-live="polite"` to `#content-area`
- Add a settings/preferences screen accessible from the header to modify allergies
- Cancel debounce timers when modals close

**Priority 3 (Nice to Have):**
- Replace "Day After" with actual weekday name
- Add PWA manifest + service worker for offline support
- Add loading indicator to search inputs
- Remove `tabindex="0"` from non-interactive forecast cards or make them expandable
- Add `lang` attribute matching for i18n readiness
- Consider `prefers-reduced-motion` media query for animations
- Add `prefers-color-scheme: dark` media query as default theme fallback

---

**Bottom Line:** Solid single-file product with good domain knowledge (pollen weights, weather-aware phrases, family-focused advice). The architecture is clean and the UX is thoughtful. The two real problems are the XSS via unescaped quotes in HTML attributes and the completely broken geolocation reverse geocode. Fix those and this is an 8.5.
