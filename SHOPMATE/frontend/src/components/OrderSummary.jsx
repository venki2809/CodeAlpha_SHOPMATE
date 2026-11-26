import { Link } from 'react-router-dom';
import { currency, shippingFor } from '../services/format';
export default function OrderSummary({ subtotal, checkout = false, disabled = false }) {
  const shipping = shippingFor(subtotal);
  return <aside className="order-summary">
    <h2>Order summary</h2>
    <div className="summary-line"><span>Subtotal</span><strong>{currency(subtotal)}</strong></div>
    <div className="summary-line"><span>Shipping</span><strong>{subtotal >= 2999 ? 'Free' : currency(shipping)}</strong></div>
    <div className="summary-line summary-total"><span>Total</span><strong>{currency(subtotal + shipping)}</strong></div>
    {!checkout && (disabled ? <button className="button button--dark button--full" disabled type="button">Continue to checkout</button> : <Link to="/checkout" className="button button--dark button--full">Continue to checkout</Link>)}
    <p className="summary-note">{subtotal >= 2999 ? 'You unlocked free standard shipping.' : `Add ${currency(2999 - subtotal)} more for free standard shipping.`}</p>
    <p className="summary-note">Demo checkout only: no money is charged and nothing is shipped.</p>
  </aside>;
}
