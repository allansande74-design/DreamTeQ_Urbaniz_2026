import Link from "next/link";

export default function PoliciesPage() {
  return (
    <main>
      <header className="nav-shell"><Link className="brand" href="/"><span>U</span> urbaniz.</Link><Link className="back-link" href="/">← Back to Urbaniz</Link></header>
      <section className="content-page">
        <p className="eyebrow">LEGAL AND PLATFORM POLICIES</p>
        <h1>Clear terms for a trusted network.</h1>
        <p className="hero-lede">The documents below describe the Phase 0 information architecture. They are placeholders and must be reviewed and finalized for Kenya and the jurisdictions where Urbaniz operates.</p>
        <div className="policy-list">
          <article id="terms"><h2>Terms and conditions</h2><p>Rules for drivers, hosts, operators, partners and platform use, including booking, access, cancellation and liability responsibilities.</p></article>
          <article id="privacy"><h2>Privacy notice</h2><p>How account, location, booking, document and support information is collected, used, retained and protected.</p></article>
          <article><h2>Parking partner agreement</h2><p>Terms for location authority, capacity, availability, operating requirements, fees, insurance, data and termination.</p></article>
          <article><h2>Scout and field operations policy</h2><p>Verification standards, safety procedures, approved communications, data collection and compensation principles.</p></article>
          <article><h2>Cancellation and refund policy</h2><p>Booking eligibility, cancellation timing, exceptions, refunds and unresolved operator incidents.</p></article>
          <article><h2>Acceptable use and prohibited activity</h2><p>Rules for fraud prevention, misuse, unsafe conduct, unauthorised access and data or payment abuse.</p></article>
        </div>
      </section>
    </main>
  );
}
