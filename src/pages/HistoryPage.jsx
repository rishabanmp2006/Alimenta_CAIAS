import { useNavigate } from 'react-router-dom';
import { useHistory } from '../hooks/useHistory';
import HistoryItem from '../components/HistoryItem';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { history, removeFromHistory, clearHistory } = useHistory();

  const handleSelect = (product) => {
    navigate('/result', { state: { product } });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-text-primary">History</h1>
          <p className="text-[14px] text-text-tertiary mt-0.5">
            {history.length} product{history.length !== 1 ? 's' : ''} scanned
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-4 py-2 rounded-full text-[13px] font-medium text-avoid bg-avoid-bg hover:bg-avoid-light transition-all"
          >
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-24 animate-fade-in-up delay-1">
          <p className="text-text-tertiary text-[15px] font-medium mb-1">No products scanned yet</p>
          <p className="text-text-tertiary text-[13px] mb-6">Search for a product to get started</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-text-primary hover:bg-black text-white rounded-full text-[13px] font-semibold transition-all"
          >
            Scan a Product
          </button>
        </div>
      ) : (
        <div className="space-y-2 animate-fade-in-up delay-1">
          {history.map((item, idx) => (
            <div key={item.id + idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.04}s` }}>
              <HistoryItem item={item} onSelect={handleSelect} onRemove={removeFromHistory} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
