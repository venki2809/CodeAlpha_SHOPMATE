import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import api, { getError } from '../services/api';
import ProductGrid from '../components/ProductGrid';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const categories = ['All', 'Clothing', 'Shoes', 'Watches', 'Electronics', 'Accessories'];
export default function ShopPage() {
  const { category: slug } = useParams();
  const [query] = useSearchParams();
  const category = categories.find(cat => cat.toLowerCase() === slug) || 'All';
  const search = (query.get('search') || '').trim();
  const initialSort = query.get('sort') || 'latest';
  const offers = query.get('offers') === 'true';
  const newArrival = query.get('newArrival') === 'true';
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ products: [], pagination: { total: 0, pages: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { setPage(1); setSort(initialSort); }, [category, search, offers, newArrival, initialSort]);
  useEffect(() => {
    let live = true;
    setLoading(true); setError('');
    api.get('/products', { params: { category, search, sort, offers, newArrival, page, limit: 12 } })
      .then(({ data }) => { if (live) setResult(data); })
      .catch(err => { if (live) setError(getError(err)); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [category, search, sort, offers, newArrival, page]);

  let heading = category === 'All' ? 'The whole collection' : category;
  if (search) heading = `Results for “${search}”`;
  if (offers) heading = 'Special offers';
  if (newArrival) heading = 'New arrivals';

  return <div className="container catalog-page">
    <div className="breadcrumb"><Link to="/">Home</Link><ChevronRight size={13}/><span>{category === 'All' ? 'Shop' : category}</span></div>
    <div className="catalog-head"><span className="eyebrow">SHOPMATE / THE COLLECTION</span><h1>{heading}</h1><p>Practical favorites, carefully picked for the everyday.</p></div>
    <div className="catalog-layout">
      <aside className="catalog-sidebar"><div className="sidebar-heading"><SlidersHorizontal size={17}/> Categories</div>
        <nav aria-label="Product categories">{categories.map(cat => <Link key={cat} to={cat === 'All' ? '/shop' : `/category/${cat.toLowerCase()}`}
          className={`category-filter ${category === cat && !search && !offers && !newArrival ? 'selected' : ''}`}>{cat}<ChevronRight size={15}/></Link>)}</nav>
        <div className="sidebar-info"><strong>Find your everyday.</strong><p>A few better things. A lot more ways to make them yours.</p></div>
      </aside>
      <section className="catalog-main"><div className="catalog-toolbar"><span>{loading ? 'Finding products…' : `${result.pagination.total} products`}</span>
        <label>Sort by <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
          <option value="latest">Latest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="rating">Highest rated</option>
        </select></label></div>
        {loading ? <LoadingState/> : error ? <div className="alert alert--error" role="alert">{error}</div>
          : result.products.length ? <><ProductGrid products={result.products}/>{result.pagination.pages > 1 && <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button><span>Page {page} of {result.pagination.pages}</span>
            <button disabled={page >= result.pagination.pages} onClick={() => setPage(p => p + 1)}>Next</button></div>}</>
            : <EmptyState title="Nothing here just yet" description="Try another category or a different search term."/>}
      </section>
    </div>
  </div>;
}
