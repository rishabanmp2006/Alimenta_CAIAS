/**
 * Food Data API — Dual-source search
 *
 * Sources:
 *  1. USDA FoodData Central  — fast (~300ms), 380k branded foods
 *     Free key: fdc.nal.usda.gov/api-key-signup (DEMO_KEY works out of the box)
 *  2. OpenFoodFacts          — slow (5-8s), 3.2M global products, background only
 *
 * Flow: USDA returns instantly → shown to user
 *       OFF runs in background → silently appends more results + images
 */

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';
const OFF_BASE  = 'https://world.openfoodfacts.org';
const USDA_KEY  = import.meta.env.VITE_USDA_API_KEY || 'DEMO_KEY';

/* ─── Cache ─────────────────────────────────────────────── */
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

/* ─── Fetch with timeout ─────────────────────────────────── */
async function timedFetch(url, ms = 6000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    return r;
  } catch (e) { clearTimeout(t); throw e; }
}

/* ══════════════════════════════════════
   USDA FoodData Central
═══════════════════════════════════════ */
function normaliseUSDA(item) {
  const name = item.description || '';
  return {
    id: `usda_${item.fdcId}`,
    name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
    brand: item.brandOwner || item.brandName || '',
    ingredients: item.ingredients || '',
    categories: item.foodCategory?.description || item.brandedFoodCategory || '',
    image: null,
    nutriScore: null,
    novaGroup: null,
    barcode: item.gtinUpc || null,
    source: 'USDA',
    fdcId: item.fdcId,
  };
}

async function searchUSDA(query) {
  const url =
    `${USDA_BASE}/foods/search` +
    `?query=${encodeURIComponent(query)}` +
    `&dataType=Branded,Foundation,SR%20Legacy` +
    `&pageSize=15&api_key=${USDA_KEY}`;
  const r = await timedFetch(url, 6000);
  if (!r.ok) throw new Error(`USDA ${r.status}`);
  const d = await r.json();
  return (d.foods || []).map(normaliseUSDA);
}

/* ══════════════════════════════════════
   OpenFoodFacts
═══════════════════════════════════════ */
function normaliseOFF(p) {
  return {
    id: `off_${p.code || Date.now()}`,
    name: p.product_name || p.product_name_en || 'Unknown Product',
    brand: p.brands || '',
    ingredients: p.ingredients_text || p.ingredients_text_en || '',
    categories: p.categories || '',
    image: p.image_front_small_url || p.image_url || null,
    nutriScore: p.nutriscore_grade || null,
    novaGroup: p.nova_group || null,
    barcode: p.code,
    source: 'OpenFoodFacts',
  };
}

async function searchOFF(query) {
  const url =
    `${OFF_BASE}/cgi/search.pl` +
    `?search_terms=${encodeURIComponent(query)}` +
    `&search_simple=1&action=process&json=1&page_size=10`;
  const r = await timedFetch(url, 8000);
  const d = await r.json();
  return (d.products || []).map(normaliseOFF);
}

async function fetchFromOFF(barcode) {
  const r = await timedFetch(`${OFF_BASE}/api/v0/product/${barcode}.json`, 8000);
  const d = await r.json();
  if (d.status === 1 && d.product) return normaliseOFF(d.product);
  return null;
}

/* ─── Image enrichment for USDA products via OFF ────────── */
async function fetchOFFImage(barcode) {
  try {
    const url = `${OFF_BASE}/api/v0/product/${barcode}.json?fields=image_front_small_url,image_front_url,ingredients_text,brands`;
    const r = await timedFetch(url, 5000);
    const d = await r.json();
    if (d.status === 1 && d.product) {
      return {
        image: d.product.image_front_small_url || d.product.image_front_url || null,
        ingredients: d.product.ingredients_text || null,
        brand: d.product.brands || null,
      };
    }
  } catch { /* silent */ }
  return null;
}

