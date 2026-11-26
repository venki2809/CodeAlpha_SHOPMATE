import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import api, { getError } from '../services/api';
import ProductGrid from '../components/ProductGrid';
import LoadingState from '../components/LoadingState';

const categories = [
  { name: 'Clothing', image: 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=600&q=80' },
  { name: 'Shoes', image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=600&q=80' },
  { name: 'Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80' },
  { name: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80' }
];

function Collection({ eyebrow, title, products, link }) {
  if (!products.length) return null;
  return <section className="section container">
    <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><Link className="text-link" to={link}>View all <ArrowRight size={18}/></Link></div>
    <ProductGrid products={products}/>
  </section>;
}

export default function HomePage() {
  const [collections, setCollections] = useState({ featured: [], fresh: [], offers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    Promise.all([
      api.get('/products', { params: { featured: true, limit: 4 } }),
      api.get('/products', { params: { newArrival: true, limit: 4 } }),
      api.get('/products', { params: { offers: true, limit: 4 } })
    ]).then(([featured, fresh, offers]) => {
      if (live) setCollections({ featured: featured.data.products, fresh: fresh.data.products, offers: offers.data.products });
    }).catch(err => { if (live) setError(getError(err)); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  return <>
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-copy"><span className="eyebrow hero-eyebrow">THE EVERYDAY EDIT · 2026</span>
          <h1>Good things.<br/><em>Every day.</em></h1>
          <p>Better basics, fresh finds and considered details. Discover the pieces that make everyday life feel a little more yours.</p>
          <Link className="button button--dark" to="/shop">Explore the collection <ArrowUpRight size={18}/></Link>
          <div className="hero-footnote"><span className="hero-footnote-line"/> CURATED FOR REAL LIFE</div>
        </div>
        <div className="hero-image"><img onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/image-fallback.svg'; }} src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1450&q=90" alt="Warmly lit contemporary clothing shop with a considered selection of everyday essentials"/>
          <div className="hero-image-caption"><span>YOUR STYLE, YOUR WAY</span><span>01 / 05</span></div>
        </div>
      </div>
    </section>

    <div className="container benefits"><div><Truck size={23}/><span><strong>Free shipping</strong><small>On orders ₹2,999 and above</small></span></div>
      <div><ShieldCheck size={23}/><span><strong>Secure shopping</strong><small>Server-backed demo login</small></span></div>
      <div><RotateCcw size={23}/><span><strong>Easy browsing</strong><small>Thoughtfully chosen products</small></span></div></div>

    <section className="section container category-section"><div className="section-heading"><div><span className="eyebrow">A LITTLE OF EVERYTHING</span><h2>Shop by category</h2></div><p>Find what feels like you.</p></div>
      <div className="category-grid">{categories.map(cat => <Link className="category-tile" key={cat.name} to={`/category/${cat.name.toLowerCase()}`}>
        <div className="category-image"><img loading="lazy" src={cat.image} alt={cat.name} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/image-fallback.svg'; }}/></div>
        <span>{cat.name}<ArrowUpRight size={18}/></span></Link>)}</div></section>

    {loading ? <LoadingState label="Finding the good stuff…"/> : error ? <div className="container alert alert--error" role="alert">{error} Try reloading the page.</div> : <>
      <Collection eyebrow="THE MOST-LOVED" title="Trending right now" products={collections.featured} link="/shop?sort=rating"/>
      <section className="feature-banner container"><div className="feature-banner-image"><img loading="lazy" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/image-fallback.svg'; }} src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85" alt="Contemporary casual fashion collection"/></div>
        <div className="feature-banner-copy"><span className="eyebrow">A FRESH PERSPECTIVE</span><h2>Less ordinary.<br/>More you.</h2><p>Elevated pieces for the plans you make and the days you don't.</p><Link className="button button--light" to="/category/clothing">Shop clothing <ArrowRight size={18}/></Link></div></section>
      <Collection eyebrow="FRESHLY ADDED" title="New to the lineup" products={collections.fresh} link="/shop?newArrival=true"/>
      <Collection eyebrow="A LITTLE EXTRA VALUE" title="Worth a second look" products={collections.offers} link="/shop?offers=true"/>
    </>}
    <section className="newsletter-strip"><div className="container newsletter-inner"><div><span className="eyebrow">STAY CURIOUS</span><h2>Great finds start here.</h2><p>Discover more thoughtfully chosen everyday essentials.</p></div><Link to="/shop" className="button button--dark">Browse everything <ArrowRight size={18}/></Link></div></section>
  </>;
}
