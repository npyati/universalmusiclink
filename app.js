const PREF_KEY = 'uml_preferred_service';

const SERVICE_COLORS = {
  spotify:      { bg: '#1DB954', text: '#000' },
  apple_music:  { bg: '#FC3C44', text: '#fff' },
  youtube_music:{ bg: '#FF0000', text: '#fff' },
  tidal:        { bg: '#00FFFF', text: '#000' },
  amazon_music: { bg: '#00A8E0', text: '#fff' },
  deezer:       { bg: '#FEAA2D', text: '#000' },
};

const SERVICE_LABELS = {
  spotify:       'Spotify',
  apple_music:   'Apple Music',
  youtube_music: 'YouTube Music',
  tidal:         'Tidal',
  amazon_music:  'Amazon Music',
  deezer:        'Deezer',
};

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

  // Filter to only services that exist in this track's data
  const available = Object.keys(services);
  const preferredService = pref && services[pref] ? pref : null;
  const others = available.filter(id => id !== preferredService);

  let html = '';

  if (preferredService) {
    const color = SERVICE_COLORS[preferredService];
    const label = SERVICE_LABELS[preferredService];
    const url = services[preferredService];
    html += `
      <div class="preferred-section">
        <div class="preferred-label">Your preferred service</div>
        <a href="${url}" class="btn-preferred" style="background:${color.bg};color:${color.text}" target="_blank" rel="noopener">
          <span class="service-dot" style="background:${color.text};opacity:0.4"></span>
          Open in ${label}
        </a>
      </div>
      <hr class="divider">
      <div class="services-section">
        <div class="services-label">Other services</div>
        <div class="service-list">
    `;
    for (const id of others) {
      const c = SERVICE_COLORS[id];
      const lbl = SERVICE_LABELS[id];
      const u = services[id];
      html += `
        <a href="${u}" class="btn-service" target="_blank" rel="noopener"
           onclick="handleServiceClick(event, '${id}')">
          <span class="service-dot" style="background:${c.bg}"></span>
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
        <div class="services-label all-services-label">Listen on</div>
        <div class="service-list all-services">
    `;
    for (const id of available) {
      const c = SERVICE_COLORS[id];
      const lbl = SERVICE_LABELS[id];
      const u = services[id];
      html += `
        <a href="${u}" class="btn-service" target="_blank" rel="noopener"
           onclick="handleServiceClick(event, '${id}')">
          <span class="service-dot" style="background:${c.bg}"></span>
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
  // On desktop: clicking opens the link; shift+click or long-press sets default
  // Simple UX: always open the link, set as default on next visit
  // But also set as default now so next visit uses it
  setPreference(serviceId);
  // Let the link navigate normally (don't prevent default)
}

document.addEventListener('DOMContentLoaded', renderServices);