async function enrichWithImages(products) {
  const toEnrich = products.filter(p => p.barcode && !p.image).slice(0, 8);
  if (toEnrich.length === 0) return products;
  const results = await Promise.allSettled(toEnrich.map(p => fetchOFFImage(p.barcode)));
  const map = Object.fromEntries(products.map(p => [p.id, { ...p }]));
  toEnrich.forEach((p, i) => {
    const res = results[i];
    if (res.status === 'fulfilled' && res.value) {
      const { image, ingredients, brand } = res.value;
      if (image) map[p.id].image = image;
      if (ingredients && !map[p.id].ingredients) map[p.id].ingredients = ingredients;
      if (brand && !map[p.id].brand) map[p.id].brand = brand;
    }
  });
  return products.map(p => map[p.id] || p);
}

/* ─── Merge, dedup, rank ─────────────────────────────────── */
function scoreProduct(p) {
  return (p.ingredients ? 4 : 0) + (p.image ? 2 : 0) + (p.brand ? 1 : 0);
}

function mergeAndRank(existing, incoming) {
  const seen = new Set(existing.map(p => p.id));
  const fresh = incoming.filter(p => p.name && p.name !== 'Unknown Product' && !seen.has(p.id));
  return [...existing, ...fresh].sort((a, b) => scoreProduct(b) - scoreProduct(a)).slice(0, 10);
}

/* ══════════════════════════════════════
   PUBLIC: searchProducts
═══════════════════════════════════════ */
export async function searchProducts(query, onUpdate = null) {
  if (!query || query.trim().length < 2)
    return { success: false, error: 'Query too short' };

  const key = `search_${query.toLowerCase().trim()}`;
  const cached = getCached(key);
  if (cached) return { success: true, products: cached };

  // Phase 1: USDA — fast, return immediately
  let usdaProducts = [];
  try {
    usdaProducts = await searchUSDA(query);
  } catch (e) {
    console.warn('USDA failed:', e.message);
  }

  const initialProducts = usdaProducts
    .filter(p => p.name && p.name !== 'Unknown Product')
    .slice(0, 10);

  // Phase 2: image enrichment + OFF in background
  if (onUpdate && initialProducts.length > 0) {
    Promise.allSettled([
      enrichWithImages(initialProducts).then(enriched => {
        setCache(key, enriched);
        onUpdate(enriched, 'images');
        return enriched;
      }),
      searchOFF(query),
    ]).then(([enrichedRes, offRes]) => {
      const base = enrichedRes.status === 'fulfilled' ? enrichedRes.value : initialProducts;
      const off  = offRes.status  === 'fulfilled' ? offRes.value  : [];
      const merged = mergeAndRank(base, off);
      setCache(key, merged);
      onUpdate(merged, 'merged');
    }).catch(() => {});
  }

  if (initialProducts.length > 0) {
    setCache(key, initialProducts);
    return { success: true, products: initialProducts };
  }

  // Fallback: wait for OFF
  try {
    const off = await searchOFF(query);
    const products = off.filter(p => p.name && p.name !== 'Unknown Product').slice(0, 10);
    if (products.length > 0) {
      setCache(key, products);
      return { success: true, products };
    }
  } catch { /* silent */ }

  return { success: false, error: 'No products found. Try a simpler term like "chips", "cola", or "biscuit".' };
}

/* ══════════════════════════════════════
   PUBLIC: fetchProductByBarcode
═══════════════════════════════════════ */
export async function fetchProductByBarcode(barcode) {
  const key = `barcode_${barcode}`;
  const cached = getCached(key);
  if (cached) return { success: true, product: cached };

  // Prefer OFF for barcodes — it has images. USDA as fallback.
  const [offRes, usdaRes] = await Promise.allSettled([
    fetchFromOFF(barcode),
    (async () => {
      const r = await timedFetch(`${USDA_BASE}/foods/search?query=${barcode}&api_key=${USDA_KEY}`, 6000);
      const d = await r.json();
      const match = (d.foods || []).find(f => f.gtinUpc === barcode);
      return match ? normaliseUSDA(match) : null;
    })(),
  ]);

  const product =
    (offRes.status  === 'fulfilled' && offRes.value)  ||
    (usdaRes.status === 'fulfilled' && usdaRes.value);

  if (product) {
    setCache(key, product);
    return { success: true, product };
  }

  return { success: false, error: `Barcode ${barcode} not found.` };
}
