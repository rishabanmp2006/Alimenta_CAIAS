import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import { searchProducts, fetchProductByBarcode } from '../api/openFoodFacts';
import { parseIngredients } from '../engine/parser';
import { useHistory } from '../hooks/useHistory';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { history } = useHistory();

  const handleSearch = async (query) => {
    setLoading(true);
    setError('');
    setResults([]);
    const result = await searchProducts(query);
    setLoading(false);
    if (result.success) {
      setResults(result.products);
    } else {
      setError('No products found. Try a different search term.');
    }
  };

  const handleBarcode = async (barcode) => {
    setLoading(true);
    setError('');
    setResults([]);
    const result = await fetchProductByBarcode(barcode);
    setLoading(false);
    if (result.success) {
      navigateToResult(result.product);
    } else {
      setError('Product not found. Check the barcode and try again.');
    }
  };

  const handlePaste = (ingredientText) => {
    const product = {
      id: 'pasted_' + Date.now(),
      name: 'Pasted Product',
      brand: 'Manual Entry',
      ingredients: ingredientText,
      categories: '',
      image: null,
    };
    navigateToResult(product);
  };

  const navigateToResult = (product) => {
    navigate('/result', { state: { product } });
  };

  const recentHistory = history.slice(0, 4);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl font-black mb-4">
          <span className="bg-gradient-to-r from-accent via-purple-400 to-safe bg-clip-text text-transparent">
            Know What You Eat
          </span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Scan any product, decode its ingredients, and get instant health insights powered by AI intelligence.
        </p>
      </div>

      {/* Search */}
      <div className="mb-12 animate-fade-in-up delay-100">
        <SearchBar
          onSearch={handleSearch}
          onBarcode={handleBarcode}
          onPaste={handlePaste}
          loading={loading}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="glass-card inline-block px-6 py-3 text-sm text-avoid">
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="mb-12 animate-fade-in-up delay-200">
          <h2 className="text-lg font-bold text-slate-200 mb-4">Search Results</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {results.map((product, idx) => (
              <button
                key={product.id + idx}
                onClick={() => navigateToResult(product)}
                className="glass-card p-4 flex items-center gap-4 text-left hover:border-accent/30 transition-all duration-200 w-full"
              >
                {product.image ? (
                  <img src={product.image} alt="" className="w-14 h-14 object-contain rounded-lg bg-white/5 shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-dark-600 flex items-center justify-center shrink-0">
                    <span className="text-2xl">📦</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{product.name}</p>
                  <p className="text-xs text-slate-500 truncate">{product.brand}</p>
                  {product.ingredients && (
                    <p className="text-xs text-slate-600 mt-1 truncate">
                      {parseIngredients(product.ingredients).length} ingredients
                    </p>
                  )}
                </div>
                <span className="text-accent text-sm">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Try & Features */}
      {results.length === 0 && !loading && (
        <>
          {/* Quick try barcodes */}
          <div className="mb-12 animate-fade-in-up delay-200">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">
              Quick Try — Popular Products
            </h2>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { name: 'Nutella', q: 'nutella' },
                { name: 'Coca-Cola', q: 'coca cola' },
                { name: 'Doritos', q: 'doritos' },
                { name: 'Oreo', q: 'oreo' },
                { name: 'Red Bull', q: 'red bull' },
              ].map(item => (
                <button
                  key={item.q}
                  onClick={() => handleSearch(item.q)}
                  className="px-4 py-2 bg-dark-700 text-slate-300 rounded-xl text-sm hover:bg-accent/15 hover:text-accent transition-all border border-dark-500 hover:border-accent/30"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Features grid */}
          <div className="grid sm:grid-cols-3 gap-4 animate-fade-in-up delay-300">
            {[
              { icon: '🧪', title: 'Ingredient Analysis', desc: 'Every ingredient classified as Safe, Risky, or Avoid' },
              { icon: '📊', title: 'Health Score', desc: 'Instant 0-100 score with visual risk dashboard' },
              { icon: '🎯', title: 'Personalized', desc: 'Custom analysis for Diabetic, Fitness, or Child profiles' },
              { icon: '⏳', title: 'Long-Term Effects', desc: 'Potential health impacts from regular consumption' },
              { icon: '🔍', title: 'Hidden Dangers', desc: 'Detect additives, preservatives, and artificial ingredients' },
              { icon: '🔄', title: 'Better Alternatives', desc: 'Healthier product suggestions for every item scanned' },
            ].map(f => (
              <div key={f.title} className="glass-card p-5 text-center">
                <span className="text-3xl block mb-2">{f.icon}</span>
                <h3 className="text-sm font-bold text-slate-200 mb-1">{f.title}</h3>
                <p className="text-xs text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Recent History */}
          {recentHistory.length > 0 && (
            <div className="mt-12 animate-fade-in-up delay-400">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Recently Scanned
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {recentHistory.map(item => (
                  <button
                    key={item.id}
                    onClick={() => navigateToResult(item)}
                    className="glass-card p-3 flex items-center gap-3 text-left hover:border-accent/30 transition-all w-full"
                  >
                    <div className="w-8 h-8 rounded-lg bg-dark-600 flex items-center justify-center shrink-0 text-sm">
                      📦
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-300 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-600">{item.brand}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
