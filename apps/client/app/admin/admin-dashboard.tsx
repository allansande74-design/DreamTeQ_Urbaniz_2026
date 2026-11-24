"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Spot = { id: string; name: string; address: string; latitude: number; longitude: number; hourly_rate: number; available: number; capacity: number; type: string; features: string[]; is_active: boolean; updated_at: string };
type Reservation = { id: string; spot_id: string; status: string; created_at: string; expires_at: string };
type Dashboard = { spots: Spot[]; reservations: Reservation[]; metrics: { locations: number; activeLocations: number; availableSpaces: number; activeReservations: number; recentReservations: number }; fetchedAt: string };

export default function AdminDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ name: "", address: "", latitude: "", longitude: "", hourlyRate: "", capacity: "", type: "Garage", features: "" });

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin", { cache: "no-store" });
      const result = await response.json() as Dashboard & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Dashboard could not be loaded.");
      setData(result);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load dashboard."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  async function createSpot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setNotice(""); setError("");
    const payload = { name: form.name, address: form.address, latitude: Number(form.latitude), longitude: Number(form.longitude), hourlyRate: Number(form.hourlyRate), capacity: Number(form.capacity), type: form.type, features: form.features.split(",").map((item) => item.trim()).filter(Boolean) };
    try {
      const response = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Location could not be created.");
      setForm({ name: "", address: "", latitude: "", longitude: "", hourlyRate: "", capacity: "", type: "Garage", features: "" });
      setNotice("Parking location added.");
      await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save location."); }
    finally { setSaving(false); }
  }

  async function toggleActive(spot: Spot) {
    setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: spot.id, name: spot.name, address: spot.address, latitude: spot.latitude, longitude: spot.longitude, hourlyRate: Number(spot.hourly_rate), capacity: spot.capacity, type: spot.type, features: spot.features, isActive: !spot.is_active }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not update location.");
      setNotice(`${spot.name} ${spot.is_active ? "paused" : "activated"}.`);
      await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to update location."); }
  }

  async function signOut() { await fetch("/api/auth/signout", { method: "POST" }).catch(() => undefined); window.location.assign("/signin"); }

  return <main className="admin-shell"><aside className="admin-sidebar"><Link className="brand" href="/"><span className="brand-icon">U</span>urbaniz<span className="brand-period">.</span></Link><p className="sidebar-label">WORKSPACE</p><a className="sidebar-current" href="#overview">▦ <span>Overview</span></a><a href="#inventory">▣ <span>Parking inventory</span></a><a href="#reservations">▤ <span>Reservations</span></a><div className="sidebar-bottom"><span className="admin-indicator" /> Operations console <button onClick={() => void signOut()}>Sign out</button></div></aside>
    <section className="admin-main"><header className="admin-header"><div><p className="admin-breadcrumb">URBANIZ <span>/</span> OPERATIONS</p><h1>Platform overview</h1></div><div className="admin-header-actions"><span className="admin-role">ADMIN</span><button onClick={() => void refresh()} disabled={loading}>{loading ? "Refreshing…" : "↻ Refresh"}</button></div></header>
      {error && <div className="admin-alert" role="alert">{error}{error.includes("Sign in") && <Link href="/signin?next=%2Fadmin"> Sign in</Link>}</div>}{notice && <div className="admin-notice" role="status">{notice}</div>}
      <div id="overview" className="admin-metrics">{[{ label: "Active locations", value: data?.metrics.activeLocations, detail: `${data?.metrics.locations ?? 0} total locations`, icon: "⌖" }, { label: "Spaces available", value: data?.metrics.availableSpaces, detail: "Across active inventory", icon: "P" }, { label: "Active reservations", value: data?.metrics.activeReservations, detail: "Current unexpired holds", icon: "◷" }, { label: "Recent reservations", value: data?.metrics.recentReservations, detail: "Latest 100 records", icon: "▤" }].map((metric) => <article className="admin-metric" key={metric.label}><span className="metric-icon">{metric.icon}</span><p>{metric.label}</p><strong>{loading && !data ? "—" : metric.value ?? 0}</strong><small>{metric.detail}</small></article>)}</div>
      <div className="admin-grid"><section className="admin-card inventory-card" id="inventory"><div className="admin-card-heading"><div><p className="admin-breadcrumb">SUPPLY MANAGEMENT</p><h2>Parking inventory</h2></div><span className="table-count">{data?.spots.length ?? 0} locations</span></div><div className="admin-table-wrap"><table><thead><tr><th>LOCATION</th><th>RATE / HR</th><th>AVAILABLE</th><th>STATUS</th><th /></tr></thead><tbody>{data?.spots.map((spot) => <tr key={spot.id}><td><strong>{spot.name}</strong><small>{spot.address}</small></td><td>${Number(spot.hourly_rate).toFixed(2)}</td><td>{spot.available} / {spot.capacity}</td><td><span className={spot.is_active ? "pill-active" : "pill-paused"}>{spot.is_active ? "Active" : "Paused"}</span></td><td><button className="row-action" onClick={() => void toggleActive(spot)}>{spot.is_active ? "Pause" : "Activate"}</button></td></tr>)}</tbody></table>{!loading && !data?.spots.length && <p className="admin-empty">No parking locations configured. Add a verified operator location below.</p>}</div></section>
      <section className="admin-card create-card"><div className="admin-card-heading"><div><p className="admin-breadcrumb">OPERATOR SUPPLY</p><h2>Add location</h2></div><span className="create-icon">＋</span></div><form onSubmit={createSpot}><label>Location name<input required minLength={2} maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Central Garage" /></label><label>Street address<input required minLength={2} maxLength={240} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Street, city, postal code" /></label><div className="form-two"><label>Latitude<input required type="number" step="any" min="-90" max="90" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} placeholder="37.7754" /></label><label>Longitude<input required type="number" step="any" min="-180" max="180" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} placeholder="-122.4194" /></label></div><div className="form-two"><label>Hourly rate ($)<input required type="number" step="0.01" min="0" max="10000" value={form.hourlyRate} onChange={(event) => setForm({ ...form, hourlyRate: event.target.value })} placeholder="4.50" /></label><label>Capacity<input required type="number" step="1" min="0" max="100000" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} placeholder="100" /></label></div><div className="form-two"><label>Parking type<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option>Garage</option><option>Lot</option><option>Street</option></select></label><label>Features<input value={form.features} onChange={(event) => setForm({ ...form, features: event.target.value })} placeholder="Covered, EV charging" /></label></div><p className="form-hint">Only add locations and coordinates verified with the operator.</p><button className="create-submit" disabled={saving}>{saving ? "Saving…" : "Add parking location"}</button></form></section>
      <section className="admin-card reservations-card" id="reservations"><div className="admin-card-heading"><div><p className="admin-breadcrumb">CUSTOMER ACTIVITY</p><h2>Recent reservations</h2></div><span className="table-count">Latest 100</span></div><div className="admin-table-wrap"><table><thead><tr><th>RESERVATION</th><th>LOCATION ID</th><th>STATUS</th><th>CREATED</th><th>EXPIRES</th></tr></thead><tbody>{data?.reservations.map((item) => <tr key={item.id}><td><strong>{item.id.slice(0, 8).toUpperCase()}</strong></td><td><code>{item.spot_id.slice(0, 8)}</code></td><td><span className={item.status === "held" && Date.parse(item.expires_at) > Date.now() ? "pill-active" : "pill-paused"}>{item.status}</span></td><td>{new Date(item.created_at).toLocaleString()}</td><td>{new Date(item.expires_at).toLocaleString()}</td></tr>)}</tbody></table>{!loading && !data?.reservations.length && <p className="admin-empty">No reservations yet. Reservation activity will appear here.</p>}</div></section></div>
      <footer className="admin-footer"><span>Inventory and reservations from the configured operations database.</span><span>{data ? `Last refreshed ${new Date(data.fetchedAt).toLocaleTimeString()}` : "Waiting for data"}</span></footer>
    </section></main>;
}
