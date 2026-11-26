import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import OrderSummary from '../components/OrderSummary';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { currency, getProductImage } from '../services/format';
import { getError } from '../services/api';

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, refreshCart } = useCart();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    refreshCart().catch(err => { if (live) setError(getError(err)); }).finally(() => { if (live) setChecking(false); });
    return () => { live = false; };
  }, [refreshCart]);
  return <div className="container cart-page"><div className="breadcrumb"><Link to="/">Home</Link><span>/</span> Your bag</div>
    <div className="page-heading"><span className="eyebrow">THE GOOD STUFF</span><h1>Your shopping bag <span>({items.length})</span></h1></div>
    {checking ? <LoadingState label="Checking your bag…"/> : !items.length ? <EmptyState title="Your bag is a little quiet." description="Discover something worth bringing home."/>
      : <><div className="cart-layout"><div className="cart-items"><div className="cart-items-header"><span>PRODUCT</span><span>QUANTITY</span><span>TOTAL</span></div>
        {items.map(item => <div className="cart-item" key={item._id}>
          <Link to={`/product/${item.slug}`} className="cart-item-image"><img src={getProductImage(item)} alt={item.name} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/image-fallback.svg'; }}/></Link>
          <div className="cart-item-info"><span className="eyebrow">{item.category}</span><Link to={`/product/${item.slug}`}>{item.name}</Link><span>{currency(item.price)}</span><button className="remove-item" onClick={() => removeItem(item._id)}><Trash2 size={15}/> Remove</button></div>
          <div className="quantity-stepper cart-quantity"><button aria-label={`Decrease ${item.name}`} disabled={item.quantity <= 1} onClick={() => updateQuantity(item._id, item.quantity - 1)}><Minus size={15}/></button><span>{item.quantity}</span><button aria-label={`Increase ${item.name}`} disabled={item.quantity >= Math.min(item.stock, 10)} onClick={() => updateQuantity(item._id, item.quantity + 1)}><Plus size={15}/></button></div>
          <strong className="cart-line-total">{currency(item.price * item.quantity)}</strong>
        </div>)}
        <Link className="continue-shopping" to="/shop"><ArrowLeft size={17}/> Continue shopping</Link></div><OrderSummary subtotal={subtotal} disabled={Boolean(error)}/></div></>}
    {error && <div className="alert alert--error" role="alert">{error} Your cart could not be checked against live stock. <button className="text-button" onClick={() => window.location.reload()}>Retry</button></div>}
  </div>;
}
