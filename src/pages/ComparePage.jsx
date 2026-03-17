import { useState } from 'react';
import { searchProducts } from '../api/openFoodFacts';
import { parseIngredients } from '../engine/parser';
import { classifyIngredients } from '../engine/classifier';
import { computeHealthScore, computeTrustScore } from '../engine/scorer';
import CompareCard from '../components/CompareCard';

export default function ComparePage() {
  const [query1, setQuery1] = useState('');
  const [query2, setQuery2] = useState('');
  const [results1, setResults1] = useState([]);
  const [results2, setResults2] = useState([]);
  const [product1, setProduct1] = useState(null);
  const [product2, setProduct2] = useState(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const handleSearch = async (query, side) => {
    const setLoading = side === 1 ? setLoading1 : setLoading2;
    const setResults = side === 1 ? setResults1 : setResults2;
    setLoading(true);
    setResults([]);
    const result = await searchProducts(query);
    setLoading(false);
    if (result.success) {
      setResults(result.products);
    }
  };

  const selectProduct = (product, side) => {
    if (side === 1) {
      setProduct1(product);
      setResults1([]);
    } else {
      setProduct2(product);
      setResults2([]);
    }
  };

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

  const SearchPanel = ({ side, query, setQuery, loading, results, selectedProduct }) => (
    <div className="flex-1">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) handleSearch(query, side);
        }}
        className="flex gap-2 mb-3"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => (side === 1 ? setQuery1 : setQuery2)(e.target.value)}
          placeholder={`Search product ${side}...`}
          className="flex-1 bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent/50 transition-all"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-accent hover:bg-accent/80 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
        >
          {loading ? '...' : '🔍'}
        </button>
      </form>

      {/* Search results dropdown */}
      {results.length > 0 && (
        <div className="space-y-1 mb-3 max-h-60 overflow-y-auto">
          {results.map((p, idx) => (
            <button
              key={p.id + idx}
              onClick={() => selectProduct(p, side)}
              className="w-full glass-card p-2.5 flex items-center gap-3 text-left hover:border-accent/30 transition-all text-sm"
            >
              {p.image ? (
                <img src={p.image} alt="" className="w-8 h-8 object-contain rounded bg-white/5 shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded bg-dark-600 flex items-center justify-center shrink-0 text-xs">📦</div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-200 truncate">{p.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{p.brand}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-black text-slate-200 mb-2">⚖️ Compare Products</h1>
        <p className="text-sm text-slate-500">Search and compare two products side by side</p>
      </div>

      {/* Search panels */}
      <div className="grid md:grid-cols-2 gap-6 mb-8 animate-fade-in-up delay-100">
        <SearchPanel side={1} query={query1} setQuery={setQuery1} loading={loading1} results={results1} selectedProduct={product1} />
        <SearchPanel side={2} query={query2} setQuery={setQuery2} loading={loading2} results={results2} selectedProduct={product2} />
      </div>

      {/* Comparison */}
      {(product1 || product2) && (
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up delay-200">
          <div>
            {product1 && analysis1 ? (
              <CompareCard
                product={product1}
                healthScore={analysis1.healthScore}
                classified={analysis1.classified}
                trustScore={analysis1.trustScore}
              />
            ) : (
              <div className="glass-card p-12 text-center">
                <p className="text-slate-500 text-sm">Search for product 1 above</p>
              </div>
            )}
          </div>
          <div>
            {product2 && analysis2 ? (
              <CompareCard
                product={product2}
                healthScore={analysis2.healthScore}
                classified={analysis2.classified}
                trustScore={analysis2.trustScore}
              />
            ) : (
              <div className="glass-card p-12 text-center">
                <p className="text-slate-500 text-sm">Search for product 2 above</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Winner banner */}
      {analysis1 && analysis2 && (
        <div className="mt-8 glass-card p-6 text-center animate-fade-in-up delay-300">
          <h3 className="text-lg font-bold text-slate-200 mb-2">🏆 Verdict</h3>
          {analysis1.healthScore.score === analysis2.healthScore.score ? (
            <p className="text-risky">Both products have similar health scores.</p>
          ) : (
            <p>
              <span className="text-safe font-bold">
                {analysis1.healthScore.score > analysis2.healthScore.score ? product1.name : product2.name}
              </span>
              <span className="text-slate-400"> is the healthier choice with a score of </span>
              <span className="text-safe font-bold">
                {Math.max(analysis1.healthScore.score, analysis2.healthScore.score)}/100
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
