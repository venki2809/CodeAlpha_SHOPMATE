import { LoaderCircle } from 'lucide-react';
export default function LoadingState({ label = 'Loading…', compact = false }) {
  return <div className={`loading-state ${compact ? 'loading-state--compact' : ''}`} role="status">
    <LoaderCircle size={24} className="spin" /> <span>{label}</span>
  </div>;
}
