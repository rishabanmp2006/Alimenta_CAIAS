/**
 * Hidden Danger Detector
 * Identifies additives, preservatives, and artificial ingredients
 */

/**
 * Detect hidden dangers from classified ingredients
 * @param {Array} classifiedIngredients
 * @returns {{ additives: Array, preservatives: Array, artificial: Array, totalDangers: number }}
 */
export function detectHiddenDangers(classifiedIngredients) {
  const additives = classifiedIngredients.filter(i => i.isAdditive);
  const preservatives = classifiedIngredients.filter(i => i.isPreservative);
  const artificial = classifiedIngredients.filter(i => i.isArtificial);
  
  // De-duplicate across categories for total count
  const dangerSet = new Set();
  [...additives, ...preservatives, ...artificial].forEach(i => dangerSet.add(i.name));

  return {
    additives,
    preservatives,
    artificial,
    totalDangers: dangerSet.size
  };
}

/**
 * Get a danger summary string
 */
export function getDangerSummary(dangers) {
  const parts = [];
  
  if (dangers.additives.length > 0) {
    parts.push(`${dangers.additives.length} additive${dangers.additives.length > 1 ? 's' : ''}`);
  }
  if (dangers.preservatives.length > 0) {
    parts.push(`${dangers.preservatives.length} preservative${dangers.preservatives.length > 1 ? 's' : ''}`);
  }
  if (dangers.artificial.length > 0) {
    parts.push(`${dangers.artificial.length} artificial ingredient${dangers.artificial.length > 1 ? 's' : ''}`);
  }
  
  if (parts.length === 0) return 'No hidden dangers detected.';
  return `Contains ${parts.join(', ')}.`;
}
