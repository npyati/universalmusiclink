// Generates track pages and index from tracks.json.
// Run: node build.js

const fs   = require('fs');
const path = require('path');

const { baseUrl, tracks } = JSON.parse(fs.readFileSync('tracks.json', 'utf8'));

const serviceLabels = {
  spotify:       'Spotify',
  apple_music:   'Apple Music',
  youtube_music: 'YouTube Music',
  tidal:         'Tidal',
  amazon_music:  'Amazon Music',
};

// ── Track page template ────────────────────────────────────────────────────

function trackPage(track) {
  const serviceNames = Object.keys(track.services)
    .map(id => serviceLabels[id])
    .filter(Boolean)
    .join(', ');

  const servicesJs = JSON.stringify(track.services, null, 6)
    .replace(/^{/, '').replace(/}$/, '').trim();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${track.title} – ${track.artist}</title>

  <!-- Open Graph -->
  <meta property="og:title" content="${track.title} – ${track.artist}" />
  <meta property="og:description" content="Listen on ${serviceNames}." />
  <meta property="og:image" content="${track.art}" />
  <meta property="og:image:width" content="640" />
  <meta property="og:image:height" content="640" />
  <meta property="og:url" content="${baseUrl}/${track.id}/" />
  <meta property="og:type" content="music.song" />
  <meta property="og:site_name" content="Universal Music Link" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${track.title} – ${track.artist}" />
  <meta name="twitter:description" content="Listen on ${serviceNames}." />
  <meta name="twitter:image" content="${track.art}" />

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <div class="page">
    <a class="album-art-wrap" id="album-art-link" href="#" target="_blank" rel="noopener">
      <img
        class="album-art"
        src="${track.art}"
        alt="${track.title} – ${track.artist}"
        crossorigin="anonymous"
      >
    </a>
    <p class="track-artist">${track.artist}</p>
    <h1 class="track-title">${track.title}</h1>
    <hr class="rule">
    <div id="services-container"></div>
  </div>

  <script>
    window.TRACK_SERVICES = {
      ${servicesJs}
    };
  </script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.0/color-thief.umd.js"></script>
  <script src="../theme.js"></script>
  <script src="../app.js"></script>
</body>
</html>
`;
}

// ── Index page template ────────────────────────────────────────────────────

function indexPage(tracks) {
  const rows = tracks.map(t => `
      <a href="${t.id}/" class="track-link">
        <img src="${t.art}" alt="${t.title}">
        <div class="track-link-info">
          <span class="track-link-title">${t.title}</span>
          <span class="track-link-artist">${t.artist}</span>
        </div>
      </a>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Universal Music Link</title>

  <meta property="og:title" content="Universal Music Link" />
  <meta property="og:description" content="One link. Every streaming service." />
  <meta property="og:type" content="website" />

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <style>
    :root { --title-font: 'Syne', sans-serif; }
    .home-title {
      font-family: var(--title-font);
      font-size: clamp(2rem, 6vw, 3rem);
      font-weight: 800;
      letter-spacing: -0.04em;
      line-height: 0.95;
      margin-bottom: 8px;
    }
    .home-sub {
      font-size: 0.85rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 32px;
    }
    .track-links { display: flex; flex-direction: column; gap: 1px; border: 1.5px solid var(--text); }
    .track-link {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 16px;
      background: var(--bg); text-decoration: none; color: var(--text);
      border-bottom: 1px solid var(--rule); transition: background 0.1s;
    }
    .track-link:last-child { border-bottom: none; }
    .track-link:hover { background: var(--hover); }
    .track-link img { width: 40px; height: 40px; object-fit: cover; flex-shrink: 0; }
    .track-link-info { display: flex; flex-direction: column; gap: 2px; }
    .track-link-title { font-weight: 600; font-size: 0.9rem; }
    .track-link-artist { color: var(--muted); font-size: 0.75rem; letter-spacing: 0.05em; }
  </style>
</head>
<body>
  <div class="page">
    <p class="home-sub">Universal Music Link</p>
    <h1 class="home-title">One link.<br>Every service.</h1>
    <hr class="rule">
    <div class="track-links">${rows}
    </div>
  </div>
</body>
</html>
`;
}

// ── Build ──────────────────────────────────────────────────────────────────

let built = 0;

for (const track of tracks) {
  const dir = path.join(__dirname, track.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), trackPage(track));
  console.log(`  built  ${track.id}/index.html`);
  built++;
}

fs.writeFileSync(path.join(__dirname, 'index.html'), indexPage(tracks));
console.log(`  built  index.html`);

console.log(`\nDone. ${built} track page${built !== 1 ? 's' : ''} + index.`);
