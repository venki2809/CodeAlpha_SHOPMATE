import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getError } from '../services/api';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate(); const location = useLocation();
  const [fields, setFields] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const destination = typeof location.state?.from === 'string' && location.state.from.startsWith('/') && !location.state.from.startsWith('//') ? location.state.from : '/profile';
  if (user) return <Navigate to={destination} replace/>;
  const update = e => setFields(previous => ({ ...previous, [e.target.name]: e.target.value }));
  const submit = async event => {
    event.preventDefault(); setError('');
    if (fields.name.trim().length < 2) return setError('Please enter a name of at least 2 characters.');
    if (fields.password.length < 8) return setError('Use at least 8 characters for your password.');
    if (fields.password !== fields.confirm) return setError('Passwords do not match.');
    setBusy(true);
    try { await register(fields.name, fields.email, fields.password); navigate(destination, { replace: true }); }
    catch (err) { setError(getError(err)); } finally { setBusy(false); }
  };
  return <div className="auth-page"><div className="auth-panel"><span className="eyebrow">JOIN THE GOOD SIDE</span><h1>Make yourself at home.</h1><p>Create an account to checkout, view your orders and keep things simple.</p>
    <form className="form" onSubmit={submit}>{error && <div className="alert alert--error" role="alert">{error}</div>}
      <label>Full name<input name="name" autoComplete="name" value={fields.name} onChange={update} placeholder="Your full name" minLength={2} maxLength={80} required/></label>
      <label>Email address<input name="email" type="email" autoComplete="email" value={fields.email} onChange={update} placeholder="you@example.com" maxLength={254} required/></label>
      <label>Password<div className="password-field"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={128} value={fields.password} onChange={update} placeholder="At least 8 characters" required/><button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div></label>
      <label>Confirm password<input name="confirm" type="password" autoComplete="new-password" value={fields.confirm} onChange={update} placeholder="Repeat your password" required/></label>
      <button className="button button--dark button--full" disabled={busy} type="submit">{busy ? 'Creating account…' : 'Create your account'} <ArrowRight size={18}/></button>
    </form><p className="demo-hint">Presentation demo only. Please do not use a password from a real account.</p><p className="auth-switch">Already have an account? <Link to="/login" state={{ from: destination }}>Sign in</Link></p>
  </div><div className="auth-aside"><img onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/image-fallback.svg'; }} src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85" alt="Thoughtfully arranged clothing in a modern shop"/><div><span>SHOPMATE EDIT</span><strong>Good things ahead.</strong></div></div></div>;
}
