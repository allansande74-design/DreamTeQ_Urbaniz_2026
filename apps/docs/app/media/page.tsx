import Link from "next/link";

export default function MediaPage() {
  const items = [
    ["Company profile", "About Urbaniz, the Nairobi pilot, and our approach to verified parking operations."],
    ["Brand assets", "Approved logo, colour, typography and imagery guidance for current and future partners."],
    ["Press enquiries", "Interview requests, media statements, launch announcements and commercial partnership information."],
    ["Product resources", "Original diagrams and presentations covering our parking marketplace and smart-site model."],
  ];
  return (
    <main>
      <header className="nav-shell"><Link className="brand" href="/"><span>U</span> urbaniz.</Link><Link className="back-link" href="/">← Back to Urbaniz</Link></header>
      <section className="content-page">
        <p className="eyebrow">MEDIA RESOURCES</p>
        <h1>Urbaniz news and brand resources.</h1>
        <p className="hero-lede">Original information for journalists, partners and contributors. Live brand assets and approved claims should be confirmed by the Urbaniz team before publication.</p>
        <div className="content-grid">{items.map(([title, copy]) => <article className="content-card" key={title}><h2>{title}</h2><p>{copy}</p></article>)}</div>
        <p style={{marginTop:32}}><a className="primary" href="mailto:media@urbaniz.city">Request media materials</a></p>
      </section>
    </main>
  );
}
