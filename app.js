const PREF_KEY = 'uml_preferred_service';

// Simple Icons CDN slugs — https://simpleicons.org
const SERVICE_ICONS = {
  spotify:       'spotify',
  apple_music:   'applemusic',
  youtube_music: 'youtubemusic',
  tidal:         'tidal',
  amazon_music:  'amazonmusic',
  deezer:        'deezer',
};

const SERVICE_LABELS = {
  spotify:       'Spotify',
  apple_music:   'Apple Music',
  youtube_music: 'YouTube Music',
  tidal:         'Tidal',
  amazon_music:  'Amazon Music',
  deezer:        'Deezer',
};

function icon(serviceId, size = 18) {
  const slug = SERVICE_ICONS[serviceId];
  return `<img src="https://cdn.simpleicons.org/${slug}/ffffff" width="${size}" height="${size}" alt="" aria-hidden="true" class="service-icon">`;
}

function getPreference() {
  return localStorage.getItem(PREF_KEY);
}

function setPreference(serviceId) {
  localStorage.setItem(PREF_KEY, serviceId);
  renderServices();
}

function clearPreference() {
  localStorage.removeItem(PREF_KEY);
  renderServices();
}

function renderServices() {
  const container = document.getElementById('services-container');
  if (!container) return;

  const services = window.TRACK_SERVICES;
  const pref = getPreference();

  const available = Object.keys(services);
  const preferredService = pref && services[pref] ? pref : null;
  const others = available.filter(id => id !== preferredService);

  let html = '';

  if (preferredService) {
    const label = SERVICE_LABELS[preferredService];
    const url = services[preferredService];
    html += `
      <div class="preferred-section">
        <div class="preferred-label">Your preferred service</div>
        <a href="${url}" class="btn-preferred" target="_blank" rel="noopener">
          ${icon(preferredService, 20)}
          Open in ${label}
        </a>
      </div>
      <hr class="divider">
      <div class="services-section">
        <div class="services-label">Other services</div>
        <div class="service-list">
    `;
    for (const id of others) {
      const lbl = SERVICE_LABELS[id];
      const u = services[id];
      html += `
        <a href="${u}" class="btn-service" target="_blank" rel="noopener"
           onclick="handleServiceClick(event, '${id}')">
          ${icon(id)}
          <span class="service-name">${lbl}</span>
          <span class="set-default-hint">set as default</span>
        </a>
      `;
    }
    html += `
        </div>
        <p class="footer" style="margin-top:12px">
          <a href="#" onclick="clearPreference();return false">Clear preference</a>
        </p>
      </div>
    `;
  } else {
    html += `
      <div class="services-section">
        <div class="services-label">Listen on</div>
        <div class="service-list all-services">
    `;
    for (const id of available) {
      const lbl = SERVICE_LABELS[id];
      const u = services[id];
      html += `
        <a href="${u}" class="btn-service" target="_blank" rel="noopener"
           onclick="handleServiceClick(event, '${id}')">
          ${icon(id)}
          <span class="service-name">${lbl}</span>
          <span class="set-default-hint">set as default</span>
        </a>
      `;
    }
    html += `
        </div>
        <p class="footer" style="margin-top:12px">Tap a service to open it — hover to set as default</p>
      </div>
    `;
  }

  container.innerHTML = html;
}

function handleServiceClick(event, serviceId) {
  setPreference(serviceId);
}

document.addEventListener('DOMContentLoaded', renderServices);
