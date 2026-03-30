# PollenPal Re-Audit v2 -- Nash QA

**Auditor:** Nash (QA, OpenClaw)
**Date:** 2026-03-29
**Previous score:** 7.4/10
**File:** `/Volumes/OpenClaw/sandbox/projects/pollenpal/index.html`

---

## Checklist Results

### 1. localStorage/sessionStorage -- try/catch
**PASS.** `LS` wrapper object (lines 294-298) wraps `getItem`, `setItem`, `removeItem` in try/catch. All localStorage access goes through `LS.get()` / `LS.set()` / `LS.remove()`. No raw `localStorage` calls found elsewhere.

### 2. WCAG AA Contrast
**PASS with minor notes.**
- `--text: #1A3A2A` on `--bg: #F0FFF4` -- dark green on very light green. Ratio ~12:1. PASS.
- `--text-secondary: #3A5A4A` on `--bg: #F0FFF4` -- ratio ~7:1. PASS.
- Dark mode: `--text: #D6F5E0` on `--bg: #0A1A12` -- light green on near-black. Ratio ~12:1. PASS.
- Dark mode: `--text-secondary: #9ABFA8` on `--bg: #0A1A12` -- ratio ~6.5:1. PASS.
- Card text: `--text` on `--bg-card: #FFFFFF` -- excellent. PASS.
- Card text dark: `--text: #D6F5E0` on `--bg-card: #122A1C` -- ratio ~9:1. PASS.
- Score label colors are dynamic (`level.color`), used on white/light backgrounds. `#38A169` on white = 3.5:1 -- **BORDERLINE for large text** (18pt+ bold = AA pass for large text). The score number is 3.5rem/56px bold = qualifies as large text. PASS for large text AA.
- `#ECC94B` (yellow, "Moderate") on white = ~1.9:1 -- **FAIL AA even for large text**. On `--bg: #F0FFF4` still ~1.8:1.
- `#ED8936` (orange, "Poor") on white = ~2.9:1 -- **FAIL AA for normal text**, borderline large text.

