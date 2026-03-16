/**
 * Universal Music Link — Featured Widget Embed
 *
 * Usage on your personal site:
 *   <div id="uml-featured"></div>
 *   <script src="https://npyati.github.io/universalmusiclink/embed.js"></script>
 *
 * The widget inherits --text, --bg, --muted, --rule, --hover from the host page
 * if those CSS custom properties are defined, otherwise falls back to sensible defaults.
 */
(function () {
  const API_URL = 'https://npyati.github.io/universalmusiclink/featured.json';
  const PREF_KEY = 'uml_preferred_service';

  const SERVICE_ICONS = {
    spotify:       'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/spotify.svg',
    apple_music:   'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/applemusic.svg',
    youtube_music: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/youtubemusic.svg',
    tidal:         'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/tidal.svg',
    amazon_music:  'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazonmusic.svg',
  };

  const SERVICE_LABELS = {
    spotify:       'Spotify',
    apple_music:   'Apple Music',
    youtube_music: 'YouTube Music',
    tidal:         'Tidal',
    amazon_music:  'Amazon Music',
  };

  const CSS = `
    .uml-widget {
      width: 100%;
      max-width: 360px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: var(--text, #111);
    }

    .uml-art-wrap {
      display: block;
      width: 100%;
      margin-bottom: 16px;
      text-decoration: none;
    }

    .uml-art {
      display: block;
      width: 100%;
      aspect-ratio: 1 / 1;
      object-fit: cover;
      clip-path: polygon(
        20px 0%, calc(100% - 20px) 0%,
        100% 20px, 100% calc(100% - 20px),
        calc(100% - 20px) 100%, 20px 100%,
        0% calc(100% - 20px), 0% 20px
      );
    }

    .uml-artist {
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--muted, #999);
      margin-bottom: 6px;
    }

    .uml-title {
      font-size: 1.6rem;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.03em;
      margin-bottom: 16px;
      color: var(--text, #111);
    }

    .uml-rule {
      border: none;
      border-top: 1px solid var(--rule, rgba(0,0,0,0.12));
      margin-bottom: 16px;
    }

    .uml-listen-wrap {
      position: relative;
      display: flex;
      border: 1.5px solid var(--text, #111);
    }

    .uml-listen-main {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: var(--text, #111);
      color: var(--bg, #fff);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      transition: opacity 0.15s;
    }

    .uml-listen-main:hover { opacity: 0.88; }

    .uml-listen-toggle {
      width: 44px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-left: 1.5px solid var(--text, #111);
      color: var(--text, #111);
      cursor: pointer;
      transition: background 0.15s;
    }

    .uml-listen-toggle:hover { background: var(--hover, rgba(0,0,0,0.05)); }

    .uml-listen-dropdown {
      position: absolute;
      top: calc(100% - 1.5px);
      left: -1.5px;
      right: -1.5px;
      background: var(--bg, #fff);
      border: 1.5px solid var(--text, #111);
      z-index: 1000;
    }

    .uml-listen-dropdown[hidden] { display: none; }

    .uml-dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 11px 16px;
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--rule, rgba(0,0,0,0.12));
      color: var(--text, #111);
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: background 0.1s;
    }

    .uml-dropdown-item:last-child { border-bottom: none; }
    .uml-dropdown-item:hover { background: var(--hover, rgba(0,0,0,0.05)); }

    .uml-icon {
      flex-shrink: 0;
      display: block;
      opacity: 0.75;
    }

    .uml-listen-main .uml-icon {
      filter: brightness(0) invert(1);
      opacity: 1;
    }

    .uml-powered {
      margin-top: 10px;
      font-size: 0.65rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--muted, #999);
      text-align: right;
    }

    .uml-powered a {
      color: inherit;
      text-decoration: none;
    }

    .uml-powered a:hover { text-decoration: underline; }
  `;

  function getPreference() {
    return localStorage.getItem(PREF_KEY);
  }

  function setPreference(id) {
    localStorage.setItem(PREF_KEY, id);
  }

  function getActive(services) {
    const pref = getPreference();
    if (pref && services[pref]) return pref;
    return Object.keys(services)[0];
  }

  function iconImg(serviceId, size) {
    return `<img src="${SERVICE_ICONS[serviceId]}" width="${size}" height="${size}" alt="" aria-hidden="true" class="uml-icon">`;
  }

  function renderDropdown(widget, data) {
    const services = data.services;
    const activeId = getActive(services);
    const activeUrl = services[activeId];
    const others = Object.keys(services).filter(id => id !== activeId);

    const artLink = widget.querySelector('.uml-art-wrap');
    if (artLink) artLink.href = activeUrl;

    const container = widget.querySelector('.uml-services');
    container.innerHTML = `
      <div class="uml-listen-wrap">
        <a href="${activeUrl}" class="uml-listen-main" target="_blank" rel="noopener">
          ${iconImg(activeId, 18)}
          <span>Open in ${SERVICE_LABELS[activeId]}</span>
        </a>
        <button class="uml-listen-toggle" aria-haspopup="listbox" aria-expanded="false" aria-label="Choose streaming service">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 8L1 3h10L6 8z"/>
          </svg>
        </button>
        <div class="uml-listen-dropdown" role="listbox" hidden>
          ${others.map(id => `
            <button class="uml-dropdown-item" role="option" data-service="${id}">
              ${iconImg(id, 15)}
              <span>${SERVICE_LABELS[id]}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    const toggle = container.querySelector('.uml-listen-toggle');
    const dropdown = container.querySelector('.uml-listen-dropdown');

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = !dropdown.hidden;
      dropdown.hidden = isOpen;
      toggle.setAttribute('aria-expanded', String(!isOpen));
      if (!isOpen) {
        document.addEventListener('click', function close() {
          dropdown.hidden = true;
          toggle.setAttribute('aria-expanded', 'false');
          document.removeEventListener('click', close);
        });
      }
    });

    container.querySelectorAll('.uml-dropdown-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setPreference(btn.dataset.service);
        renderDropdown(widget, data);
      });
    });
  }

  function render(target, data) {
    target.innerHTML = `
      <div class="uml-widget">
        <a class="uml-art-wrap" href="#" target="_blank" rel="noopener">
          <img class="uml-art" src="${data.image}" alt="${data.title} – ${data.artist}" crossorigin="anonymous">
        </a>
        <p class="uml-artist">${data.artist}</p>
        <p class="uml-title">${data.title}</p>
        <hr class="uml-rule">
        <div class="uml-services"></div>
        <p class="uml-powered"><a href="${data.url}" target="_blank" rel="noopener">via universalmusiclink</a></p>
      </div>
    `;

    const widget = target.querySelector('.uml-widget');
    renderDropdown(widget, data);
  }

  function init() {
    const target = document.getElementById('uml-featured');
    if (!target) return;

    if (!document.getElementById('uml-embed-styles')) {
      const style = document.createElement('style');
      style.id = 'uml-embed-styles';
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    fetch(API_URL)
      .then(function (r) { return r.json(); })
      .then(function (data) { render(target, data); })
      .catch(function (err) { console.error('[uml-embed] Failed to load featured:', err); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
