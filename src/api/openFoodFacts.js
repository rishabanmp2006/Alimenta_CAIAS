/**
 * Enhanced Food Data API - Multi-source with caching
 * Combines OpenFoodFacts and USDA for better coverage
 */

const OPENFOODFACTS_URL = 'https://world.openfoodfacts.org';
const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY || 'DEMO_KEY';

// Simple cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

function setCache(key, value) {
  cache.set(key, { value, timestamp: Date.now() });
}

/**
 * Normalize product from OpenFoodFacts
 */
function normalizeOFF(product) {
  return {
    id: product.code || Date.now().toString(),
    name: product.product_name || product.product_name_en || 'Unknown Product',
    brand: product.brands || 'Unknown Brand',
    ingredients: product.ingredients_text || product.ingredients_text_en || '',
    categories: product.categories || '',
    image: product.image_url || product.image_front_url || null,
    nutriScore: product.nutriscore_grade || null,
    novaGroup: product.nova_group || null,
    barcode: product.code,
    source: 'OpenFoodFacts'
  };
}

/**
 * Fetch from OpenFoodFacts by barcode
 */
async function fetchFromOFF(barcode) {
  try {
    const response = await fetch(`${OPENFOODFACTS_URL}/api/v0/product/${barcode}.json`);
    const data = await response.json();
    if (data.status === 1 && data.product) {
      return normalizeOFF(data.product);
    }
  } catch (error) {
    console.error('OpenFoodFacts error:', error);
  }
  return null;
}

/**
 * Search OpenFoodFacts
 */
async function searchOFF(query) {
  try {
    const response = await fetch(
      `${OPENFOODFACTS_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=15`
    );
    const data = await response.json();
    if (data.products && data.products.length > 0) {
      return data.products
        .filter(p => p.product_name && p.ingredients_text)
        .slice(0, 10)
        .map(normalizeOFF);
    }
  } catch (error) {
    console.error('OpenFoodFacts search error:', error);
  }
  return [];
}

/**
 * Fetch product by barcode
 */
export async function fetchProductByBarcode(barcode) {
  const cacheKey = `barcode_${barcode}`;
  const cached = getCached(cacheKey);
  if (cached) return { success: true, product: cached };

  try {
    const product = await fetchFromOFF(barcode);
    if (product) {
      setCache(cacheKey, product);
      return { success: true, product };
    }
    return { success: false, error: 'Product not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Search products by name
 */
export async function searchProducts(query) {
  if (!query || query.trim().length < 2) {
    return { success: false, error: 'Query too short' };
  }

  const cacheKey = `search_${query.toLowerCase().trim()}`;
  const cached = getCached(cacheKey);
  if (cached) return { success: true, products: cached };

  try {
    const products = await searchOFF(query);
    if (products.length > 0) {
      setCache(cacheKey, products);
      return { success: true, products };
    }
    return { success: false, error: 'No products found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Clear cache
 */
export function clearCache() {
  cache.clear();
}
