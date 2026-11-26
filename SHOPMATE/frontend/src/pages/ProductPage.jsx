import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, Minus, Plus, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react';
import api, { getError } from '../services/api';
import { useCart } from '../context/CartContext';
import { currency, getProductImage } from '../services/format';
import ProductGrid from '../components/ProductGrid';
import LoadingState from '../components/LoadingState';

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addItem } = useCart();
  useEffect(() => {
    let live = true;
    setLoading(true); setError(''); setQuantity(1); setAdded(false);
    api.get(`/products/${slug}`).then(async ({ data }) => {
      if (!live) return;
      setProduct(data.product);
      setActiveImage(getProductImage(data.product));
      try {
        const relatedResponse = await api.get('/products', { params: { category: data.product.category, limit: 6 } });
        if (live) setRelated(relatedResponse.data.products.filter(item => item._id !== data.product._id).slice(0, 4));
      } catch { if (live) setRelated([]); }
    }).catch(err => { if (live) { setProduct(null); setError(getError(err)); } })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [slug]);

  if (loading) return <LoadingState label="Loading product details…"/>;
  if (error || !product) return <div className="container detail-missing"><h1>We couldn't find this item.</h1><p>{error || 'Product not found.'}</p><Link to="/shop" className="button button--dark">Browse products</Link></div>;
  const gallery = [...new Set([product.image, ...(product.images || [])].filter(Boolean))];
  const available = product.stock > 0;
  const add = () => { if (addItem(product, quantity)) setAdded(true); };
  return <div className="container product-detail-page">
    <div className="breadcrumb"><Link to="/">Home</Link><ChevronRight size={13}/><Link to={`/category/${product.category.toLowerCase()}`}>{product.category}</Link><ChevronRight size={13}/><span>{product.name}</span></div>
    <div className="product-detail-layout"><div className="detail-gallery">
      <div className="detail-primary-image"><img src={activeImage} alt={product.name} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/image-fallback.svg'; }}/></div>
      {gallery.length > 1 && <div className="detail-thumbnails">{gallery.map((image, i) => <button key={image} aria-label={`Show image ${i + 1}`} className={activeImage === image ? 'is-active' : ''} onClick={() => setActiveImage(image)}><img src={image} alt=""/></button>)}</div>}
    </div><div className="detail-copy"><Link className="back-link" to="/shop"><ArrowLeft size={15}/> Back to shop</Link>
      <div className="eyebrow">{product.category.toUpperCase()} / SHOPMATE EDIT</div><h1>{product.name}</h1>
      <div className="detail-rating"><Star size={16} fill="currentColor"/> {Number(product.rating).toFixed(1)} <span>({product.reviewCount} ratings in sample catalog)</span></div>
      <div className="detail-prices"><strong>{currency(product.price)}</strong>{product.originalPrice > product.price && <del>{currency(product.originalPrice)}</del>}
        {product.originalPrice > product.price && <span className="discount-label">SAVE {Math.round((1 - product.price / product.originalPrice) * 100)}%</span>}</div>
      <div className="divider"/><p className="detail-description">{product.description}</p>
      <div className={`stock-status ${available ? '' : 'stock-status--out'}`}><span/> {available ? (product.stock <= 5 ? `Only ${product.stock} left in stock` : 'In stock and ready to ship') : 'Currently out of stock'}</div>
      <div className="detail-purchase"><div className="quantity-stepper"><button disabled={!available || quantity === 1} onClick={() => { setQuantity(q => q - 1); setAdded(false); }} aria-label="Decrease quantity"><Minus size={16}/></button><span>{quantity}</span><button disabled={!available || quantity >= Math.min(product.stock, 10)} onClick={() => { setQuantity(q => q + 1); setAdded(false); }} aria-label="Increase quantity"><Plus size={16}/></button></div>
        <button className="button button--dark add-to-bag" onClick={add} disabled={!available}>{added ? <Check size={19}/> : <ShoppingBag size={19}/>} {available ? (added ? 'Added to bag' : 'Add to bag') : 'Sold out'}</button></div>
      {added && <p className="inline-success">Great choice! <Link to="/cart">View your bag</Link></p>}
      <div className="detail-highlights"><h3>The details</h3><ul>{product.details?.map(item => <li key={item}><Check size={15}/>{item}</li>)}</ul></div>
      <div className="detail-perks"><div><Truck size={19}/><span>Free shipping over ₹2,999</span></div><div><ShieldCheck size={19}/><span>Interactive demo checkout; no real payment</span></div></div>
    </div></div>
    {related.length > 0 && <section className="section related-section"><div className="section-heading"><div><span className="eyebrow">A GOOD PAIRING</span><h2>You might also like</h2></div><Link className="text-link" to={`/category/${product.category.toLowerCase()}`}>Explore {product.category.toLowerCase()} <ChevronRight size={18}/></Link></div><ProductGrid products={related}/></section>}
  </div>;
}
