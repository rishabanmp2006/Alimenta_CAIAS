import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import BarcodeScanner from '../components/BarcodeScanner';
import ImageScanner from '../components/ImageScanner';
import VoiceCommands from '../components/VoiceCommands';
import EducationalGame from '../components/EducationalGame';
import { searchProducts, fetchProductByBarcode } from '../api/openFoodFacts';
import { useHistory } from '../hooks/useHistory';
import { useTheme } from '../contexts/ThemeContext';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const navigate = useNavigate();
  const { history } = useHistory();
  const { theme, toggleTheme } = useTheme();
  const debounceTimerRef = useRef(null);
  // Track current search so stale background updates don't overwrite newer searches
  const currentQueryRef = useRef('');

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const handleSearch = useCallback(async (query, immediate = false) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setError('');
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const performSearch = async () => {
      setLoading(true);
      setError('');
      setSearchQuery(query);
      currentQueryRef.current = query;

      // onUpdate is called when OpenFoodFacts background results arrive
      const onUpdate = (updatedProducts) => {
        // Only apply if this is still the active search
        if (currentQueryRef.current !== query) return;
        setResults(updatedProducts);
        setBackgroundLoading(false);
      };

      const result = await searchProducts(query, onUpdate);
      setLoading(false);

      if (result.success && result.products.length > 0) {
        setResults(result.products);
        setError('');
        // Show subtle indicator that more results may be coming from OFF
        setBackgroundLoading(true);
        // Auto-hide after 10s in case OFF never responds
        setTimeout(() => setBackgroundLoading(false), 10000);
      } else {
        setResults([]);
        setBackgroundLoading(false);
        setError(
          `No results for "${query}". Try a simpler or English term — e.g. "chips", "cola", "biscuit".`
        );
      }
    };

    if (immediate) performSearch();
    else debounceTimerRef.current = setTimeout(performSearch, 300);
  }, []);

  const handleBarcode = async (barcode) => {
    setShowBarcodeScanner(false);
    setLoading(true);
    setError('');
    setResults([]);

    const result = await fetchProductByBarcode(barcode);
    setLoading(false);

    if (result.success) {
      navigateToResult(result.product);
    } else {
      setError(`Product not found for barcode: ${barcode}.`);
    }
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

  const handleImageDetection = (detection) => {
    if (detection.type === 'barcode') handleBarcode(detection.query);
    else handleSearch(detection.query, true);
  };

  const handleVoiceCommand = (command) => {
    if (command.type === 'search') handleSearch(command.query, true);
    else if (command.type === 'navigate') navigate(command.path);
  };

  const navigateToResult = (product) => {
    navigate('/result', { state: { product } });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-40 w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-surface-secondary transition-colors shadow-md"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <VoiceCommands onCommand={handleVoiceCommand} />

      {/* Hero */}
      <div className="text-center mb-14 animate-fade-in-up">
        <h1 className="text-[48px] sm:text-[56px] font-extrabold tracking-tight text-text-primary leading-[1.05]">
          Decode Your<br />
          <span className="text-accent">Food.</span>
        </h1>
        <p className="text-[17px] text-text-secondary mt-4 max-w-md mx-auto leading-relaxed">
          Scan barcodes instantly and understand exactly what you're consuming.
        </p>
      </div>

      {/* Barcode Scanner Button */}
      <div className="mb-4 animate-fade-in-up delay-1">
        <button
          onClick={() => setShowBarcodeScanner(true)}
          className="w-full card p-5 flex items-center gap-4 text-left bg-gradient-to-r from-accent to-accent-dark text-white border-0 hover:shadow-md transition-all"
        >
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-3xl shrink-0">📷</div>
          <div className="flex-1">
            <p className="text-[16px] font-bold">Scan Barcode Live</p>
            <p className="text-[13px] opacity-90">Use camera for instant barcode detection</p>
          </div>
          <span className="text-white text-[18px] font-bold">→</span>
        </button>
      </div>

      {/* Image Scanner */}
      <div className="mb-4 animate-fade-in-up delay-1">
        <ImageScanner onProductDetected={handleImageDetection} />
      </div>

      {/* Search */}
      <div className="mb-10 animate-fade-in-up delay-2">
        <SearchBar
          onSearch={handleSearch}
          onBarcode={handleBarcode}
          onPaste={handlePaste}
          loading={loading}
        />
      </div>

      {/* Loading skeleton */}
      {loading && results.length === 0 && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-[13px] text-text-tertiary text-center mb-2">
            Searching USDA database…
          </p>
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

      {/* Error */}
      {error && !loading && (
        <div className="mb-8 animate-fade-in">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <p className="text-[13px] text-red-700 font-medium mb-2">{error}</p>
            <p className="text-[12px] text-red-400">
              💡 Tip: Use "Paste Ingredients" tab to analyse any product manually.
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !loading && (
        <div className="animate-fade-in-up delay-2 mb-12">
          <div className="flex items-center justify-between mb-3">
            <p className="section-title mb-0">
              Results ({results.length}) for "{searchQuery}"
            </p>
            {backgroundLoading && (
              <span className="text-[11px] text-text-tertiary animate-pulse">
                Loading more…
              </span>
            )}
          </div>
          <div className="space-y-2">
            {results.map((product, idx) => (
              <button
                key={product.id + idx}
                onClick={() => navigateToResult(product)}
                className="card w-full p-4 flex items-center gap-4 text-left hover:shadow-md transition-all"
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt=""
                    className="w-14 h-14 object-contain rounded-xl bg-surface-secondary shrink-0"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-surface-secondary flex items-center justify-center shrink-0 text-xl text-text-tertiary">
                    📦
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-text-primary truncate">{product.name}</p>
                  <p className="text-[12px] text-text-tertiary truncate">{product.brand}</p>
                  {!product.ingredients && (
                    <p className="text-[11px] text-yellow-500 mt-0.5">⚠ No ingredient list available</p>
                  )}
                </div>
                <span className="text-text-tertiary text-[14px]">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {results.length === 0 && !loading && !error && (
        <>
          <div className="mb-12 animate-fade-in-up delay-2">
            <p className="section-title text-center">Try a product</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Nutella', 'Coca-Cola', 'Doritos', 'Oreo', 'Red Bull', 'Pringles'].map(name => (
                <button
                  key={name}
                  onClick={() => handleSearch(name, true)}
                  className="px-4 py-2 bg-surface-secondary text-text-primary rounded-full text-[13px] font-medium hover:bg-accent hover:text-white transition-all duration-200 border border-border"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-12 animate-fade-in-up delay-3">
            <EducationalGame />
          </div>

          {history.length > 0 && (
            <div className="animate-fade-in-up delay-4">
              <p className="section-title">Recent</p>
              <div className="space-y-2">
                {history.slice(0, 3).map(item => (
                  <button
                    key={item.id}
                    onClick={() => navigateToResult(item)}
                    className="card w-full p-3 flex items-center gap-3 text-left hover:shadow-md transition-all"
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

      {showBarcodeScanner && (
        <BarcodeScanner
          onBarcodeDetected={handleBarcode}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}
    </div>
  );
}
