/** Event detail map — Nest coords + Leaflet preview. Isolated from safe-display. */

/** Same PMTiles coverage as Flutter `MapConfig` (El Salvador + Guatemala). */
export const MAP_COVERAGE = {
  minLat: 12.98,
  maxLat: 17.82,
  minLng: -92.24,
  maxLng: -87.62,
} as const;

export type EventCoords = { lat: number; lng: number };

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
  if (value && typeof value === 'object') {
    const n = Number(String(value));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function pairFrom(record: Record<string, unknown> | null | undefined): EventCoords | null {
  if (!record) return null;
  const lat = coerceCoord(record.latitude ?? record.lat);
  const lng = coerceCoord(record.longitude ?? record.lng);
  if (lat == null || lng == null) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

function escapeAttr(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

export function isVirtualEvent(e: object | null | undefined): boolean {
  if (!e || typeof e !== 'object') return false;
  const o = e as Record<string, unknown>;
  return o.isVirtual === true || o.virtual === true;
}

/** Nest location object or top-level lat/lng — same aliases as Flutter `eventDetailFromJson`. */
export function eventCoords(e: object | null | undefined): EventCoords | null {
  if (!e || typeof e !== 'object') return null;
  const o = e as Record<string, unknown>;
  const fromRoot = pairFrom(o);
  if (fromRoot) return fromRoot;
  if (o.location && typeof o.location === 'object' && !Array.isArray(o.location)) {
    return pairFrom(o.location as Record<string, unknown>);
  }
  return null;
}

export function isWithinMapCoverage(coords: EventCoords): boolean {
  return (
    coords.lat >= MAP_COVERAGE.minLat &&
    coords.lat <= MAP_COVERAGE.maxLat &&
    coords.lng >= MAP_COVERAGE.minLng &&
    coords.lng <= MAP_COVERAGE.maxLng
  );
}

export function externalMapsUrl(coords: EventCoords, label = ''): string {
  const q = label.trim()
    ? `${coords.lat},${coords.lng} (${label.trim()})`
    : `${coords.lat},${coords.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function eventMapSectionHtml(event: object, label: string): string {
  if (isVirtualEvent(event)) return '';
  const coords = eventCoords(event);
  if (!coords) return '';

  const maps = externalMapsUrl(coords, label);
  const inCoverage = isWithinMapCoverage(coords);
  const body = inCoverage
    ? `<div
         class="event-map__canvas"
         data-lat="${coords.lat}"
         data-lng="${coords.lng}"
         aria-hidden="true"
       ></div>
       <span class="event-map__attr">© OpenStreetMap</span>`
    : `<div class="event-map__fallback">
         <strong>Vista previa no disponible</strong>
         <span>El mapa cubre El Salvador y Guatemala. Tocá para abrir en mapas externos.</span>
       </div>`;

  return `<section class="event-map" aria-label="Ubicación">
    <h2 class="section-title">Ubicación</h2>
    <div
      class="event-map__surface${inCoverage ? '' : ' event-map__surface--empty'}"
      role="link"
      tabindex="0"
      data-maps-url="${escapeAttr(maps)}"
      aria-label="Abrir ubicación en Google Maps"
    >${body}</div>
  </section>`;
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
