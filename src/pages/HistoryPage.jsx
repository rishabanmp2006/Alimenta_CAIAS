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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-black text-slate-200">📋 Scan History</h1>
          <p className="text-sm text-slate-500 mt-1">
            {history.length} product{history.length !== 1 ? 's' : ''} scanned
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-4 py-2 rounded-xl bg-avoid/10 text-avoid text-sm font-medium hover:bg-avoid/20 transition-all border border-avoid/20"
          >
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 animate-fade-in-up delay-100">
          <span className="text-5xl block mb-4">🫙</span>
          <p className="text-slate-400 text-lg font-medium mb-2">No products scanned yet</p>
          <p className="text-slate-600 text-sm mb-6">Start scanning to build your history</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-accent hover:bg-accent/80 text-white rounded-xl text-sm font-medium transition-all"
          >
            Scan Your First Product →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, idx) => (
            <div
              key={item.id + idx}
              className="animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <HistoryItem
                item={item}
                onSelect={handleSelect}
                onRemove={removeFromHistory}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
