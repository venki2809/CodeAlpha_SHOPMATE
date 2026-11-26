import { Link } from 'react-router-dom';
export default function Footer() {
  return <footer className="site-footer">
    <div className="container footer-top">
      <div className="footer-brand"><Link className="wordmark" to="/">SHOPMATE<span className="wordmark-dot">.</span></Link>
        <p>Good things, every day. A considered collection of the pieces you'll keep coming back to.</p>
      </div>
      <div className="footer-group"><h3>Explore</h3><Link to="/shop">All products</Link><Link to="/category/clothing">Clothing</Link><Link to="/category/shoes">Shoes</Link><Link to="/category/accessories">Accessories</Link></div>
      <div className="footer-group"><h3>Your account</h3><Link to="/profile">My profile & orders</Link><Link to="/cart">Shopping bag</Link><Link to="/login">Sign in</Link></div>
      <div className="footer-group"><h3>SHOPMATE info</h3><p className="footer-small">Demo shipping is free on orders over ₹2,999.</p><p className="footer-small">Checkout is simulated — no actual order or payment.</p><p className="footer-small">All demo data is saved in this browser only.</p></div>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} SHOPMATE. All rights reserved.</span><span>Made for the everyday.</span></div>
  </footer>;
}
