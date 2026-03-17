import ingredientDB from '../data/ingredientDB.json';

/**
 * Classify a single ingredient against the database
 */
function findInDB(ingredientName) {
  const normalized = ingredientName.toLowerCase().trim();
  
  // Exact match
  let match = ingredientDB.find(item => item.name === normalized);
  if (match) return match;
  
  // Partial match — check if the ingredient contains a known name
  match = ingredientDB.find(item => normalized.includes(item.name));
  if (match) return match;
  
  // Reverse partial — check if a DB name contains the ingredient
  match = ingredientDB.find(item => item.name.includes(normalized));
  if (match) return match;
  
  return null;
}

/**
 * Classify all ingredients for a given profile
 * @param {string[]} ingredients - parsed ingredient names
 * @param {string} profile - 'general' | 'diabetic' | 'fitness' | 'child'
 * @returns {{ name, status, description, longTermEffects, isAdditive, isPreservative, isArtificial, matched }[]}
 */
export function classifyIngredients(ingredients, profile = 'general') {
  return ingredients.map(name => {
    const dbEntry = findInDB(name);
    
    if (!dbEntry) {
      return {
        name,
        status: 'unknown',
        description: 'This ingredient was not found in our database. Exercise caution.',
        longTermEffects: [],
        isAdditive: false,
        isPreservative: false,
        isArtificial: false,
        matched: false
      };
    }
    
    // Determine status based on profile
    let status = dbEntry.category; // default
    if (profile !== 'general' && dbEntry.profiles && dbEntry.profiles[profile]) {
      status = dbEntry.profiles[profile];
    }
    
    return {
      name,
      status,
      description: dbEntry.description,
      longTermEffects: dbEntry.longTermEffects || [],
      isAdditive: dbEntry.isAdditive || false,
      isPreservative: dbEntry.isPreservative || false,
      isArtificial: dbEntry.isArtificial || false,
      matched: true
    };
  });
}
