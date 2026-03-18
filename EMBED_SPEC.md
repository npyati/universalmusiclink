# Universal Music Link — Featured Widget: Integration Spec

This document is a complete spec for integrating the Universal Music Link (UML) featured widget into an external personal website. It covers the API shape, embed usage, styling contract, and expected behavior.

---

## What This Is

Universal Music Link is a static site (GitHub Pages) that hosts dedicated landing pages for music tracks. Each page shows album art, track info, and a multi-service split-button dropdown (Spotify, Apple Music, YouTube Music, Tidal, Amazon Music) that remembers the user's preferred service via `localStorage`.

The "featured" API + embed system lets any external page display the currently-featured track with the full interactive dropdown widget. The featured track rotates automatically based on a date schedule defined in `featured.json`.

---

## The API

**Endpoint:**
```
GET https://npyati.github.io/universalmusiclink/featured.json
```

**Response shape:**
```json
{
  "schedule": [
    {
      "date": "2026-03-16",
      "artist": "Gorillaz",
      "title": "The Mountain",
      "image": "https://i.scdn.co/image/ab67616d0000b273eeb01b41f48210d032d1b6a4",
      "url": "https://npyati.github.io/universalmusiclink/gorillaz-the-mountain/",
      "services": {
        "spotify": "https://open.spotify.com/track/3MebYJnEDK4XdnCj3VMLjL",
        "apple_music": "https://music.apple.com/us/album/the-mountain/1837237742?i=1837237747",
        "youtube_music": "https://music.youtube.com/search?q=Gorillaz+The+Mountain",
        "tidal": "https://tidal.com/album/500753046",
        "amazon_music": "https://music.amazon.com/albums/B0FPJLJYN2"
      }
    }
  ]
}
```

### Schedule array

`schedule` is an array of track entries sorted in any order (the embed script sorts them). Each entry:

| Field | Type | Description |
|---|---|---|
| `date` | string (YYYY-MM-DD) | The date this track becomes featured |
| `artist` | string | Artist display name |
| `title` | string | Track or album title |
| `image` | string (URL) | Square album art (640×640) |
| `url` | string (URL) | UML landing page for the track |
| `services` | object | Map of service ID → deep link URL |

**Service IDs** (always these exact keys, subset may be present):
`spotify`, `apple_music`, `youtube_music`, `tidal`, `amazon_music`

This is a static JSON file. No auth. No CORS issues (GitHub Pages serves with `Access-Control-Allow-Origin: *`).

---

## Schedule Behavior (Date Picking)

The embed script picks the active track client-side using the visitor's local date:

- Finds the **most recent entry whose `date` ≤ today** (YYYY-MM-DD, local time)
- If all entries are in the future, shows the **first** entry
- Date order in the array does not matter — the script sorts before picking

This means you can pre-load upcoming tracks in `featured.json` and they will automatically go live on their scheduled date with no deployment needed.

**Example timeline:**

```
Schedule: [2026-03-16 Track A] [2026-04-01 Track B] [2026-05-01 Track C]

Visitor on 2026-03-20 → sees Track A
Visitor on 2026-04-01 → sees Track B  (goes live at midnight local time)
Visitor on 2026-04-15 → sees Track B
Visitor on 2026-05-02 → sees Track C
```

---

## The Embed Script

**Script URL:**
```
https://npyati.github.io/universalmusiclink/embed.js
```

This is a self-contained IIFE. It:
1. Looks for `<div id="uml-featured">` in the DOM
2. Fetches `featured.json`
3. Picks the active track from the schedule using the visitor's local date
4. Injects scoped CSS (one `<style id="uml-embed-styles">` tag, injected once)
5. Renders the widget HTML into the target div
6. Attaches dropdown toggle and service-select event listeners

**Usage:**
```html
<div id="uml-featured"></div>
<script src="https://npyati.github.io/universalmusiclink/embed.js"></script>
```

The script handles `DOMContentLoaded` safely — it can be placed in `<head>`, inline in `<body>`, or at the end of `<body>`.

---

## Widget Structure

When rendered, the target div contains:

