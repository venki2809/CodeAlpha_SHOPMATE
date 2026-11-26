import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
export default function NotFoundPage() {
  return <div className="container notfound-page"><span className="eyebrow">404 / PAGE NOT FOUND</span><h1>Looks like you've wandered off.</h1><p>The page you're looking for isn't here. Let's get you back to the good stuff.</p><Link to="/" className="button button--dark"><ArrowLeft size={17}/> Back to home</Link></div>;
}
