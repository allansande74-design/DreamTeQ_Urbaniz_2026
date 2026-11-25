import Link from "next/link";

const nav = [
  ["Parking", "/#parking"],
  ["For hosts", "/#hosts"],
  ["For business", "/#business"],
  ["Media", "/media"],
  ["Shop", "/shop"],
  ["Contact", "/contact"],
];

export default function Home() {
  return (
    <main>
      <header className="nav-shell">
        <Link className="brand" href="/" aria-label="Urbaniz home"><span>U</span> urbaniz.</Link>
        <nav aria-label="Primary navigation">
          {nav.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
        </nav>
        <a className="nav-action" href="http://localhost:3000">Find parking <span>↗</span></a>
      </header>

      <section className="hero" id="parking">
        <div className="hero-copy">
          <p className="eyebrow">NAIROBI PARKING NETWORK</p>
          <h1>Find the right spot.<br/><em>Arrive with confidence.</em></h1>
          <p className="hero-lede">Search, compare and reserve verified parking across the city—hourly, daily, monthly and for special events.</p>
          <div className="hero-actions"><a className="primary" href="http://localhost:3000">Find parking</a><a className="secondary" href="#hosts">List your space</a></div>
          <div className="trust-row"><span><b>Verified</b> locations</span><span><b>Clear</b> pricing</span><span><b>Human</b> support</span></div>
        </div>
        <div className="map-card" aria-label="Illustrative parking map">
          <div className="map-grid" />
          <div className="route route-one" /><div className="route route-two" />
          <span className="pin pin-a">P</span><span className="pin pin-b">P</span><span className="pin pin-c">P</span>
          <div className="map-panel"><small>NEARBY</small><strong>Westlands</strong><p>Verified parking</p></div>
        </div>
      </section>

      <section className="proof-strip" aria-label="Platform principles">
        <div><strong>Book</strong><span>Choose by destination and time</span></div>
        <div><strong>Navigate</strong><span>Find the correct entrance</span></div>
        <div><strong>Park</strong><span>Check in with clear access details</span></div>
        <div><strong>Manage</strong><span>Handle bookings and support</span></div>
      </section>

      <section className="section" id="hosts">
        <div className="section-heading"><p class="eyebrow">FOR SPACE OWNERS</p><h2>Put unused parking to work.</h2></div>
        <div className="host-grid">
          <article><span>01</span><h3>Add your space</h3><p>Tell us where it is, what vehicles fit and how drivers should arrive.</p></article>
          <article><span>02</span><h3>Set your terms</h3><p>Choose availability, access rules and pricing through a transparent agreement.</p></article>
          <article><span>03</span><h3>Go live</h3><p>After verification and human approval, your space can receive bookings.</p></article>
        </div>
        <a className="text-link" href="/contact">Start onboarding →</a>
      </section>

      <section className="section business" id="business">
        <div className="business-copy"><p className="eyebrow">URBANIZ FOR BUSINESS</p><h2>One network for complex parking operations.</h2><p>Designed for landlords, garages, malls, transport hubs, hotels, event venues, local authorities and fleet operators.</p><a className="primary light" href="/contact">Talk to our team</a></div>
        <div className="feature-list">
          <article><b>01</b><div><h3>Multi-location operations</h3><p>Inventory, bookings and partner status in one workspace.</p></div></article>
          <article><b>02</b><div><h3>Operational reporting</h3><p>Measure occupancy, demand, revenue and exceptions.</p></div></article>
          <article><b>03</b><div><h3>Connected infrastructure</h3><p>Prepare for sensors, entry systems and access-controlled sites.</p></div></article>
        </div>
      </section>

      <footer>
        <div><Link className="brand footer-brand" href="/"><span>U</span> urbaniz.</Link><p>Smarter parking, better cities.</p></div>
        <div><b>Platform</b><Link href="http://localhost:3000">Find parking</Link><Link href="#hosts">Rent your space</Link><Link href="#business">Business</Link></div>
        <div><b>Company</b><Link href="/media">Media resources</Link><Link href="/shop">Shop</Link><Link href="/contact">Contact</Link></div>
        <div><b>Legal</b><Link href="/policies">Policies</Link><Link href="/policies#terms">Terms</Link><Link href="/policies#privacy">Privacy</Link></div>
      </footer>
    </main>
  );
}
