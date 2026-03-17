import { useState, useCallback, useEffect, useRef } from 'react';
import { searchProducts } from '../api/openFoodFacts';
import { parseIngredients } from '../engine/parser';
import { classifyIngredients } from '../engine/classifier';
import { computeHealthScore, computeTrustScore } from '../engine/scorer';
import CompareCard from '../components/CompareCard';

// SearchInput component defined outside to prevent recreation on every render
function SearchInput({ side, query, setQuery, loading, results, onSearch, onSelectProduct }) {
  const debounceTimerRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Debounced auto-search after 500ms of no typing
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    if (value.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        onSearch(value, side);
      }, 500);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div>
      <form
        onSubmit={(e) => { 
          e.preventDefault(); 
          if (query.trim()) onSearch(query, side); 
        }}
        className="flex gap-2 mb-3"
      >
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={`Product ${side}...`}
          className="flex-1 bg-white rounded-xl px-4 py-2.5 text-[14px] text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 border border-border-light"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-text-primary hover:bg-black disabled:opacity-30 text-white px-4 py-2 rounded-xl text-[13px] font-semibold transition-all"
        >
          {loading ? '...' : 'Search'}
        </button>
      </form>
      {results.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {results.map((p, idx) => (
            <button
              key={p.id + idx}
              onClick={() => onSelectProduct(p, side)}
              className="card w-full p-2.5 flex items-center gap-2.5 text-left hover:shadow-sm transition-all text-[13px]"
            >
              {p.image ? (
                <img src={p.image} alt="" className="w-8 h-8 object-contain rounded-lg bg-surface-secondary shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center shrink-0 text-xs text-text-tertiary">📦</div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-text-primary truncate">{p.name}</p>
                <p className="text-[11px] text-text-tertiary truncate">{p.brand}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  const [query1, setQuery1] = useState('');
  const [query2, setQuery2] = useState('');
  const [results1, setResults1] = useState([]);
  const [results2, setResults2] = useState([]);
  const [product1, setProduct1] = useState(null);
  const [product2, setProduct2] = useState(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const handleSearch = useCallback(async (query, side) => {
    const setLoading = side === 1 ? setLoading1 : setLoading2;
    const setResults = side === 1 ? setResults1 : setResults2;
    setLoading(true);
    setResults([]);
    const result = await searchProducts(query);
    setLoading(false);
    if (result.success) setResults(result.products);
  }, []);

  const selectProduct = useCallback((product, side) => {
    if (side === 1) { setProduct1(product); setResults1([]); setQuery1(''); }
    else { setProduct2(product); setResults2([]); setQuery2(''); }
  }, []);

  const analyzeProduct = (product) => {
    if (!product?.ingredients) return null;
    const parsed = parseIngredients(product.ingredients);
    const classified = classifyIngredients(parsed, 'general');
    const healthScore = computeHealthScore(classified);
    const trustScore = computeTrustScore(classified);
    return { classified, healthScore, trustScore };
  };

  const analysis1 = product1 ? analyzeProduct(product1) : null;
  const analysis2 = product2 ? analyzeProduct(product2) : null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-10 animate-fade-in-up">
        <h1 className="text-[32px] font-extrabold tracking-tight text-text-primary">Compare</h1>
        <p className="text-[15px] text-text-tertiary mt-1">Side by side ingredient analysis</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8 animate-fade-in-up delay-1">
        <SearchInput 
          side={1} 
          query={query1} 
          setQuery={setQuery1} 
          loading={loading1} 
          results={results1}
          onSearch={handleSearch}
          onSelectProduct={selectProduct}
        />
        <SearchInput 
          side={2} 
          query={query2} 
          setQuery={setQuery2} 
          loading={loading2} 
          results={results2}
          onSearch={handleSearch}
          onSelectProduct={selectProduct}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up delay-2">
        <div>
          {product1 && analysis1 ? (
            <CompareCard product={product1} healthScore={analysis1.healthScore} classified={analysis1.classified} trustScore={analysis1.trustScore} />
          ) : (
            <div className="card p-12 text-center">
              <p className="text-text-tertiary text-[14px]">Search product 1</p>
            </div>
          )}
        </div>
        <div>
          {product2 && analysis2 ? (
            <CompareCard product={product2} healthScore={analysis2.healthScore} classified={analysis2.classified} trustScore={analysis2.trustScore} />
          ) : (
            <div className="card p-12 text-center">
              <p className="text-text-tertiary text-[14px]">Search product 2</p>
            </div>
          )}
        </div>
      </div>

      {/* Verdict */}
      {analysis1 && analysis2 && (
        <div className="mt-8 card p-6 text-center animate-fade-in-up delay-3">
          <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-2">Verdict</p>
          {analysis1.healthScore.score === analysis2.healthScore.score ? (
            <p className="text-[15px] text-text-secondary">Both products are comparable.</p>
          ) : (
            <p className="text-[15px] text-text-secondary">
              <span className="font-bold text-safe">
                {analysis1.healthScore.score > analysis2.healthScore.score ? product1.name : product2.name}
              </span>
              {' '}is healthier with a score of{' '}
              <span className="font-bold text-safe">
                {Math.max(analysis1.healthScore.score, analysis2.healthScore.score)}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
