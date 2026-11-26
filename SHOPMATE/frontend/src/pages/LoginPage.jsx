import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getError } from '../services/api';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const destination = typeof location.state?.from === 'string' && location.state.from.startsWith('/') && !location.state.from.startsWith('//') ? location.state.from : '/profile';
  if (user) return <Navigate to={destination} replace/>;
  const demoLogin = async () => {
    setBusy(true); setError('');
    try { await login('demo@shopmate.test', 'Demo@12345'); navigate(destination, { replace: true }); }
    catch (err) { setError(getError(err)); } finally { setBusy(false); }
  };
  const submit = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try { await login(email, password); navigate(destination, { replace: true }); }
    catch (err) { setError(getError(err)); } finally { setBusy(false); }
  };
  return <div className="auth-page"><div className="auth-panel"><span className="eyebrow">WELCOME BACK</span><h1>Good to see you again.</h1><p>Sign in to keep your favorites, orders and details all in one place.</p>
    <form className="form" onSubmit={submit}>
      {error && <div className="alert alert--error" role="alert">{error}</div>}
      <label>Email address<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required maxLength={254}/></label>
      <label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" required/><button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div></label>
      <button className="button button--dark button--full" disabled={busy} type="submit">{busy ? 'Signing in…' : 'Sign in'} <ArrowRight size={18}/></button>
    </form><button type="button" className="button button--outline button--full demo-login-button" onClick={demoLogin} disabled={busy}>Try demo account <ArrowRight size={17}/></button><p className="demo-hint">Demo login: demo@shopmate.test / Demo@12345. Do not use real passwords.</p><p className="auth-switch">New here? <Link to="/register" state={{ from: destination }}>Create an account</Link></p>
  </div><div className="auth-aside"><img onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/image-fallback.svg'; }} src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=90" alt="Fashion collection displayed in a contemporary shop"/><div><span>SHOPMATE EDIT</span><strong>A better kind of everyday.</strong></div></div></div>;
}
