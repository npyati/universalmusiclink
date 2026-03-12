const PREF_KEY = 'uml_preferred_service';

// jsDelivr serves Simple Icons SVGs as-is (black on transparent).
// CSS filter: brightness(0) invert(1) makes them white.
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

function getPreference() {
  return localStorage.getItem(PREF_KEY);
}

function setPreference(serviceId) {
  localStorage.setItem(PREF_KEY, serviceId);
}

function getActive() {
  const pref = getPreference();
  const services = window.TRACK_SERVICES;
  // Use preference if valid, else first available
  if (pref && services[pref]) return pref;
  return Object.keys(services)[0];
}

function iconImg(serviceId, size = 18) {
  return `<img src="${SERVICE_ICONS[serviceId]}" width="${size}" height="${size}" alt="" aria-hidden="true" class="service-icon">`;
}

function renderServices() {
  const container = document.getElementById('services-container');
  if (!container) return;

  const services = window.TRACK_SERVICES;
  const activeId = getActive();
  const activeUrl = services[activeId];
  const activeLabel = SERVICE_LABELS[activeId];
  const others = Object.keys(services).filter(id => id !== activeId);

  const artLink = document.getElementById('album-art-link');
  if (artLink) artLink.href = activeUrl;

  container.innerHTML = `
    <div class="listen-wrap" id="listen-wrap">
      <a href="${activeUrl}" id="listen-main" class="listen-main" target="_blank" rel="noopener">
        ${iconImg(activeId, 20)}
        <span id="listen-label">Open in ${activeLabel}</span>
      </a>
      <button class="listen-toggle" id="listen-toggle" onclick="toggleDropdown(event)" aria-haspopup="listbox" aria-expanded="false" aria-label="Choose streaming service">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 8L1 3h10L6 8z"/>
        </svg>
      </button>
      <div class="listen-dropdown" id="listen-dropdown" role="listbox" hidden>
        ${others.map(id => `
          <button class="dropdown-item" role="option" onclick="selectService('${id}')">
            ${iconImg(id, 16)}
            <span>${SERVICE_LABELS[id]}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function toggleDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('listen-dropdown');
  const toggle = document.getElementById('listen-toggle');
  const isOpen = !dropdown.hidden;

  dropdown.hidden = isOpen;
  toggle.setAttribute('aria-expanded', String(!isOpen));

  if (!isOpen) {
    // Close on outside click
    document.addEventListener('click', closeDropdown, { once: true });
  }
}

function closeDropdown() {
  const dropdown = document.getElementById('listen-dropdown');
  const toggle = document.getElementById('listen-toggle');
  if (dropdown) {
    dropdown.hidden = true;
    toggle?.setAttribute('aria-expanded', 'false');
  }
}

function selectService(serviceId) {
  setPreference(serviceId);
  renderServices(); // re-renders with new active service
}

document.addEventListener('DOMContentLoaded', renderServices);
