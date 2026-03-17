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
    if (result.success) setResults(result.products);
    else setError('No products found. Try a different search term.');
  };

  const handleBarcode = async (barcode) => {
    setLoading(true);
    setError('');
    setResults([]);
    const result = await fetchProductByBarcode(barcode);
    setLoading(false);
    if (result.success) navigateToResult(result.product);
    else setError('Product not found. Check the barcode and try again.');
  };

  const handlePaste = (ingredientText) => {
    navigateToResult({
      id: 'pasted_' + Date.now(),
      name: 'Custom Product',
      brand: 'Manual Entry',
      ingredients: ingredientText,
      categories: '',
      image: null,
    });
  };

  const navigateToResult = (product) => {
    navigate('/result', { state: { product } });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      {/* Hero */}
      <div className="text-center mb-14 animate-fade-in-up">
        <h1 className="text-[48px] sm:text-[56px] font-extrabold tracking-tight text-text-primary leading-[1.05]">
          Decode Your
          <br />
          <span className="text-accent">Food.</span>
        </h1>
        <p className="text-[17px] text-text-secondary mt-4 max-w-md mx-auto leading-relaxed">
          Scan any product and understand exactly what you're consuming.
        </p>
      </div>

      {/* Search */}
      <div className="mb-10 animate-fade-in-up delay-1">
        <SearchBar
          onSearch={handleSearch}
          onBarcode={handleBarcode}
          onPaste={handlePaste}
          loading={loading}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="text-center mb-8 animate-fade-in">
          <p className="text-[14px] text-avoid bg-avoid-bg inline-block px-5 py-2.5 rounded-2xl font-medium">
            {error}
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && results.length === 0 && !error && (
        <div className="space-y-3 animate-fade-in">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4 flex gap-4 items-center">
              <div className="skeleton w-14 h-14 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="animate-fade-in-up delay-2 mb-12">
          <p className="section-title">Results</p>
          <div className="space-y-2">
            {results.map((product, idx) => (
              <button
                key={product.id + idx}
                onClick={() => navigateToResult(product)}
                className="card card-interactive w-full p-4 flex items-center gap-4 text-left"
              >
                {product.image ? (
                  <img src={product.image} alt="" className="w-14 h-14 object-contain rounded-xl bg-surface-secondary shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-surface-secondary flex items-center justify-center shrink-0 text-xl text-text-tertiary">📦</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-text-primary truncate">{product.name}</p>
                  <p className="text-[12px] text-text-tertiary truncate">{product.brand}</p>
                </div>
                <span className="text-text-tertiary text-[14px]">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state — Quick Try */}
      {results.length === 0 && !loading && (
        <>
          <div className="mb-12 animate-fade-in-up delay-2">
            <p className="section-title text-center">Try a product</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Nutella', 'Coca-Cola', 'Doritos', 'Oreo', 'Red Bull'].map(name => (
                <button
                  key={name}
                  onClick={() => handleSearch(name)}
                  className="px-4 py-2 bg-white text-text-secondary rounded-full text-[13px] font-medium hover:bg-text-primary hover:text-white transition-all duration-200 border border-border-light"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Recent history */}
          {history.length > 0 && (
            <div className="animate-fade-in-up delay-3">
              <p className="section-title">Recent</p>
              <div className="space-y-2">
                {history.slice(0, 3).map(item => (
                  <button
                    key={item.id}
                    onClick={() => navigateToResult(item)}
                    className="card w-full p-3 flex items-center gap-3 text-left hover:shadow-sm transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-surface-secondary flex items-center justify-center shrink-0 text-sm text-text-tertiary">📦</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-text-primary truncate">{item.name}</p>
                      <p className="text-[11px] text-text-tertiary">{item.brand}</p>
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