```html
<div class="uml-widget">
  <a class="uml-art-wrap" href="[active service url]" target="_blank">
    <img class="uml-art" src="[image]" alt="[title] – [artist]">
  </a>
  <p class="uml-artist">[artist]</p>
  <p class="uml-title">[title]</p>
  <hr class="uml-rule">
  <div class="uml-services">
    <!-- split button dropdown, re-rendered on service change -->
    <div class="uml-listen-wrap">
      <a class="uml-listen-main" href="[active url]" target="_blank">
        <img class="uml-icon"> Open in [Service]
      </a>
      <button class="uml-listen-toggle" aria-haspopup="listbox" aria-expanded="false">▼</button>
      <div class="uml-listen-dropdown" role="listbox" hidden>
        <button class="uml-dropdown-item" data-service="[id]">
          <img class="uml-icon"> [Service Name]
        </button>
        <!-- one per non-active service -->
      </div>
    </div>
  </div>
  <p class="uml-powered"><a href="[url]">via universalmusiclink</a></p>
</div>
```

All class names are prefixed `uml-` to avoid collisions with host page styles.

---

## Styling Contract

The widget's CSS uses CSS custom properties with fallbacks. If the host page defines any of these variables, the widget inherits them automatically:

| Variable | Used for | Fallback |
|---|---|---|
| `--text` | Text color, borders, main button background | `#111` |
| `--bg` | Page/dropdown background, main button text | `#fff` |
| `--muted` | Artist label, "via" link | `#999` |
| `--rule` | Divider lines | `rgba(0,0,0,0.12)` |
| `--hover` | Hover state on dropdown items and toggle | `rgba(0,0,0,0.05)` |

**The main listen button** always uses an inverted color scheme: `background: var(--text)`, `color: var(--bg)`. This makes it the most prominent element.

**Album art** has an octagonal clip-path (20px bevels on all 8 corners) matching the UML track page aesthetic.

**Max width:** `.uml-widget` is constrained to `360px` wide. Place the `#uml-featured` container inside whatever column/grid cell fits your layout.

---

## Dropdown Behavior

- On load: the active service is the user's `localStorage` preference (`uml_preferred_service`) if valid, otherwise the first service in the object.
- Clicking the toggle button (▼) shows/hides the dropdown. The main link and album art link always point to the active service.
- Clicking a dropdown item: stores preference in `localStorage`, re-renders the split button with the new active service.
- Clicking outside: closes the dropdown.
- The dropdown overlays content below it (`z-index: 1000`).

---

## Service Icons

Icons are black SVGs from the Simple Icons CDN:
```
https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/[name].svg
```

Inside `.uml-listen-main` (dark background), icons are inverted white via `filter: brightness(0) invert(1)`. In the dropdown (light background), they display as-is (dark).

If the host page has a dark background, the dropdown icons will be hard to see unless you add:
```css
.uml-dropdown-item .uml-icon {
  filter: brightness(0) invert(1);
}
```

---

## Manual Fetch (Alternative to Embed Script)

If you want to build a custom UI rather than use `embed.js`, fetch the JSON and implement the picker yourself:

```js
function pickFeatured(schedule) {
  const today = new Date();
  const todayStr = today.getFullYear() + '-'
    + String(today.getMonth() + 1).padStart(2, '0') + '-'
    + String(today.getDate()).padStart(2, '0');

  const sorted = [...schedule].sort((a, b) => a.date.localeCompare(b.date));
  let active = sorted[0];
  for (const entry of sorted) {
    if (entry.date <= todayStr) active = entry;
  }
  return active;
}

fetch('https://npyati.github.io/universalmusiclink/featured.json')
  .then(r => r.json())
  .then(data => {
    const track = pickFeatured(data.schedule);
    // track.artist, track.title, track.image, track.url, track.services
  });
```

The `services` object key order is the display order for the dropdown. The `url` field is the UML landing page (use this for a "See all services" fallback link).

---

## Adding Tracks to the Schedule

1. Create the track directory (e.g. `artist-trackname/index.html`) following the pattern of `gorillaz-the-mountain/index.html`
2. Add a new entry to the `schedule` array in `featured.json` with the desired `date`
3. Push to `master` — GitHub Pages deploys within ~1 minute

**To pre-schedule future tracks:** just add entries with future dates. They will not be shown until that date arrives in the visitor's local timezone. There is no re-deployment needed when a scheduled date passes.

**Note on caching:** GitHub Pages caches `featured.json` for ~10 minutes. A track scheduled for midnight may appear slightly late for cached visitors.
