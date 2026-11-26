import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const links = [
  { label: 'Shop all', to: '/shop' },
  { label: 'Clothing', to: '/category/clothing' },
  { label: 'Shoes', to: '/category/shoes' },
  { label: 'Watches', to: '/category/watches' },
  { label: 'Electronics', to: '/category/electronics' },
  { label: 'Accessories', to: '/category/accessories' }
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { count } = useCart();
  const submitSearch = event => {
    event.preventDefault();
    navigate(search.trim() ? `/shop?search=${encodeURIComponent(search.trim())}` : '/shop');
    setMenuOpen(false);
  };
  return <>
    <div className="announcement">Interactive SHOPMATE demo · no real purchases. <Link to="/shop?offers=true">Explore this week's picks <ArrowRight size={12}/></Link></div>
    <header className="site-header">
      <div className="container topbar">
        <button className="icon-button menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>
          {menuOpen ? <X size={23}/> : <Menu size={23}/>}
        </button>
        <Link className="wordmark" to="/" onClick={() => setMenuOpen(false)}>SHOPMATE<span className="wordmark-dot">.</span></Link>
        <form className="header-search" onSubmit={submitSearch} role="search">
          <Search size={18} aria-hidden="true"/><input aria-label="Search products" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for something good…"/>
          <button aria-label="Submit search" type="submit"><ArrowRight size={18}/></button>
        </form>
        <div className="header-actions">
          <Link to={user ? '/profile' : '/login'} className="header-action account-link" aria-label={user ? 'My account' : 'Log in'}>
            <UserRound size={21}/><span>{user ? 'Account' : 'Sign in'}</span>
          </Link>
          <Link to="/cart" className="header-action" aria-label={`Shopping bag with ${count} items`}>
            <ShoppingBag size={21}/><span>Bag</span>{count > 0 && <span className="cart-count">{count}</span>}
          </Link>
        </div>
      </div>
      <nav className={`desktop-nav ${menuOpen ? 'desktop-nav--open' : ''}`} aria-label="Main navigation">
        <div className="container nav-links">
          {links.map(link => <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{link.label}</NavLink>)}
        </div>
      </nav>
      <form className="mobile-search" onSubmit={submitSearch}><Search size={18}/><input aria-label="Search products on mobile" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products"/><button type="submit" aria-label="Search"><ArrowRight size={18}/></button></form>
    </header>
  </>;
}
