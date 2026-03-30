# PollenPal v2 -- QA Audit v4

**Auditor:** Nash (OpenClaw QA)
**Date:** 2026-03-29
**File:** `index.html` (1495 lines), `sw.js` (56 lines)
**Score: 7.5 / 10**

---

## Verdict

Solid v2 release. All three new features (Safety Alert, Favorites, Share Card) are implemented and fundamentally work. localStorage is properly wrapped in try/catch, escapeHtml is applied consistently to city names and API data, and prefers-reduced-motion is handled. The main gaps are: missing user feedback when favorites hit the 5-location cap (native `alert()` is used), no `aria-label` on saved-location items for keyboard users, the safety alert threshold spec says `< 5` but code fires at `< 3` (danger) and `< 5` (warning) which may be intentional but deviates from the stated spec, and the share card renders the city name in plain Canvas text without sanitization risk but also without any privacy opt-out. No blockers found.

---

## 1. localStorage try/catch

**PASS.** The `LS` utility object (lines 349-353) wraps every `getItem`, `setItem`, and `removeItem` call in try/catch, returning `null` or silently failing on error. All localStorage access goes through this helper -- no raw `localStorage` calls elsewhere.

---

## 2. WCAG AA Contrast

**PASS with notes.**

- Light mode: `--text: #1A3A2A` on `--bg: #F0FFF4` = contrast ratio ~13:1. Pass.
- Dark mode: `--text: #D6F5E0` on `--bg: #0A1A12` = contrast ratio ~12:1. Pass.
- Secondary text: `--text-secondary: #3A5A4A` on `#F0FFF4` (light) = ~6.5:1. Pass.
- Dark secondary: `#9ABFA8` on `#0A1A12` = ~7:1. Pass.
- **P3: Score sublabel** uses `--text-secondary` at `0.875rem` -- passes AA for normal text but is marginal for small text readability on some displays.
- Safety alert banners use white text on `#E53E3E` (red), `#C05621` (orange), `#38A169` (green). White on `#C05621` is ~4.6:1 -- passes AA normal text but fails AA large text threshold for the sub-text at `0.78rem`.

---

## 3. Focus Management

**PASS.**

- `closeSearch()` returns focus to `$('btn-change-city')` (line 1285).
- `closeSettings()` returns focus to `$('btn-settings')` (line 1419).
- Search modal focuses input on open (line 1278).
- Onboarding search input gets `searchEl.focus()` (line 1244).
- Focus trap implemented for onboarding and search modal (lines 1334-1349).

**P3:** Settings overlay creates a dynamic focus trap (line 1388) but does not save/restore the previously focused element if settings is opened from somewhere other than the btn-settings button.

---

## 4. prefers-reduced-motion

**PASS.** Lines 281-286 set `animation-duration: 0.01ms`, `transition-duration: 0.01ms`, `scroll-behavior: auto`, and disable hover transforms. Covers all animations including skeleton shimmer, fadeInUp, slideDown, and spin.

---

## 5. Keyboard Navigation

**PASS with notes.**

- `/` key opens search (line 1462), correctly guarded against firing when an input is focused.
- `Escape` closes search modal (line 1294) and settings overlay (line 1429).
- All interactive elements are `<button>` elements (inherently focusable and keyboard-activatable).
- Allergy options use `role="checkbox"` with `aria-checked`.
- Search results use `role="option"` inside a `role="listbox"`.
- `.btn-icon:focus-visible` and `.search-result:focus-visible` styles are defined.

**P2:** Saved location items (`.saved-loc-item`) are `<div>` elements with click handlers but no `tabindex="0"` or `role="button"`. They are not keyboard-accessible. Users cannot Tab to them or activate them with Enter/Space.

**P3:** No arrow-key navigation within the search results listbox. Screen reader users can Tab to each result (they are buttons, so this works), but `role="listbox"` semantically expects arrow-key navigation.

---

## 6. XSS -- escapeHtml on API Data

**PASS.** `escapeHtml()` (lines 341-345) handles `&`, `<`, `>`, `"`, `'`. It is applied to:

