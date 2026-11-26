import { Link } from 'react-router-dom';
export default function EmptyState({ title, description, action = 'Browse products', to = '/shop' }) {
  return <div className="empty-state"><h2>{title}</h2><p>{description}</p><Link className="button button--dark" to={to}>{action}</Link></div>;
}
