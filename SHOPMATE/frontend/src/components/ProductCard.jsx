import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Plus, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { currency, getProductImage } from '../services/format';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const add = () => {
    if (addItem(product)) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1700);
    }
  };
  return <article className="product-card">
    <div className="product-photo">
      <Link to={`/product/${product.slug}`} aria-label={`View ${product.name}`}><img loading="lazy" src={getProductImage(product)} alt={product.name} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/image-fallback.svg'; }}/></Link>
      {product.isNew && <span className="product-tag">NEW</span>}
      {!product.isNew && product.isOffer && <span className="product-tag">GOOD DEAL</span>}
      <button onClick={add} disabled={product.stock < 1} className={`quick-add ${added ? 'quick-add--added' : ''}`} aria-label={product.stock > 0 ? `Add ${product.name} to cart` : `${product.name} out of stock`} title={product.stock > 0 ? 'Add to bag' : 'Out of stock'}>
        {added ? <Check size={20}/> : <Plus size={20}/>}
      </button>
    </div>
    <div className="product-meta"><span>{product.category}</span><span className="rating"><Star size={13} fill="currentColor"/> {Number(product.rating).toFixed(1)}</span></div>
    <Link to={`/product/${product.slug}`} className="product-title">{product.name}</Link>
    <div className="product-price"><strong>{currency(product.price)}</strong>{product.originalPrice > product.price && <del>{currency(product.originalPrice)}</del>}</div>
  </article>;
}
