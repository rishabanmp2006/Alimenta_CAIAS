/**
 * OpenFoodFacts API Client
 */

const BASE_URL = 'https://world.openfoodfacts.org';

/**
 * Normalize API response to our app format
 */
function normalizeProduct(product) {
  return {
    id: product.code || product._id || Date.now().toString(),
    name: product.product_name || product.product_name_en || 'Unknown Product',
    brand: product.brands || 'Unknown Brand',
    ingredients: product.ingredients_text || product.ingredients_text_en || '',
    categories: product.categories || '',
    image: product.image_url || product.image_front_url || null,
    nutriScore: product.nutriscore_grade || null,
    novaGroup: product.nova_group || null,
  };
}

/**
 * Fetch product by barcode
 */
export async function fetchProductByBarcode(barcode) {
  try {
    const response = await fetch(`${BASE_URL}/api/v0/product/${barcode}.json`);
    const data = await response.json();
    
    if (data.status === 1 && data.product) {
      return { success: true, product: normalizeProduct(data.product) };
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
  try {
    const response = await fetch(
      `${BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10`
    );
    const data = await response.json();
    
    if (data.products && data.products.length > 0) {
      return {
        success: true,
        products: data.products
          .filter(p => p.product_name && p.ingredients_text)
          .map(normalizeProduct)
      };
    }
    return { success: false, error: 'No products found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
