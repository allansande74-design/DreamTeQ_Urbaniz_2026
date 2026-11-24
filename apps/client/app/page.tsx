"use client";

import { useEffect, useMemo, useState } from "react";

type Spot = {
  id: string;
  name: string;
  address: string;
  distance: string;
  price: number;
  available: number;
  total: number;
  type: string;
  rating: number;
  x: number;
  y: number;
  features: string[];
};

type Reservation = { spot: Spot; code: string; until: string };

const initialSpots: Spot[] = [
  { id: "p1", name: "Market Street Garage", address: "120 Market St · Civic Center", distance: "2 min walk", price: 4.5, available: 18, total: 120, type: "Garage", rating: 4.9, x: 54, y: 37, features: ["Covered", "EV charging"] },
  { id: "p2", name: "Hayes Valley Lot", address: "8 Octavia Blvd · Hayes Valley", distance: "5 min walk", price: 3, available: 7, total: 42, type: "Open lot", rating: 4.7, x: 31, y: 54, features: ["24/7 access"] },
  { id: "p3", name: "Civic Center Plaza", address: "355 McAllister St · Downtown", distance: "4 min walk", price: 5, available: 23, total: 96, type: "Garage", rating: 4.8, x: 69, y: 58, features: ["Covered", "Security"] },
  { id: "p4", name: "Van Ness & Grove", address: "450 Grove St · Civic Center", distance: "7 min walk", price: 2.5, available: 3, total: 28, type: "Street parking", rating: 4.5, x: 25, y: 28, features: ["Street level"] },
  { id: "p5", name: "Fulton Street Garage", address: "550 Fulton St · Hayes Valley", distance: "8 min walk", price: 3.5, available: 12, total: 84, type: "Garage", rating: 4.8, x: 78, y: 30, features: ["Covered", "EV charging"] },
];

const filters = ["All spots", "Garage", "Open lot", "Street parking"];

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths: Record<string, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    car: <><path d="m5 11 1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" /><path d="M3 11h18v7H3zM6 18v2m12-2v2M6 14h.01M18 14h.01" /></>,
    heart: <path d="M20.8 8.8c0 5.2-8.8 10-8.8 10S3.2 14 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    filter: <><path d="M4 7h16M7 12h10m-7 5h4" /></>,
    navigation: <><path d="m3 11 18-8-8 18-2-8-8-2Z" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" /><path d="m19 14 1 2.5 2 1-2 1L19 21l-1-2.5-2-1 2-1 1-2.5Z" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    locate: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2" /></>,
  };
  return <svg {...common}>{paths[name] ?? paths.pin}</svg>;
}

function Brand() {
  return <a className="brand" href="#home" aria-label="Urbaniz home"><span className="brand-mark"><Icon name="pin" size={19} /></span><span>urbaniz<span className="brand-dot">.</span></span></a>;
}

