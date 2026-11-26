import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LogOut, Package, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { getError } from '../services/api';
import { currency } from '../services/format';
import LoadingState from '../components/LoadingState';

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '', city: user?.city || '', postalCode: user?.postalCode || '' });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false); const [notice, setNotice] = useState(''); const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    api.get('/orders').then(({ data }) => { if (live) setOrders(data.orders); })
      .catch(err => { if (live) setError(getError(err)); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);
  const save = async event => {
    event.preventDefault(); setNotice(''); setError(''); setBusy(true);
    try { await updateProfile(form); setNotice('Your profile has been updated.'); }
    catch (err) { setError(getError(err)); } finally { setBusy(false); }
  };
  const update = event => setForm(previous => ({ ...previous, [event.target.name]: event.target.value }));
  const signOut = () => { logout(); navigate('/'); };
  return <div className="container profile-page"><div className="breadcrumb"><Link to="/">Home</Link><span>/</span> Account</div>
    <div className="page-heading"><span className="eyebrow">WELCOME BACK</span><h1>My account</h1><p>Everything you need, in one place.</p></div>
    <div className="profile-top"><div className="profile-avatar"><UserRound size={26}/></div><div><strong>{user.name}</strong><span>{user.email}</span></div><button className="button button--outline signout-button" onClick={signOut}><LogOut size={17}/> Sign out</button></div>
    <div className="profile-layout"><section className="profile-block"><div className="block-heading"><UserRound size={20}/><h2>Personal details</h2></div>
      <form className="form" onSubmit={save}><label>Full name<input name="name" value={form.name} onChange={update} minLength={2} maxLength={80} required/></label>
        <label>Email address<input value={user.email} disabled readOnly/><small>Your login email cannot be changed from this page.</small></label>
        <label>Phone number<input name="phone" type="tel" value={form.phone} onChange={update} maxLength={20} placeholder="Phone number"/></label>
        <label>Address<input name="address" value={form.address} onChange={update} maxLength={200} placeholder="Street address"/></label>
        <div className="form-grid"><label>City<input name="city" value={form.city} onChange={update} maxLength={80} placeholder="City"/></label>
          <label>PIN / Postal code<input name="postalCode" value={form.postalCode} onChange={update} maxLength={80} placeholder="PIN code"/></label></div>
        {notice && <div className="alert alert--success" role="status">{notice}</div>}
        <button type="submit" className="button button--dark" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
      </form></section>
      <section className="profile-block"><div className="block-heading"><Package size={21}/><h2>Recent orders</h2></div>
        {loading ? <LoadingState compact label="Loading orders…"/> : !orders.length ? <div className="orders-empty"><Package size={30}/><h3>Nothing ordered yet.</h3><p>Your future favorites will appear here.</p><Link to="/shop" className="text-link">Start browsing <ArrowRight size={17}/></Link></div>
          : <div className="orders-list">{orders.map(order => <div className="order-row" key={order._id}>
            <div><strong>Order #{order._id.slice(-8).toUpperCase()}</strong><span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {order.items.length} product(s)</span>
              <small>{order.items.map(item => `${item.name} × ${item.quantity}`).join(' · ')}</small></div>
            <div className="order-row-side"><strong>{currency(order.total)}</strong><span className="order-status">{order.status}</span><Link to={`/order-success/${order._id}`}>View details <ArrowRight size={14}/></Link></div>
          </div>)}</div>}
      </section></div>
    {error && <div className="alert alert--error" role="alert">{error}</div>}
  </div>;
}
