import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowRight, Check, PackageCheck } from 'lucide-react';
import api, { getError } from '../services/api';
import LoadingState from '../components/LoadingState';
import { currency } from '../services/format';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order?._id === id ? location.state.order : null);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(!order);
  useEffect(() => {
    if (order?._id === id) return;
    let live = true;
    api.get(`/orders/${id}`).then(({ data }) => { if (live) setOrder(data.order); })
      .catch(err => { if (live) setError(getError(err)); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [id, order]);
  if (loading) return <LoadingState label="Retrieving your order…"/>;
  if (error || !order) return <div className="container detail-missing"><h1>Order not available</h1><p>{error || 'Order not found.'}</p><Link className="button button--dark" to="/profile">Go to my orders</Link></div>;
  return <div className="container success-page"><div className="success-icon"><Check size={31}/></div>
    <span className="eyebrow">DEMO ORDER SAVED</span><h1>Thanks for shopping with us.</h1><p>Your demo order is saved by the SHOPMATE backend. No real purchase or delivery has been arranged.</p>
    <div className="success-receipt"><div className="receipt-head"><PackageCheck size={24}/><div><strong>Order placed</strong><span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div></div>
      <div className="receipt-line"><span>Order number</span><strong>#{order._id.slice(-8).toUpperCase()}</strong></div>
      <div className="receipt-line"><span>Items</span><strong>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
      <div className="receipt-line"><span>Payment</span><strong>Cash on Delivery</strong></div>
      <div className="receipt-line"><span>Status</span><strong>{order.status}</strong></div>
      <div className="receipt-line receipt-total"><span>Order total</span><strong>{currency(order.total)}</strong></div></div>
    <div className="success-buttons"><Link className="button button--dark" to="/profile">View my orders <ArrowRight size={18}/></Link><Link className="button button--outline" to="/shop">Keep shopping</Link></div>
  </div>;
}
