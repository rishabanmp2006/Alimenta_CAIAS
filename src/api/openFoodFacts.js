/**
 * Food Data API — USDA FoodData Central (primary) + OpenFoodFacts (fallback)
 *
 * USDA FoodData Central:
 *  - Free, fast, reliable
 *  - Works instantly with DEMO_KEY (no signup needed to test)
 *  - For production: get a free key at https://fdc.nal.usda.gov/api-key-signup
 *
 * OpenFoodFacts:
 *  - Fallback for barcode lookups and global products
 *  - Slower but has 2.8M products
 */

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';
// Uses DEMO_KEY by default — works immediately, limited to ~1000 req/hour
// Set VITE_USDA_API_KEY in your .env for unlimited access
const USDA_KEY = import.meta.env.VITE_USDA_API_KEY || 'DEMO_KEY';
const OFF_BASE = 'https://world.openfoodfacts.org';

/* ─── Cache ────────────────────────────────────────────── */
const cache = new Map();
const TTL = 5 * 60 * 1000;
function getCached(k) {
  const it = cache.get(k);
  if (!it) return null;
  if (Date.now() - it.ts > TTL) { cache.delete(k); return null; }
  return it.v;
}
function setCache(k, v) { cache.set(k, { v, ts: Date.now() }); }
export function clearCache() { cache.clear(); }

/* ─── Fetch with timeout ───────────────────────────────── */
async function timedFetch(url, ms = 6000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    return r;
  } catch (e) { clearTimeout(t); throw e; }
}

/* ─── USDA normalise ───────────────────────────────────── */
function normaliseUSDA(item) {
  // Build ingredient string from available fields
  const ingredients =
    item.ingredients ||
    item.foodNutrients?.map(n => n.nutrient?.name).filter(Boolean).join(', ') ||
    '';

  const brand = item.brandOwner || item.brandName || item.marketCountry || '';
  const name = item.description || item.lowercaseDescription || 'Unknown Product';

  return {
    id: String(item.fdcId),
    name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
    brand: brand || 'Unknown Brand',
    ingredients,
    categories: item.foodCategory?.description || item.brandedFoodCategory || '',
    image: null, // USDA doesn't have images — OFF fallback will add them
    nutriScore: null,
    novaGroup: null,
    barcode: item.gtinUpc || null,
    source: 'USDA',
    fdcId: item.fdcId,
  };
}

/* ─── USDA search ──────────────────────────────────────── */
async function searchUSDA(query) {
  const url =
    `${USDA_BASE}/foods/search` +
    `?query=${encodeURIComponent(query)}` +
    `&dataType=Branded,Foundation,SR%20Legacy` +
    `&pageSize=15` +
    `&api_key=${USDA_KEY}`;

  const r = await timedFetch(url, 6000);
  if (!r.ok) throw new Error(`USDA ${r.status}`);
  const data = await r.json();
  return (data.foods || []).map(normaliseUSDA);
}

/* ─── OpenFoodFacts normalise ──────────────────────────── */
function normaliseOFF(p) {
  return {
    id: p.code || p._id || String(Date.now()),
    name: p.product_name || p.product_name_en || 'Unknown Product',
    brand: p.brands || p.brand_owner || 'Unknown Brand',
    ingredients:
      p.ingredients_text || p.ingredients_text_en ||
      p.ingredients_text_with_allergens || '',
    categories: p.categories || '',
    image: p.image_front_small_url || p.image_url || p.image_front_url || null,
    nutriScore: p.nutriscore_grade || null,
    novaGroup: p.nova_group || null,
    barcode: p.code || p._id,
    source: 'OpenFoodFacts',
  };
}

/* ─── OFF barcode lookup ───────────────────────────────── */
async function fetchFromOFF(barcode) {
  const r = await timedFetch(`${OFF_BASE}/api/v0/product/${barcode}.json`, 8000);
  const data = await r.json();
  if (data.status === 1 && data.product) return normaliseOFF(data.product);
  return null;
}

/* ─── OFF search (fallback) ────────────────────────────── */
async function searchOFF(query) {
  const url =
    `${OFF_BASE}/cgi/search.pl` +
    `?search_terms=${encodeURIComponent(query)}` +
    `&search_simple=1&action=process&json=1&page_size=10`;
  const r = await timedFetch(url, 8000);
  const data = await r.json();
  return (data.products || []).map(normaliseOFF);
}

/* ─── Deduplicate + rank ───────────────────────────────── */
function rankAndDedup(products) {
  const seen = new Set();
  return products
    .filter(p => {
      if (!p.name || p.name === 'Unknown Product') return false;
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    })
    .sort((a, b) => {
      const score = p =>
        (p.ingredients ? 3 : 0) +
        (p.brand !== 'Unknown Brand' ? 1 : 0) +
        (p.image ? 1 : 0) +
        (p.source === 'USDA' ? 2 : 0); // prefer USDA — it's faster & verified
      return score(b) - score(a);
    })
    .slice(0, 10);
}

/* ─── Public: search by name ────────────────────────────── */
export async function searchProducts(query) {
  if (!query || query.trim().length < 2)
    return { success: false, error: 'Query too short' };

  const key = `search_${query.toLowerCase().trim()}`;
  const cached = getCached(key);
  if (cached) return { success: true, products: cached };

  // Run USDA first (fast), then OFF in parallel as fallback
  const [usdaResult, offResult] = await Promise.allSettled([
    searchUSDA(query),
    searchOFF(query),
  ]);

  const usda = usdaResult.status === 'fulfilled' ? usdaResult.value : [];
  const off  = offResult.status  === 'fulfilled' ? offResult.value  : [];

  if (usdaResult.status === 'rejected') {
    console.warn('USDA search failed:', usdaResult.reason);
  }

  const products = rankAndDedup([...usda, ...off]);

  if (products.length > 0) {
    setCache(key, products);
    return { success: true, products };
  }

  return {
    success: false,
    error: 'No products found. Try a more generic term (e.g. "chips" instead of "Lays masala").',
  };
}

/* ─── Public: fetch by barcode ───────────────────────────── */
export async function fetchProductByBarcode(barcode) {
  const key = `barcode_${barcode}`;
  const cached = getCached(key);
  if (cached) return { success: true, product: cached };

  // Try USDA barcode lookup first, then OFF
  const [usdaResult, offResult] = await Promise.allSettled([
    (async () => {
      const url = `${USDA_BASE}/foods/search?query=${barcode}&api_key=${USDA_KEY}`;
      const r = await timedFetch(url, 6000);
      const data = await r.json();
      const match = (data.foods || []).find(f => f.gtinUpc === barcode);
      return match ? normaliseUSDA(match) : null;
    })(),
    fetchFromOFF(barcode),
  ]);

  const product =
    (usdaResult.status === 'fulfilled' && usdaResult.value) ||
    (offResult.status  === 'fulfilled' && offResult.value);

  if (product) {
    setCache(key, product);
    return { success: true, product };
  }

  return { success: false, error: `Barcode ${barcode} not found in USDA or OpenFoodFacts.` };
}
