/**
 * Food Data API — USDA primary (fast) + OpenFoodFacts (background fallback + images)
 *
 * Image strategy:
 *  - USDA has no images — we enrich USDA results with OFF images in the background
 *  - For products with a gtinUpc barcode, we fetch the exact OFF product image
 *  - For products without a barcode, we use the OFF search image
 *  - Images are fetched in bulk with Promise.allSettled, then merged back
 */

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';
const USDA_KEY = import.meta.env.VITE_USDA_API_KEY || 'DEMO_KEY';
const OFF_BASE = 'https://world.openfoodfacts.org';

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

/* ─── USDA normalise ─────────────────────────────────────── */
function normaliseUSDA(item) {
  const name = item.description || '';
  return {
    id: String(item.fdcId),
    name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
    brand: item.brandOwner || item.brandName || 'Unknown Brand',
    ingredients: item.ingredients || '',
    categories: item.foodCategory?.description || item.brandedFoodCategory || '',
    image: null, // enriched separately
    nutriScore: null,
    novaGroup: null,
    barcode: item.gtinUpc || null,
    source: 'USDA',
    fdcId: item.fdcId,
  };
}

/* ─── USDA search ────────────────────────────────────────── */
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

/* ─── OpenFoodFacts normalise ────────────────────────────── */
function normaliseOFF(p) {
  return {
    id: p.code || String(Date.now()),
    name: p.product_name || p.product_name_en || 'Unknown Product',
    brand: p.brands || p.brand_owner || 'Unknown Brand',
    ingredients: p.ingredients_text || p.ingredients_text_en || '',
    categories: p.categories || '',
    image: p.image_front_small_url || p.image_url || p.image_front_url || null,
    nutriScore: p.nutriscore_grade || null,
    novaGroup: p.nova_group || null,
    barcode: p.code,
    source: 'OpenFoodFacts',
  };
}

/* ─── OFF: fetch image for a single barcode ─────────────── */
async function fetchOFFImage(barcode) {
  try {
    // Use the smaller thumbnail endpoint — much faster than full product fetch
    const url = `${OFF_BASE}/api/v0/product/${barcode}.json?fields=image_front_small_url,image_front_url,image_url,ingredients_text,brands`;
    const r = await timedFetch(url, 5000);
    const data = await r.json();
    if (data.status === 1 && data.product) {
      return {
        image: data.product.image_front_small_url || data.product.image_front_url || data.product.image_url || null,
        ingredients: data.product.ingredients_text || null,
        brand: data.product.brands || null,
      };
    }
  } catch { /* silently ignore */ }
  return null;
}

/* ─── OFF search (fallback + image source) ───────────────── */
async function searchOFF(query) {
  const url =
    `${OFF_BASE}/cgi/search.pl` +
    `?search_terms=${encodeURIComponent(query)}` +
    `&search_simple=1&action=process&json=1&page_size=10`;
  const r = await timedFetch(url, 8000);
  const data = await r.json();
  return (data.products || []).map(normaliseOFF);
}

/* ─── OFF barcode lookup ─────────────────────────────────── */
async function fetchFromOFF(barcode) {
  const r = await timedFetch(`${OFF_BASE}/api/v0/product/${barcode}.json`, 8000);
  const data = await r.json();
  if (data.status === 1 && data.product) return normaliseOFF(data.product);
  return null;
}

/* ─── Enrich USDA products with OFF images ───────────────── */
async function enrichWithImages(products) {
  // Only enrich USDA products that have a barcode and no image
  const toEnrich = products.filter(p => p.source === 'USDA' && p.barcode && !p.image);
  if (toEnrich.length === 0) return products;

  // Fetch images in parallel (max 8 at once to avoid flooding)
  const batch = toEnrich.slice(0, 8);
  const results = await Promise.allSettled(
    batch.map(p => fetchOFFImage(p.barcode))
  );

  // Merge images back into products
  const enriched = { ...Object.fromEntries(products.map(p => [p.id, p])) };
  batch.forEach((p, i) => {
    const result = results[i];
    if (result.status === 'fulfilled' && result.value) {
      const { image, ingredients, brand } = result.value;
      if (image) enriched[p.id] = { ...enriched[p.id], image };
      // Also fill in missing ingredients/brand from OFF if USDA didn't have them
      if (ingredients && !enriched[p.id].ingredients) {
        enriched[p.id] = { ...enriched[p.id], ingredients };
      }
      if (brand && enriched[p.id].brand === 'Unknown Brand') {
        enriched[p.id] = { ...enriched[p.id], brand };
      }
    }
  });

  return products.map(p => enriched[p.id] || p);
}

