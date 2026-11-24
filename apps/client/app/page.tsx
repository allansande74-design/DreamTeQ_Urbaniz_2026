"use client";

import { useEffect, useMemo, useState } from "react";

type Spot = { id: string; name: string; address: string; latitude: number; longitude: number; hourlyRate: number; available: number; capacity: number; type: string; features: string[]; updatedAt: string };
type Reservation = { code: string; expiresAt: string; spot: Spot };
type ApiState = "loading" | "live" | "demo" | "offline" | "unavailable";
const filters = ["All", "Garage", "Lot", "Street"];

function mapUrl(spot?: Spot) {
  const lat = spot?.latitude ?? 37.7754;
  const lon = spot?.longitude ?? -122.4194;
  const pad = 0.006;
  const bbox = `${lon - pad},${lat - pad},${lon + pad},${lat + pad}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat},${lon}`;
}

export default function Home() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [state, setState] = useState<ApiState>("loading");
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let mounted = true;
    const updateNetwork = () => setOnline(navigator.onLine);
    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);
    try { setSaved(JSON.parse(localStorage.getItem("urbaniz-saved") || "[]") as string[]); } catch { setSaved([]); }
    fetch("/api/spots").then(async (response) => {
      if (!response.ok) throw new Error(response.status === 503 ? "unavailable" : "request");
      return response.json() as Promise<{ spots: Spot[]; source: "live" | "demo" }>;
    }).then((data) => {
      if (!mounted) return;
      setSpots(data.spots);
      setSelectedId(data.spots[0]?.id ?? "");
      setState(data.source);
    }).catch(async () => {
      if (!mounted) return;
      try {
        const cached = await caches.match("/api/spots");
        if (cached) {
          const data = await cached.json() as { spots: Spot[] };
          setSpots(data.spots);
          setSelectedId(data.spots[0]?.id ?? "");
          setState("offline");
        } else setState(navigator.onLine ? "unavailable" : "offline");
      } catch { setState(navigator.onLine ? "unavailable" : "offline"); }
    });
    return () => { mounted = false; window.removeEventListener("online", updateNetwork); window.removeEventListener("offline", updateNetwork); };
  }, []);

  const visible = useMemo(() => spots.filter((spot) => (filter === "All" || spot.type.toLowerCase().includes(filter.toLowerCase())) && `${spot.name} ${spot.address}`.toLowerCase().includes(query.toLowerCase().trim())), [spots, filter, query]);
  const selected = visible.find((spot) => spot.id === selectedId) ?? visible[0];

  async function reserve(spot: Spot) {
    if (!online) { setMessage("Reservations require a network connection. Your saved places are available offline."); return; }
    setBusy(spot.id);
    try {
      const response = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ spotId: spot.id }) });
      if (response.status === 401) { window.location.assign(`/signin?next=${encodeURIComponent("/")}`); return; }
      const result = await response.json() as { error?: string; code?: string; expiresAt?: string };
      if (!response.ok) throw new Error(result.error || "Reservation could not be completed.");
      setReservation({ code: result.code ?? "", expiresAt: result.expiresAt ?? "", spot });
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to reserve. Please try again."); }
    finally { setBusy(""); }
  }

  function toggleSaved(id: string) {
    const next = saved.includes(id) ? saved.filter((value) => value !== id) : [...saved, id];
    setSaved(next);
    localStorage.setItem("urbaniz-saved", JSON.stringify(next));
  }

  const statusLabel = state === "live" ? "Operator availability" : state === "demo" ? "Demo inventory" : state === "offline" ? "Offline · last saved data" : state === "loading" ? "Loading parking" : "Inventory not configured";
  return <main className="urbaniz">
    <header className="site-header"><a className="brand" href="/" aria-label="Urbaniz home"><span className="brand-icon">U</span>urbaniz<span className="brand-period">.</span></a><nav aria-label="Main navigation"><a className="nav-current" href="#parking">Find parking</a><a href="#about">How it works</a></nav><div className="header-right"><span className={`service-status ${state === "live" && online ? "status-live" : ""}`}><i />{online ? statusLabel : "Offline"}</span><a className="sign-in-link" href="/signin">Sign in</a></div></header>
    <section className="welcome"><div><p className="kicker">PARKING, WITHOUT THE GUESSWORK</p><h1>A better spot is <span>around the corner.</span></h1><p className="welcome-copy">Explore nearby parking, compare prices, and book with confidence.</p></div><div className="network-note"><strong>{state === "live" ? "Connected to parking operators" : state === "demo" ? "Preview environment" : state === "offline" ? "Showing cached availability" : "Availability source"}</strong><span>{state === "live" ? "Inventory timestamps are shown for each location." : state === "demo" ? "Sample listings are illustrative, not bookable." : "Live inventory appears when a parking provider is connected."}</span></div></section>
    <section className="discovery" id="parking">
      <div className="results-column"><div className="search-control"><span aria-hidden="true">⌕</span><input aria-label="Search parking locations" placeholder="Search a street or neighborhood" value={query} onChange={(event) => setQuery(event.target.value)} /><button aria-label="Search" onClick={() => document.querySelector<HTMLInputElement>(".search-control input")?.focus()}>Search</button></div>
        <div className="list-header"><div><p className="kicker">EXPLORE THE NEIGHBORHOOD</p><h2>Parking nearby</h2><p>{state === "live" ? `${visible.length} locations · live operator feed` : state === "demo" ? `${visible.length} illustrative sample locations` : state === "offline" ? `${visible.length} cached locations · availability may be outdated` : state === "loading" ? "Finding parking locations…" : "Live parking inventory is not configured for this deployment."}</p></div><div className="filter-row" role="group" aria-label="Filter parking type">{filters.map((item) => <button key={item} className={filter === item ? "filter-selected" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
        <div className="spot-results">{visible.map((spot) => <article key={spot.id} className={`spot-row ${selected?.id === spot.id ? "spot-current" : ""}`} onClick={() => setSelectedId(spot.id)}><div className="parking-symbol" aria-hidden="true">P</div><div className="spot-copy"><div className="spot-name-line"><h3>{spot.name}</h3><button className={`save-spot ${saved.includes(spot.id) ? "saved" : ""}`} aria-label={saved.includes(spot.id) ? "Remove saved parking" : "Save parking"} onClick={(event) => { event.stopPropagation(); toggleSaved(spot.id); }}>{saved.includes(spot.id) ? "♥" : "♡"}</button></div><p>{spot.address}</p><div className="spot-features"><span>{spot.type}</span>{spot.features.slice(0, 2).map((feature) => <span key={feature}>{feature}</span>)}{state === "live" && spot.updatedAt && <span>Updated {new Date(spot.updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>}</div><div className="spot-actions"><strong>${spot.hourlyRate.toFixed(2)}<small> / hour</small></strong><span className={spot.available > 0 ? "spaces-available" : "spaces-full"}>{spot.available} of {spot.capacity} available</span><button disabled={busy === spot.id || spot.available < 1 || state !== "live" || !online} onClick={(event) => { event.stopPropagation(); void reserve(spot); }}>{busy === spot.id ? "Booking…" : state === "demo" ? "Preview only" : !online ? "Offline" : "Reserve"}</button></div></div></article>)}
          {state === "loading" && <div className="empty-state">Loading nearby parking…</div>}
          {state === "unavailable" && <div className="empty-state"><strong>Parking inventory isn’t connected yet.</strong><span>Configure the backend to display verified operator availability. No sample data is presented as live.</span></div>}
          {state === "offline" && spots.length === 0 && <div className="empty-state"><strong>You’re offline.</strong><span>Reconnect to load parking locations. Previously saved places remain on this device.</span></div>}
          {state !== "loading" && state !== "unavailable" && visible.length === 0 && <div className="empty-state">No locations match this search.</div>}
        </div><p className="data-footnote">Availability and pricing are supplied by parking operators when connected. Confirm posted terms with the operator.</p>
      </div>
      <aside className="map-column"><div className="map-topline"><div><p className="kicker">CITY MAP</p><h2>{selected?.name ?? "Civic Center, San Francisco"}</h2></div><a href={selected ? `https://www.openstreetmap.org/?mlat=${selected.latitude}&mlon=${selected.longitude}#map=16/${selected.latitude}/${selected.longitude}` : "https://www.openstreetmap.org/"} target="_blank" rel="noreferrer">Open map ↗</a></div>{selected ? <iframe key={selected.id} className="real-map" title={`OpenStreetMap centered on ${selected.name}`} src={mapUrl(selected)} loading="lazy" referrerPolicy="no-referrer" /> : <div className="map-placeholder">Select a parking location to see its map.</div>}<div className="map-caption"><span>Map © OpenStreetMap contributors</span><span>{selected ? `${selected.latitude.toFixed(4)}, ${selected.longitude.toFixed(4)}` : "Location coordinates unavailable"}</span></div><p className="map-disclaimer">Map coordinates are provided by the parking source; verify entrance and access details with the operator. Street maps do not guarantee live parking availability.</p></aside>
    </section>
    <footer className="site-footer" id="about"><span>Urbaniz · Smarter parking starts with accurate information.</span><a href="mailto:hello@urbaniz.city">Contact</a><a href="/privacy">Privacy</a></footer>
    {message && <div className="notice" role="alert">{message}<button aria-label="Dismiss" onClick={() => setMessage("")}>×</button></div>}
    {reservation && <div className="dialog-backdrop" onClick={() => setReservation(null)}><section className="booking-dialog" role="dialog" aria-modal="true" aria-labelledby="booking-title" onClick={(event) => event.stopPropagation()}><button className="dialog-close" onClick={() => setReservation(null)} aria-label="Close">×</button><div className="booking-check">✓</div><p className="kicker">RESERVATION CONFIRMED</p><h2 id="booking-title">Your parking is reserved.</h2><p>{reservation.spot.name} · {reservation.spot.address}</p><div className="booking-code"><small>CONFIRMATION</small><strong>{reservation.code}</strong></div><p className="booking-expiry">Reservation expires {new Date(reservation.expiresAt).toLocaleString()}.</p><button className="booking-done" onClick={() => setReservation(null)}>Done</button></section></div>}
  </main>;
}
