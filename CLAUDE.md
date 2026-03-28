# Universal Music Link

A static site that showcases a daily "Album of the Day" (AOTD) with links to every major streaming service.

## Album of the Day (AOTD) — Daily Procedure

The user provides an artist and album title. Claude does everything else.

### Step 1: Find streaming links

Use the Odesli API or web search to find all 5 service URLs for the album:

| Service        | URL pattern                                              |
|----------------|----------------------------------------------------------|
| Spotify        | `https://open.spotify.com/album/{id}`                    |
| Apple Music    | `https://music.apple.com/us/album/{slug}/{id}`           |
| YouTube Music  | `https://music.youtube.com/search?q={Artist}+{Album}`   |
| Tidal          | `https://tidal.com/browse/album/{id}`                    |
| Amazon Music   | `https://music.amazon.com/albums/{id}`                   |

YouTube Music always uses a search URL with `+` separating words.

### Step 2: Find the Spotify cover art URL

The image URL must use the Spotify CDN full-size prefix: `ab67616d0000b273`.

Format: `https://i.scdn.co/image/ab67616d0000b273{hash}`

You can find this from the Spotify album page or API. The homepage automatically swaps the prefix to `ab67616d00001e02` for thumbnails — you only need to store the full-size version.

### Step 3: Create the album directory and page

Directory name: `{artist}-{album}` in lowercase kebab-case (e.g., `fela-kuti-zombie`).

Create `{directory}/index.html` using this exact template (substitute values in `{braces}`):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{Artist} – {Album}</title>

  <!-- Open Graph -->
  <meta property="og:title" content="{Artist} – {Album}" />
  <meta property="og:description" content="Listen on Spotify, Apple Music, YouTube Music, Tidal, Amazon Music." />
  <meta property="og:image" content="{spotify_image_url}" />
  <meta property="og:image:width" content="640" />
  <meta property="og:image:height" content="640" />
  <meta property="og:url" content="https://npyati.github.io/universalmusiclink/{directory}/" />
  <meta property="og:type" content="music.album" />
  <meta property="og:site_name" content="Universal Music Link" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{Artist} – {Album}" />
  <meta name="twitter:description" content="Listen on Spotify, Apple Music, YouTube Music, Tidal, Amazon Music." />
  <meta name="twitter:image" content="{spotify_image_url}" />

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <div class="page">
    <a class="album-art-wrap" id="album-art-link" href="#" target="_blank" rel="noopener">
      <img
        class="album-art"
        src="{spotify_image_url}"
        alt="{Artist} – {Album}"
        crossorigin="anonymous"
      >
    </a>
    <p class="track-artist">{Artist}</p>
    <h1 class="track-title">{Album}</h1>
    <hr class="rule">
    <div id="services-container"></div>
  </div>

  <script>
    window.TRACK_SERVICES = {
      "spotify": "{spotify_url}",
      "apple_music": "{apple_music_url}",
      "youtube_music": "{youtube_music_url}",
      "tidal": "{tidal_url}",
      "amazon_music": "{amazon_music_url}"
    };
  </script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.0/color-thief.umd.js"></script>
  <script src="../theme.js"></script>
  <script src="../app.js"></script>
</body>
</html>
```

### Step 4: Add entry to featured.json

Prepend a new object to the top of the `schedule` array in `featured.json`:

```json
{
  "date": "YYYY-MM-DD",
  "artist": "{Artist}",
  "title": "{Album}",
  "image": "{spotify_image_url}",
  "url": "https://npyati.github.io/universalmusiclink/{directory}/",
  "services": {
    "spotify": "{spotify_url}",
    "apple_music": "{apple_music_url}",
    "youtube_music": "{youtube_music_url}",
    "tidal": "{tidal_url}",
    "amazon_music": "{amazon_music_url}"
  }
}
```

Use today's date unless the user specifies otherwise.

### Step 5: Commit

Commit message format: `AOTD M/D/YY` (e.g., `AOTD 3/28/26`).

Stage both files: `featured.json` and `{directory}/index.html`.

### Checklist

- [ ] All 5 streaming service URLs are real and correct
- [ ] Spotify image URL uses the `ab67616d0000b273` prefix (full-size)
- [ ] Directory name is lowercase kebab-case
- [ ] `featured.json` entry date is correct
- [ ] `index.html` uses `–` (en dash) between artist and album in title/meta/alt
- [ ] Commit message follows `AOTD M/D/YY` format