/* ─── Merge + dedup + rank ───────────────────────────────── */
function mergeResults(existing, incoming) {
  const seen = new Set(existing.map(p => p.id));
  const newOnes = incoming.filter(p => p.name && p.name !== 'Unknown Product' && !seen.has(p.id));
  return [...existing, ...newOnes]
    .sort((a, b) => {
      const score = p =>
        (p.ingredients ? 3 : 0) +
        (p.brand !== 'Unknown Brand' ? 1 : 0) +
        (p.image ? 2 : 0) +
        (p.source === 'USDA' ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, 10);
}

/**
 * searchProducts
 * Phase 1 (~300ms): Returns USDA results immediately
 * Phase 2 (background): Enriches with OFF images + appends OFF products
 * onUpdate is called with enriched/merged results as they arrive
 */
export async function searchProducts(query, onUpdate = null) {
  if (!query || query.trim().length < 2)
    return { success: false, error: 'Query too short' };

  const key = `search_${query.toLowerCase().trim()}`;
  const cached = getCached(key);
  if (cached) return { success: true, products: cached };

  // ── Phase 1: USDA — fast ──
  let usdaProducts = [];
  try {
    usdaProducts = await searchUSDA(query);
  } catch (e) {
    console.warn('USDA failed:', e.message);
  }

  const initialProducts = usdaProducts
    .filter(p => p.name && p.name !== 'Unknown Product')
    .slice(0, 10);

  // ── Phase 2: background enrichment ──
  if (onUpdate && initialProducts.length > 0) {
    Promise.allSettled([
      // 2a: Add images to USDA results
      enrichWithImages(initialProducts).then(enriched => {
        onUpdate(enriched, 'images');
        setCache(key, enriched);
        return enriched;
      }),
      // 2b: Fetch OFF results and merge
      searchOFF(query).then(offProducts => offProducts),
    ]).then(([enrichedResult, offResult]) => {
      const base = enrichedResult.status === 'fulfilled'
        ? enrichedResult.value
        : initialProducts;
      const off = offResult.status === 'fulfilled' ? offResult.value : [];
      const merged = mergeResults(base, off);
      setCache(key, merged);
      onUpdate(merged, 'merged');
    }).catch(() => {});
  }

  if (initialProducts.length > 0) {
    setCache(key, initialProducts);
    return { success: true, products: initialProducts };
  }

  // USDA had nothing — wait for OFF
  try {
    const offProducts = await searchOFF(query);
    const products = offProducts
      .filter(p => p.name && p.name !== 'Unknown Product')
      .slice(0, 10);
    if (products.length > 0) {
      setCache(key, products);
      return { success: true, products };
    }
  } catch (e) {
    console.warn('OFF also failed:', e.message);
  }

  return {
    success: false,
    error: 'No products found. Try a simpler or English term (e.g. "chips", "cola", "biscuit").',
  };
}

/* ─── Public: fetch by barcode ───────────────────────────── */
export async function fetchProductByBarcode(barcode) {
  const key = `barcode_${barcode}`;
  const cached = getCached(key);
  if (cached) return { success: true, product: cached };

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

  // Prefer OFF for barcode lookups since it has images
  const product =
    (offResult.status === 'fulfilled' && offResult.value) ||
    (usdaResult.status === 'fulfilled' && usdaResult.value);

  if (product) {
    setCache(key, product);
    return { success: true, product };
  }

  return { success: false, error: `Barcode ${barcode} not found.` };
}
