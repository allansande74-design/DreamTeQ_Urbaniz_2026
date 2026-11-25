import Link from "next/link";

export default function ContactPage() {
  return (
    <main>
      <header className="nav-shell"><Link className="brand" href="/"><span>U</span> urbaniz.</Link><Link className="back-link" href="/">← Back to Urbaniz</Link></header>
      <section className="content-page">
        <p className="eyebrow">CONTACT URBANIZ</p>
        <h1>Tell us how you want to work with us.</h1>
        <p className="hero-lede">Choose the relevant pathway and our team will guide you through the next step. Do not submit identity or payment information through this prototype.</p>
        <div className="content-grid">
          <article className="content-card"><h2>Customer support</h2><p>Bookings, access, cancellations and general account questions.</p><p><a href="mailto:support@urbaniz.city">support@urbaniz.city</a></p></article>
          <article className="content-card"><h2>Partner and host enquiries</h2><p>Landlords, operators, malls, events and corporate parking supply.</p><p><a href="mailto:partners@urbaniz.city">partners@urbaniz.city</a></p></article>
          <article className="content-card"><h2>Media and trading partners</h2><p>Press, technology, infrastructure and commercial collaborations.</p><p><a href="mailto:hello@urbaniz.city">hello@urbaniz.city</a></p></article>
        </div>
        <form className="contact-form" style={{marginTop:36}}>
          <label>Full name<input name="name" required placeholder="Your name" /></label>
          <label>Email address<input name="email" type="email" required placeholder="you@example.com" /></label>
          <label>I am interested in<select name="interest" defaultValue=""><option value="" disabled>Select a pathway</option><option>Finding parking</option><option>Listing parking</option><option>Business partnership</option><option>Field scouting</option><option>Media enquiry</option><option>Other</option></select></label>
          <label>Message<textarea name="message" required placeholder="Tell us about your location or enquiry" /></label>
          <button className="primary" type="button">Submit prototype enquiry</button>
        </form>
      </section>
    </main>
  );
}
