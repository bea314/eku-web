type LeafletNs = {
  map: (
    el: HTMLElement,
    opts: Record<string, unknown>,
  ) => {
    setView: (c: [number, number], z: number) => unknown;
    invalidateSize: () => void;
    remove: () => void;
  };
  tileLayer: (url: string, opts: Record<string, unknown>) => { addTo: (m: unknown) => void };
  marker: (
    c: [number, number],
    opts?: Record<string, unknown>,
  ) => { addTo: (m: unknown) => void };
  divIcon: (opts: Record<string, unknown>) => unknown;
};

let leafletPromise: Promise<LeafletNs> | null = null;

function coerceCoord(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function loadLeaflet(): Promise<LeafletNs> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  const existing = (window as Window & { L?: LeafletNs }).L;
  if (existing) return Promise.resolve(existing);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    const cssId = 'eku-leaflet-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      const L = (window as Window & { L?: LeafletNs }).L;
      if (!L) reject(new Error('Leaflet no cargó'));
      else resolve(L);
    };
    script.onerror = () => reject(new Error('Leaflet no cargó'));
    document.head.appendChild(script);
  });

  return leafletPromise;
}

function bindMapsOpen(surface: HTMLElement) {
  const open = () => {
    const url = surface.dataset.mapsUrl;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };
  surface.addEventListener('click', open);
  surface.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      open();
    }
  });
}

/** Paint Leaflet pin after the detail HTML is in the DOM. No-op if no canvas. */
export async function mountEventMap(root: ParentNode = document): Promise<void> {
  const surface = root.querySelector<HTMLElement>('.event-map__surface');
  if (surface) bindMapsOpen(surface);

  const canvas = root.querySelector<HTMLElement>('.event-map__canvas');
  if (!canvas) return;

  const lat = coerceCoord(canvas.dataset.lat);
  const lng = coerceCoord(canvas.dataset.lng);
  if (lat == null || lng == null) return;

  try {
    const L = await loadLeaflet();
    const map = L.map(canvas, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
    });
    map.setView([lat, lng], 15);
    requestAnimationFrame(() => map.invalidateSize());
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);
    L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'event-map__pin',
        iconSize: [28, 36],
        iconAnchor: [14, 34],
        html: '<span class="event-map__pin-dot"></span>',
      }),
      keyboard: false,
      interactive: false,
    }).addTo(map);
  } catch {
    canvas.innerHTML =
      '<div class="event-map__fallback"><span>Tocá para abrir en mapas externos.</span></div>';
  }
}