- City names in dashboard rendering (line 928, 933, 935, 944, 956, 966, 970, 994)
- City names in saved locations list (lines 425-428)
- City names in search results (lines 1226-1228, 1309-1311)
- Settings overlay location display (line 1383)
- Error messages (line 867)
- Onboarding location confirmation (line 1108)

**No unescaped API data insertion found via innerHTML.** The `city-name` element (line 1021) uses `.textContent` which is inherently safe.

City names in `data-name` attributes (line 425) are escaped. When read back via `getAttribute('data-name')` (line 439), the value is used to set `state.location.name` which later goes through `escapeHtml` or `.textContent` on render.

---

## 7. Favorite Locations -- Edge Cases

**Functional but has issues.**

- **Add:** `saveLocation()` checks for duplicates by lat/lon proximity (0.01 degree, ~1km) -- good. Checks `MAX_SAVED_LOCATIONS` (5) cap -- good.
- **Remove:** `removeLocation()` does bounds checking on index -- good. Re-renders list after removal -- good.
- **Load:** `getSavedLocations()` returns `[]` if nothing saved -- good. Falls through to empty state message.

**P2: Native alert() for cap reached** (line 1449). `alert('Maximum 5 locations. Remove one first.')` is a blocking native dialog. Should be an inline toast or banner. Bad UX and breaks screen reader flow.

**P3:** When a saved location is clicked, the `data-name` attribute value is read back (line 439). This value was escaped when written to the DOM attribute. The HTML entity-encoded string (e.g., `&amp;`) gets decoded by `getAttribute()`, so the actual name is correct. However, if a city name contains a double quote that was escaped to `&quot;`, the attribute itself could break -- but looking at line 425, the value is escaped with `escapeHtml` which converts `"` to `&quot;`, and since the attribute uses `"` delimiters, this is safe.

**P3:** No confirmation dialog on removing a saved location. One mis-tap deletes it.

---

## 8. Safety Alert -- Thresholds and Dismiss

**Deviation from spec.**

The spec says: "banner when score < 5 or > 8". The actual code (lines 462-480):
- `score < 3` -> danger (red)
- `score < 5` -> warning (orange)
- `score > 8` -> good (green)

This means the **danger tier at < 3 was not in the spec** -- the spec only says `< 5`. The code splits the `< 5` range into two tiers (danger + warning), which is arguably better UX but deviates from the written spec. Scores exactly equal to 5, 6, 7, or 8 show no alert, which matches the spec's intent ("normal" range).

**P3:** Scores of exactly 8.0 do NOT trigger the good alert (code uses `> 8`, strict). If the spec means `>= 8`, the threshold is off by one decimal point.

**Dismiss: PASS.** Each alert has an `.alert-close` button (line 226) with click handler (lines 483-486) that clears the container. The alert has `aria-label="Dismiss alert"`.

**P3:** Dismissed alerts reappear on data refresh (forceRefresh). No sessionStorage flag to suppress re-display.

---

## 9. Share Card -- Canvas + Fallback + Privacy

**PASS with notes.**

- **Canvas toBlob:** Used correctly (line 585). If `blob` is null, early return (line 586).
- **Web Share API:** Checks `navigator.share && navigator.canShare` with file support (line 589). Good progressive check.
- **Fallback:** Creates an `<a>` download link with `URL.createObjectURL`, clicks it, removes it, and revokes the URL after 1s timeout (lines 597-603). Works.
- **Privacy:** The share card contains the city name (line 533) and date. It does NOT contain lat/lon coordinates, user allergy selections, or any personal data beyond the city. **Acceptable**, though the city name itself is location data.

**P3:** No loading indicator while Canvas renders and toBlob runs. On slow devices this could take a moment with no feedback.

**P3:** The `.catch(function(){})` on `navigator.share` (line 594) silently swallows all errors including user cancellation. Not a bug, but swallows potential debugging info.

---

## 10. API Error Handling (Open-Meteo Offline)

**PASS.**

