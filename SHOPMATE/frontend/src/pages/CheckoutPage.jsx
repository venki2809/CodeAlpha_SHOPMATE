import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, LockKeyhole, MapPin, PackageCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import OrderSummary from '../components/OrderSummary';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import api, { getError } from '../services/api';
import { currency, getProductImage } from '../services/format';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, clearCart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [fields, setFields] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    street: user?.address || '', city: user?.city || '', state: '', postalCode: user?.postalCode || '' });
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    refreshCart().catch(err => { if (live) setError(getError(err)); }).finally(() => { if (live) setChecking(false); });
    return () => { live = false; };
  }, [refreshCart]);
  const update = event => setFields(previous => ({ ...previous, [event.target.name]: event.target.value }));
  const submit = async event => {
    event.preventDefault(); setError('');
    if (!items.length) return setError('Your bag is empty. Add something before checking out.');
    if (!/^[+\d\s()-]{7,20}$/.test(fields.phone.trim())) return setError('Enter a valid contact phone number.');
    if (!/^[A-Za-z\d -]{4,12}$/.test(fields.postalCode.trim())) return setError('Enter a valid postal code.');
    setBusy(true);
    try {
      const { data } = await api.post('/orders', {
        items: items.map(item => ({ productId: item._id, quantity: item.quantity })),
        shippingAddress: fields, paymentMethod: 'COD'
      });
      clearCart();
      navigate(`/order-success/${data.order._id}`, { replace: true, state: { order: data.order } });
    } catch (err) { setError(getError(err)); } finally { setBusy(false); }
  };
  return <div className="container checkout-page"><div className="breadcrumb"><Link to="/cart">Bag</Link><span>/</span> Checkout</div>
    <div className="page-heading"><span className="eyebrow">ALMOST THERE</span><h1>Checkout</h1><p>Just a few details and you're all set.</p></div>
    {checking ? <LoadingState label="Checking stock and pricing…"/> : !items.length ? <EmptyState title="Your bag is empty" description="Choose a few favorites before checking out."/> :
      <form onSubmit={submit} className="checkout-layout"><div className="checkout-form">
        <div className="checkout-block"><h2><span>01</span> Contact details</h2><div className="form form-grid">
          <label>Full name<input name="name" value={fields.name} onChange={update} autoComplete="name" maxLength={80} minLength={2} required/></label>
          <label>Email address<input name="email" type="email" value={fields.email} onChange={update} autoComplete="email" maxLength={254} required/></label>
          <label className="span-full">Phone number<input name="phone" type="tel" value={fields.phone} onChange={update} autoComplete="tel" placeholder="10-digit mobile number" maxLength={24} required/></label>
        </div></div>
        <div className="checkout-block"><h2><span>02</span> Delivery address</h2><div className="form form-grid">
          <label className="span-full">House, street and locality<input name="street" value={fields.street} onChange={update} autoComplete="street-address" placeholder="Flat / house number, street, area" minLength={5} maxLength={200} required/></label>
          <label>City<input name="city" value={fields.city} onChange={update} autoComplete="address-level2" minLength={2} maxLength={80} required/></label>
          <label>State<input name="state" value={fields.state} onChange={update} autoComplete="address-level1" minLength={2} maxLength={80} required/></label>
          <label>PIN / Postal code<input name="postalCode" value={fields.postalCode} onChange={update} autoComplete="postal-code" minLength={4} maxLength={12} required/></label>
        </div></div>
        <div className="checkout-block"><h2><span>03</span> Payment method</h2><div className="payment-option"><PackageCheck size={22}/><div><strong>Cash on Delivery</strong><small>Demo Cash on Delivery: order saved on the backend; no real payment or delivery.</small></div><span className="selected-radio" aria-label="Selected"/></div></div>
        {error && <div className="alert alert--error" role="alert">{error} {error.includes('stock') && 'Please review your cart before trying again.'}</div>}
        <button className="button button--dark button--full place-order" disabled={busy || checking} type="submit"><LockKeyhole size={17}/>{busy ? 'Placing your order…' : 'Place demo order · Cash on Delivery'}<ArrowRight size={18}/></button>
        <Link className="continue-shopping" to="/cart"><ArrowLeft size={16}/> Back to bag</Link>
      </div><aside className="checkout-aside"><div className="checkout-items"><h2>Your items <span>({items.length})</span></h2>{items.map(item => <div className="checkout-item" key={item._id}>
        <img src={getProductImage(item)} alt={item.name} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/image-fallback.svg'; }}/><div><strong>{item.name}</strong><small>Qty {item.quantity}</small></div><span>{currency(item.price * item.quantity)}</span>
      </div>)}</div><OrderSummary subtotal={subtotal} checkout/><div className="aside-message"><MapPin size={18}/> Delivery address confirmed when you place your order.</div></aside></form>}
  </div>;
}
