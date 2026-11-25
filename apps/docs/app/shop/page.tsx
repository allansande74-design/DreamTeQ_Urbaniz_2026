import Link from "next/link";

const products = [
  ["P", "Urbaniz Parking Kit", "KES 2,500", "Pilot signage and driver guidance starter pack"],
  ["S", "Scout Field Pack", "KES 4,800", "Checklist, field cards and safety essentials"],
  ["B", "Operator Starter Pack", "KES 6,500", "Core materials for authorised parking operators"],
];

export default function ShopPage() {
  return (
    <main>
      <header className="nav-shell"><Link className="brand" href="/"><span>U</span> urbaniz.</Link><Link className="back-link" href="/">← Back to Urbaniz</Link></header>
      <section className="content-page">
        <p className="eyebrow">URBANIZ SHOP</p>
        <h1>Tools for the Urbaniz network.</h1>
        <p className="hero-lede">A simple catalogue for operational materials. Payment and fulfilment will be enabled after approved commercial terms and logistics are configured.</p>
        <div className="shop-grid">{products.map(([icon, name, price, copy]) => <article className="product" key={name}><div className="product-art">{icon}</div><strong>{name}</strong><p>{copy}</p><span>{price}</span></article>)}</div>
      </section>
    </main>
  );
}