export default function Home() {
  const [spots, setSpots] = useState(initialSpots);
  const [activeFilter, setActiveFilter] = useState("All spots");
  const [selectedId, setSelectedId] = useState("p1");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"map" | "list">("map");
  const [saved, setSaved] = useState<string[]>([]);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [online, setOnline] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const stored = window.localStorage.getItem("urbaniz-saved");
    if (stored) setSaved(JSON.parse(stored) as string[]);
    fetch("/api/spots").then((response) => response.ok ? response.json() : null).then((data: { spots?: Spot[] } | null) => {
      if (data?.spots?.length) setSpots(data.spots);
    }).catch(() => undefined);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);

  const visibleSpots = useMemo(() => spots.filter((spot) => {
    const matchesType = activeFilter === "All spots" || spot.type === activeFilter;
    const query = search.trim().toLowerCase();
    return matchesType && (!query || `${spot.name} ${spot.address} ${spot.type}`.toLowerCase().includes(query));
  }), [activeFilter, search, spots]);
  const selectedSpot = visibleSpots.find((spot) => spot.id === selectedId) ?? visibleSpots[0];

  function toggleSaved(id: string) {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
    setSaved(next);
    window.localStorage.setItem("urbaniz-saved", JSON.stringify(next));
    setNotice(next.includes(id) ? "Spot saved for later" : "Removed from saved spots");
    window.setTimeout(() => setNotice(""), 2200);
  }

  async function reserveSpot(spot: Spot) {
    if (!online) {
      setNotice("You’re offline — reconnect to confirm a reservation.");
      window.setTimeout(() => setNotice(""), 3000);
      return;
    }
    let code = `URB-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    try {
      const response = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ spotId: spot.id }) });
      if (response.ok) {
        const result = await response.json() as { code?: string };
        code = result.code ?? code;
      }
    } catch { /* A local confirmation keeps the demo usable if the API is temporarily unavailable. */ }
    const until = new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setReservation({ spot, code, until });
  }

  return (
    <main className="app-shell" id="home">
      <header className="topbar">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation"><a className="nav-active" href="#explore">Explore</a><a href="#how-it-works">How it works</a><a href="#impact">City impact</a></nav>
        <div className="top-actions"><span className={`connection ${online ? "is-online" : "is-offline"}`}><i />{online ? "Live availability" : "Offline mode"}</span><button className="avatar" aria-label="Account menu">A</button></div>
      </header>

      <section className="intro" id="explore">
        <div><p className="eyebrow"><span className="eyebrow-line" /> PARKING, MADE SIMPLE</p><h1>Your city. <span>Your spot.</span></h1><p className="intro-copy">Find a better place to park, right when you need it.</p></div>
        <div className="intro-note"><span className="note-icon"><Icon name="spark" size={18} /></span><span><strong>Good morning, Alex</strong><small>There are 63 open spots nearby</small></span></div>
      </section>

      <section className="workspace" aria-label="Find parking">
        <aside className="find-panel">
          <div className="search-box"><Icon name="search" size={19} /><input aria-label="Search an area" placeholder="Where are you headed?" value={search} onChange={(event) => setSearch(event.target.value)} /><button className="search-target" aria-label="Use current location" onClick={() => setNotice("Showing spots near your current location")}><Icon name="navigation" size={17} /></button></div>
          <div className="trip-row"><div className="trip-item"><span className="tiny-label">ARRIVAL</span><strong><Icon name="clock" size={15} /> Now <span className="chevron">⌄</span></strong></div><div className="trip-divider" /><div className="trip-item"><span className="tiny-label">LEAVING</span><strong><Icon name="clock" size={15} /> 2 hours <span className="chevron">⌄</span></strong></div><button className="filter-button" aria-label="More filters" onClick={() => setNotice("More parking filters coming soon")}><Icon name="filter" size={18} /></button></div>
          <div className="results-heading"><div><h2>Nearby parking</h2><p>{visibleSpots.length} spots around Civic Center</p></div><button className="sort-button" onClick={() => setActiveFilter("All spots")}>Recommended <span>⌄</span></button></div>
          <div className="filter-chips" role="group" aria-label="Filter parking type">{filters.map((filter) => <button key={filter} className={`chip ${activeFilter === filter ? "chip-active" : ""}`} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div>
          <div className="spot-list">
            {visibleSpots.map((spot) => <article key={spot.id} className={`spot-card ${selectedSpot?.id === spot.id ? "spot-selected" : ""}`} onClick={() => { setSelectedId(spot.id); setView("map"); }}>
              <div className="spot-art"><div className={`parking-glyph glyph-${spot.id}`}><Icon name="car" size={25} /></div><span className="availability-badge"><i />{spot.available} open</span></div>
              <div className="spot-info"><div className="spot-title-row"><h3>{spot.name}</h3><button className={`save-button ${saved.includes(spot.id) ? "is-saved" : ""}`} aria-label={saved.includes(spot.id) ? "Remove saved spot" : "Save spot"} onClick={(event) => { event.stopPropagation(); toggleSaved(spot.id); }}><Icon name="heart" size={18} /></button></div><p className="spot-address"><Icon name="pin" size={13} />{spot.address}</p><div className="spot-meta"><span><Icon name="navigation" size={13} />{spot.distance}</span><span className="rating">★ {spot.rating}</span><span className="spot-type">{spot.type}</span></div><div className="spot-bottom"><span className="price"><strong>${spot.price.toFixed(2)}</strong><small> / hour</small></span><button className="reserve-button" onClick={(event) => { event.stopPropagation(); void reserveSpot(spot); }}>Reserve <Icon name="arrow" size={15} /></button></div></div>
            </article>)}
            {visibleSpots.length === 0 && <div className="empty-results"><Icon name="search" size={22} /><strong>No spots found</strong><span>Try another place or parking type.</span></div>}
          </div>
          <div className="list-footer"><span><Icon name="layers" size={15} /> Showing verified local parking</span><button onClick={() => setNotice("You’re all caught up — these are the closest spots.")}>See all spots <Icon name="arrow" size={14} /></button></div>
        </aside>

        <section className={`map-panel ${view === "list" ? "show-list" : ""}`} aria-label="Parking map">
          <div className="map-controls"><div className="map-live"><span className="pulse-dot" /> LIVE MAP <span className="map-separator">·</span> SAN FRANCISCO</div><div className="map-control-group"><button aria-label="Center map" onClick={() => setNotice("Map centered on Civic Center")}><Icon name="locate" size={17} /></button><button aria-label="Map layers" onClick={() => setNotice("Map layer: parking availability")}><Icon name="layers" size={17} /></button></div></div>
          <div className="map-canvas">
            <div className="map-grid" />
            <svg className="map-streets" viewBox="0 0 900 680" preserveAspectRatio="none" aria-hidden="true"><path d="M-30 170 930 510M-10 535 870 90M130-30 720 710M580-20 240 700M-20 340 940 350M360-20 420 710M-20 90 910 650" /><path className="street-major" d="M-20 440 920 220M-10 250 910 450M490-30 535 710" /><path className="park-path" d="M82 106c68-27 139-22 174 19 41 47 28 116-21 143-43 24-115 3-144-39-29-44-44-94-9-123Z" /></svg>
            <div className="park-label">PATRICIA’S GREEN</div><div className="map-label label-market">MARKET ST</div><div className="map-label label-grove">GROVE ST</div><div className="map-label label-van">VAN NESS AVE</div><div className="district district-one">CIVIC CENTER</div><div className="district district-two">HAYES VALLEY</div>
            {visibleSpots.map((spot) => <button key={spot.id} className={`map-marker ${selectedSpot?.id === spot.id ? "marker-active" : ""}`} style={{ left: `${spot.x}%`, top: `${spot.y}%` }} onClick={() => setSelectedId(spot.id)} aria-label={`${spot.name}, $${spot.price} per hour`}><span>${spot.price.toFixed(2)}</span><i /></button>)}
            <div className="you-are-here"><span /><i>YOU ARE HERE</i></div>
            {selectedSpot && <div className="map-popover"><button className="popover-close" aria-label="Close spot details" onClick={() => setSelectedId("")}><Icon name="close" size={15} /></button><div className="popover-kicker"><span className="pulse-dot" /> {selectedSpot.available} SPACES AVAILABLE</div><strong>{selectedSpot.name}</strong><span>{selectedSpot.distance} away · {selectedSpot.type}</span><div className="popover-bottom"><b>${selectedSpot.price.toFixed(2)}<small> / hr</small></b><button onClick={() => void reserveSpot(selectedSpot)}>Reserve <Icon name="arrow" size={14} /></button></div></div>}
          </div>
          <div className="map-legend"><span><i className="legend-green" /> Available</span><span><i className="legend-blue" /> Selected</span><span><i className="legend-location" /> Your location</span><span className="map-credit">Map data · Urbaniz city network</span></div>
          <button className="mobile-map-toggle" onClick={() => setView(view === "map" ? "list" : "map")}>{view === "map" ? "View list" : "View map"}<Icon name={view === "map" ? "menu" : "layers"} size={16} /></button>
          <div className="impact-pill"><span className="impact-icon"><Icon name="spark" size={15} /></span><span><strong>1,204 kg CO₂ saved</strong><small>by drivers parking smarter today</small></span></div>
        </section>
      </section>

      <footer className="page-footer" id="impact"><span>© 2026 Urbaniz <span className="footer-divider">·</span> Better parking, brighter cities.</span><div><a id="how-it-works" href="#explore">How it works</a><a href="mailto:hello@urbaniz.city">Get in touch</a><a href="#explore">Privacy</a></div></footer>
      <div className="mobile-nav"><button className="mobile-nav-active"><Icon name="search" size={20} /><span>Explore</span></button><button onClick={() => setNotice(saved.length ? `${saved.length} saved parking spot${saved.length === 1 ? "" : "s"}` : "Save a spot to find it here")}><Icon name="heart" size={20} /><span>Saved</span></button><button onClick={() => setNotice(reservation ? `Reservation ${reservation.code}` : "Your upcoming reservations will show here")}><Icon name="car" size={20} /><span>Trips</span></button><button onClick={() => setNotice("Account settings are coming soon")}><Icon name="menu" size={20} /><span>Account</span></button></div>
      {notice && <div className="toast" role="status">{notice}</div>}
      {reservation && <div className="modal-backdrop" role="presentation" onClick={() => setReservation(null)}><section className="reservation-modal" role="dialog" aria-modal="true" aria-labelledby="reservation-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Close" onClick={() => setReservation(null)}><Icon name="close" /></button><div className="success-mark"><Icon name="check" size={27} /></div><p className="eyebrow">YOU’RE ALL SET</p><h2 id="reservation-title">Your spot is waiting.</h2><p className="modal-description">We’ve held a space at {reservation.spot.name} for you.</p><div className="reservation-detail"><span><Icon name="pin" size={17} />{reservation.spot.address}</span><span><Icon name="clock" size={17} />Arrive by {reservation.until}</span></div><div className="reservation-code"><small>YOUR RESERVATION CODE</small><strong>{reservation.code}</strong></div><button className="modal-done" onClick={() => setReservation(null)}>Done <Icon name="arrow" size={16} /></button><p className="modal-footnote">This demo reservation is not a paid booking.</p></section></div>}
    </main>
  );
}