- `fetchJSON()` (lines 807-811) checks `r.ok` and throws on non-200 responses.
- `loadData()` (line 1044) has `.catch()` that calls `renderError()` with a user-friendly message.
- `renderError()` shows a retry button bound to `window._ppRefresh`.
- Search failures in the modal show "Search failed. Try again." (line 1327).
- Onboarding search failures silently catch (line 1241) -- no error message shown.

**P3:** Onboarding search (line 1241) `.catch(function(){})` gives zero feedback on network error. User types a city name, nothing happens, no error message.

**P3:** The pollen API cache key uses `lat.toFixed(2)+'_'+lon.toFixed(2)` but `forceRefresh()` (line 1053) also uses `toFixed(2)` which matches. However, the cache is stored as `pp_pollen_XX.XX_YY.YY` and the data includes a timestamp -- no issue with stale data beyond the 1-hour window.

---

## 11. Offline (Service Worker)

**PASS with notes.**

- **Static assets:** Cache-first strategy (lines 50-54). Caches `./`, `./index.html`, `./manifest.json`.
- **API requests:** Network-first with cache fallback (lines 33-47). Checks hostname for `open-meteo.com` and `nominatim.openstreetmap.org`.
- **Cache cleanup:** Deletes old caches on activate (lines 18-26). Uses `skipWaiting()` + `clients.claim()` for immediate activation.

**P2:** `geocoding-api.open-meteo.com` (the city search API, line 843) is NOT included in the SW's hostname check. The SW only checks for `open-meteo.com` and `nominatim.openstreetmap.org`. Since `geocoding-api.open-meteo.com` contains `open-meteo.com` as a substring, the `indexOf` check (line 33) DOES match it. So this actually works by coincidence, not by design. Fragile but functional.

**P3:** No versioned cache-busting for `index.html`. If the HTML file is updated, the SW will serve the stale cached version until a new SW is deployed with an incremented `CACHE_NAME`. This is standard SW behavior but worth noting.

---

## Bug Summary

### P1 -- Critical (0)

None found.

### P2 -- Major (3)

| # | Area | Issue |
|---|------|-------|
| 1 | Keyboard | Saved location items (`div.saved-loc-item`) are not keyboard-accessible: no `tabindex`, no `role`, no keydown handler. |
| 2 | UX | Native `alert()` used when favorites cap is reached (line 1449). Blocks UI, poor a11y. |
| 3 | Offline | SW hostname matching for geocoding API works by substring coincidence (`geocoding-api.open-meteo.com` contains `open-meteo.com`). Should be explicitly listed. |

### P3 -- Minor (8)

| # | Area | Issue |
|---|------|-------|
| 1 | Contrast | White on `#C05621` warning alert sub-text (0.78rem) is borderline for WCAG AA. |
| 2 | A11y | Search results `role="listbox"` lacks arrow-key navigation. |
| 3 | Safety Alert | Threshold `> 8` (strict) may exclude score of exactly 8.0 from "good" alert. Spec ambiguity. |
| 4 | Safety Alert | Dismissed alert reappears on refresh. No suppress flag. |
| 5 | UX | No confirmation on removing a saved location. |
| 6 | Share | No loading indicator during Canvas render / toBlob. |
| 7 | Error | Onboarding city search `.catch(function(){})` gives no user feedback on failure. |
| 8 | SW | No cache-busting mechanism for static assets beyond manual `CACHE_NAME` bump. |

---

## What's Done Well

- **escapeHtml is thorough.** Applied everywhere innerHTML touches API data. No XSS vectors found.
- **localStorage wrapper** is clean and defensive. All access funneled through `LS`.
- **prefers-reduced-motion** properly kills all animations and transitions.
- **Focus management** on modal open/close is correct with focus trapping.
- **Progressive enhancement** on Share API with download fallback.
- **Debounced search** (350ms) prevents API hammering.
- **Service Worker** network-first for API, cache-first for static -- correct strategy for a weather app.
- **Semantic HTML** with ARIA roles, live regions, and proper labeling throughout.

---

*Nash, OpenClaw QA -- audit complete.*
