/**
 * Ingredient Parser
 * Parses raw ingredient strings into a normalized array
 */

export function parseIngredients(rawString) {
  if (!rawString || typeof rawString !== 'string') return [];

  // Remove content in square brackets (e.g., [organic])
  let cleaned = rawString.replace(/\[.*?\]/g, '');
  
  // Handle parenthesized sub-ingredients: "sugar (cane sugar, molasses)" → "sugar, cane sugar, molasses"
  cleaned = cleaned.replace(/\(([^)]+)\)/g, ', $1');
  
  // Remove percentages like "10%" or "2.5%"
  cleaned = cleaned.replace(/\d+\.?\d*\s*%/g, '');
  
  // Remove E-codes descriptions but keep the E-code: "E330 (citric acid)" → "E330, citric acid"
  cleaned = cleaned.replace(/\b(E\d{3,4}[a-z]?)\b/gi, '$1');
  
  // Split by comma, semicolon, or period
  const parts = cleaned.split(/[,;.]+/);
  
  // Normalize each ingredient
  return parts
    .map(part => part.trim().toLowerCase())
    .filter(part => part.length > 1)
    .map(part => {
      // Remove leading "and", "or", "contains"
      return part
        .replace(/^(and|or|contains|may contain|less than)\s+/i, '')
        .replace(/\s+/g, ' ')
        .trim();
    })
    .filter(part => part.length > 1);
}

/**
 * Try to detect product category from product name or ingredients
 */
export function detectCategory(productName = '', ingredients = []) {
  const name = productName.toLowerCase();
  const allText = [name, ...ingredients].join(' ');
  
  const categoryMap = {
    'chocolate spread': ['nutella', 'chocolate spread', 'hazelnut spread', 'cocoa spread'],
    'soda': ['coca-cola', 'pepsi', 'soda', 'cola', 'carbonated', 'soft drink', 'fanta', 'sprite', 'mountain dew'],
    'chips': ['chips', 'crisps', 'doritos', 'lays', 'pringles', 'cheetos'],
    'candy': ['candy', 'sweets', 'gummy', 'skittles', 'haribo', 'jelly beans'],
    'cereal': ['cereal', 'corn flakes', 'cheerios', 'granola', 'muesli', 'frosties'],
    'instant noodles': ['noodles', 'ramen', 'maggi', 'instant noodle', 'cup noodle'],
    'energy drink': ['energy drink', 'red bull', 'monster', 'rockstar', 'energy'],
    'processed meat': ['sausage', 'hot dog', 'bacon', 'salami', 'ham', 'deli meat', 'bologna'],
    'ice cream': ['ice cream', 'gelato', 'frozen dessert', 'sorbet', 'popsicle'],
    'juice': ['juice', 'nectar', 'fruit drink', 'lemonade', 'fruit punch']
  };
  
  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(kw => allText.includes(kw))) {
      return category;
    }
  }
  return 'default';
}