**BUG P2-CONTRAST-1:** Yellow "Moderate" score color `#ECC94B` fails WCAG AA on both light background (#F0FFF4) and white card backgrounds. Ratio ~1.8-1.9:1 -- needs to be darkened to at least `#B7791F` or similar.

**BUG P3-CONTRAST-2:** Orange "Poor" score color `#ED8936` on light backgrounds = ~2.9:1. Fails AA for normal text; borderline for large text (needs 3:1).

### 3. Focus Trap in Modals/Overlay
**PASS.** `trapFocus()` function (lines 1016-1029) is applied to:
- `#onboarding` (line 1030)
- `#search-modal` (line 1031)
- Settings overlay (line 1070, applied dynamically after creation)

Implementation correctly handles Tab and Shift+Tab wrapping. Queries for `button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"]),a[href],select,textarea`.

**Minor note:** When settings overlay is closed by clicking backdrop (line 1106), focus is not returned to the settings button. Same for search modal close. Not a blocker but a best-practice gap.

**BUG P3-FOCUS-1:** After closing search modal (Escape or backdrop click) or settings overlay, focus is not returned to the trigger button (`#btn-change-city` or `#btn-settings`). Screen reader users lose their place.

### 4. prefers-reduced-motion
**PASS.** Lines 230-235: `@media(prefers-reduced-motion:reduce)` disables all animations and transitions (duration set to 0.01ms), disables hover transforms on forecast cards and primary buttons. Covers `scroll-behavior: auto` too.

### 5. Keyboard Navigation
**PASS with notes.**
- `/` key opens search (line 1119), with guard against INPUT focus.
- Escape closes search modal (line 977).
- Allergy options are `<button>` elements -- keyboard accessible.
- Search results are `<button>` elements with `role="option"` -- keyboard accessible.
- All header buttons have `aria-label` and are native `<button>` elements.

**BUG P3-KBD-1:** Escape key handler (line 977) always calls `closeSearch()` even when search modal is not open. Should check `modal.classList.contains('active')` first. Currently harmless (no-op) but sloppy.

**BUG P3-KBD-2:** Settings overlay has no Escape key handler. Must press Tab to "Save & Close" or click backdrop. Add `keydown` listener for Escape on settings overlay.

### 6. Offline Support
**PASS.** Service Worker (`sw.js`) implements:
- Cache-first for static assets (line 49-54)
- Network-first with cache fallback for API calls to open-meteo.com and nominatim.openstreetmap.org (lines 33-47)
- Old cache cleanup on activate (lines 17-27)
- `skipWaiting()` + `clients.claim()` for immediate activation

**Note:** `manifest.json` is present, linked in HTML (line 237). Has name, short_name, display:standalone, theme_color, icons (SVG data URI). Minimal but valid PWA manifest.

**BUG P3-PWA-1:** Manifest `start_url` is `./index.html` but `scope` is not specified. Browser will infer scope from manifest location, which should be fine for same-directory, but explicit scope is best practice.

**BUG P3-PWA-2:** Only one icon (SVG). Chrome requires at least a 192x192 and 512x512 PNG icon for "Add to Home Screen" prompt. The SVG `sizes="any"` may work in some browsers but not all. Install prompt will not appear on many Android devices.

### 7. Mobile Viewport
**PASS.** `<meta name="viewport" content="width=device-width, initial-scale=1.0">` (line 5). App max-width is 480px with auto margins. Responsive breakpoints at 380px and 768px. No horizontal overflow issues visible.

### 8. escapeHtml -- Quotes Escaped?
**PASS.** Lines 286-289:
```js
function escapeHtml(s){
  if(typeof s!=='string') return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
```
Both `"` and `'` are now escaped. This was a P1 bug in the previous audit -- **FIXED**.

All user-facing string insertions into HTML use `escapeHtml()` -- city names, country names, allergy labels, weather values, phrase text. Verified at lines 626-627, 634, 643, 654-656, 665-669, 691-693, 775, 791, 909-911, 991-993, 1059-1061, 1065.

### 9. Reverse Geocoding -- Nominatim Usage
**PASS.** Line 870:
```js
fetchJSON('https://nominatim.openstreetmap.org/reverse?lat='+lat+'&lon='+lon+'&format=json')
```
Correctly passes `lat` and `lon` as separate numeric parameters (from `pos.coords.latitude`/`longitude`). Does NOT pass coordinates as city name. Previous bug of passing coords as city name is **FIXED**.

Fallback on Nominatim failure: uses `lat.toFixed(2)+', '+lon.toFixed(2)` as display name (line 881). Correct.

---

## Additional Checks

### 10. Null Guards on Weather Values
**PASS.** Lines 576-582: All weather values are accessed with `weatherData.current?` ternary guards, defaulting to `null`. Lines 678-687: Display uses `!=null` checks, defaulting to `'--'`. Example:
```js
weather.wind!=null ? weather.wind.toFixed(0)+' km/h' : '--'
```
All four weather items (wind, humidity, rain, temp) have this pattern. Safe.

### 11. Settings Screen -- Allergy Changes
**PASS.** Settings overlay (lines 1034-1107):
- Loads current `state.allergies` as initial selection
- Toggle logic matches onboarding (not_sure deselects others, selecting specific deselects not_sure)
- Save button writes to `state.allergies` and `LS.set('allergies', ...)`
- After save, calls `loadData()` which re-renders dashboard with new allergies
- If no allergies selected, defaults to `['not_sure']` (line 1100)
- "Change" location link opens search modal (line 1097)

### 12. Edge Cases

**All pollen = 0:**
- `calcScore()` returns `10.0` (max). `getScoreLevel()` returns "Excellent". All bars show min-width 2%. No divide-by-zero. **PASS.**

**All pollen = max:**
- Each `norm` = 100, `weightedSum` = 100, score = `10 - (100/10)` = 0. `getScoreLevel()` returns "Severe". Bars at 100%. **PASS.**

**Empty API response (no hourly data):**
- `getPollenForHour()` line 444: `(data.hourly[t.key]&&data.hourly[t.key][hourIndex])||0` -- if `data.hourly` is undefined, this throws. **BUG.**

**BUG P2-NULL-1:** If pollen API returns a response without `hourly` property (e.g., `{}`), `getPollenForHour()` at line 444 will throw `TypeError: Cannot read properties of undefined`. Same for `getDayAverage()` line 460. No guard on `data.hourly` existence.

**Repro:** API returns `{"latitude":52.5,"longitude":13.4}` (no hourly key) -- crash.

**Empty search results:**
- Handled at lines 903-905 and 986-988 with "No cities found" message. **PASS.**

**Geolocation denied:**
- Handled at lines 884-886 with error message. **PASS.**

**Geolocation not supported:**
- Handled at line 889. **PASS.**

### 13. Dead Code / Misc

**BUG P3-DEAD-1:** `forceRefresh()` (lines 734-741) constructs cache keys with `lat.toFixed(2)` and `lon.toFixed(2)`, but `fetchPollenData()` and `fetchWeatherData()` also use `.toFixed(2)` for their cache keys. This is consistent. However, `forceRefresh()` only clears localStorage cache -- the Service Worker cache for the API URLs (with full precision coordinates in the URL) is NOT cleared. So after "force refresh", the SW may still serve cached API responses from its own cache. **The refresh button may not actually refresh data from the network.**

**Repro:**
1. Load data (SW caches API response)
2. Wait < 1 hour (LS cache still valid)
3. Click refresh -- LS cache cleared, new fetch made
4. SW intercepts fetch, serves its own cached response (network-first, but if network fails, stale SW cache is used)

This is actually acceptable behavior for network-first strategy -- SW only uses cache on network failure. **Downgraded to P4 (informational).**

### 14. Security

- No user-generated content persisted to backend (client-only app). XSS surface is city/country names from API -- all escaped. **PASS.**
- `onclick="window._ppRefresh()"` in error card (line 566) -- inline handler, but calling a safe function. Low risk. Could use addEventListener instead. **P4 informational.**

---

## Summary of Bugs Found

| ID | Severity | Description |
|----|----------|-------------|
| P2-CONTRAST-1 | P2 Major | Yellow "Moderate" score color #ECC94B fails WCAG AA (~1.8:1 on light bg) |
| P2-NULL-1 | P2 Major | No guard on `data.hourly` existence -- crash if API returns empty response |
| P3-CONTRAST-2 | P3 Minor | Orange "Poor" score color #ED8936 borderline fails AA (~2.9:1) |
| P3-FOCUS-1 | P3 Minor | Focus not returned to trigger button after closing modal/overlay |
| P3-KBD-1 | P3 Minor | Escape handler fires even when search modal is not open |
| P3-KBD-2 | P3 Minor | Settings overlay has no Escape key handler |
| P3-PWA-1 | P3 Minor | Manifest missing explicit `scope` |
| P3-PWA-2 | P3 Minor | Only SVG icon -- no PNG 192x192/512x512 for Android install prompt |

**Previously reported bugs now FIXED:**
- escapeHtml now escapes `"` and `'` -- FIXED
- Reverse geocoding now uses Nominatim correctly -- FIXED
- Dead `force` parameter removed -- FIXED
- prefers-reduced-motion added -- FIXED

---

## Score: 8.2 / 10

**Breakdown:**
- Functionality: 9/10 (solid, one crash edge case with empty API)
- Accessibility: 7.5/10 (focus return missing, 2 contrast fails, no Escape on settings)
- Security: 9.5/10 (escapeHtml fixed, all user strings escaped)
- PWA: 7.5/10 (works but missing PNG icons, no explicit scope)
- Code quality: 8.5/10 (clean, consistent, minor dead-path issues)
- Offline: 9/10 (network-first with cache fallback, proper SW lifecycle)

**Delta from v1:** +0.8 points. Major improvements in escapeHtml security, reverse geocoding, prefers-reduced-motion. Remaining issues are mostly P3 polish items plus one P2 crash edge case and one P2 contrast fail.

**Recommendation:** Fix P2-CONTRAST-1 (darken yellow) and P2-NULL-1 (guard `data.hourly`) to reach 9.0+.
