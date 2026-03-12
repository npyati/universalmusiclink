// Extracts a color palette from the album art and applies a randomized
// theme using CSS variables. Falls back gracefully if CORS blocks sampling.

(function () {
  const MIN_CONTRAST = 4.5;

  // Curated pool of bold/display Google Fonts with their import slug and CSS name
  const FONTS = [
    { slug: 'Syne:wght@800',                    css: "'Syne', sans-serif" },
    { slug: 'Unbounded:wght@800',               css: "'Unbounded', sans-serif" },
    { slug: 'Barlow+Condensed:wght@700',        css: "'Barlow Condensed', sans-serif" },
    { slug: 'Big+Shoulders+Display:wght@800',   css: "'Big Shoulders Display', sans-serif" },
    { slug: 'DM+Serif+Display',                 css: "'DM Serif Display', serif" },
    { slug: 'Playfair+Display:wght@800',        css: "'Playfair Display', serif" },
    { slug: 'Anton',                            css: "'Anton', sans-serif" },
    { slug: 'Bebas+Neue',                       css: "'Bebas Neue', sans-serif" },
    { slug: 'Chakra+Petch:wght@700',            css: "'Chakra Petch', sans-serif" },
    { slug: 'Bungee',                           css: "'Bungee', sans-serif" },
    { slug: 'Russo+One',                        css: "'Russo One', sans-serif" },
    { slug: 'Space+Grotesk:wght@700',           css: "'Space Grotesk', sans-serif" },
  ];

  function loadFont(font) {
    return new Promise(resolve => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${font.slug}&display=swap`;
      link.onload = resolve;
      link.onerror = resolve; // resolve anyway, CSS will fall back
      document.head.appendChild(link);
    });
  }

  function luminance(r, g, b) {
    return [r, g, b].reduce((acc, c, i) => {
      c /= 255;
      c = c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      return acc + c * [0.2126, 0.7152, 0.0722][i];
    }, 0);
  }

  function saturation(r, g, b) {
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    return max === 0 ? 0 : (max - min) / max;
  }

  function contrast(l1, l2) {
    const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }

  function toHex(r, g, b) {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  function ramp(hex, alpha) {
    return hex + Math.round(alpha * 255).toString(16).padStart(2, '0');
  }

  function applyTheme() {
    const img = document.querySelector('.album-art');
    if (!img || !window.ColorThief) return;

    const thief = new ColorThief();

    const run = () => {
      let palette;
      try {
        palette = thief.getPalette(img, 10);
      } catch (e) {
        return; // CORS blocked — keep page-defined fallback vars
      }

      // Annotate each color with luminance + saturation
      const colors = palette.map(([r, g, b]) => ({
        r, g, b,
        hex: toHex(r, g, b),
        lum: luminance(r, g, b),
        sat: saturation(r, g, b),
      }));

      // Sort dark → light
      const sorted = [...colors].sort((a, b) => a.lum - b.lum);

      // Build candidate bg/text pairs. We try multiple combos and pick one
      // randomly from those that pass contrast threshold.
      const pairs = [];
      for (let bi = 0; bi < sorted.length; bi++) {
        for (let ti = 0; ti < sorted.length; ti++) {
          if (bi === ti) continue;
          const bg = sorted[bi], text = sorted[ti];
          if (contrast(bg.lum, text.lum) >= MIN_CONTRAST) {
            pairs.push({ bg, text });
          }
        }
      }

      if (pairs.length === 0) return; // give up, keep fallback

      // Weight toward extremes for variety — dark bg or light bg
      // Shuffle and pick
      const shuffled = pairs.sort(() => Math.random() - 0.5);
      const { bg, text } = shuffled[0];

      // Pick a muted color: something between bg and text in luminance
      const muted = colors
        .filter(c => c.hex !== bg.hex && c.hex !== text.hex)
        .sort((a, b) =>
          Math.abs(a.lum - (bg.lum + text.lum) / 2) -
          Math.abs(b.lum - (bg.lum + text.lum) / 2)
        )[0] || text;

      const root = document.documentElement;
      root.style.setProperty('--bg',    bg.hex);
      root.style.setProperty('--text',  text.hex);
      root.style.setProperty('--muted', muted.hex);
      root.style.setProperty('--rule',  ramp(text.hex, 0.15));
      root.style.setProperty('--hover', ramp(text.hex, 0.06));

      // Color block behind image: most saturated palette color, randomized offset
      const shadowColor = [...colors].sort((a, b) => b.sat - a.sat)[0];
      const offsets = [[6,6], [8,8], [10,6], [6,10], [-6,6], [8,-8], [-8,-6]];
      const [ox, oy] = offsets[Math.floor(Math.random() * offsets.length)];
      root.style.setProperty('--shadow-color', shadowColor.hex);
      root.style.setProperty('--shadow-x', `${ox}px`);
      root.style.setProperty('--shadow-y', `${oy}px`);

      // Randomize text alignment
      const alignments = ['left', 'left', 'left', 'right', 'center']; // left-weighted
      const align = alignments[Math.floor(Math.random() * alignments.length)];
      root.style.setProperty('--text-align', align);

      // Randomize font
      const font = FONTS[Math.floor(Math.random() * FONTS.length)];
      loadFont(font).then(() => {
        root.style.setProperty('--title-font', font.css);
      });

      // Tell CSS which icon filter to use
      if (bg.lum < 0.4) {
        document.body.classList.add('theme-dark');
        document.body.classList.remove('theme-light');
      } else {
        document.body.classList.add('theme-light');
        document.body.classList.remove('theme-dark');
      }
    };

    if (img.complete && img.naturalWidth > 0) {
      run();
    } else {
      img.addEventListener('load', run);
    }
  }

  document.addEventListener('DOMContentLoaded', applyTheme);
})();
