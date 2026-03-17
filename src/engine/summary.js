/**
 * Smart Summary Generator
 * Creates human-readable health summaries from analysis results
 */

const PROFILE_LABELS = {
  general: 'the general population',
  diabetic: 'individuals managing diabetes',
  fitness: 'fitness-focused individuals',
  child: 'children'
};

/**
 * Generate a smart, human-readable summary
 * @param {Array} classified - classified ingredients
 * @param {{ score, label }} healthScore - from scorer
 * @param {string} profile - user profile
 * @param {string} productName - optional product name
 * @returns {string}
 */
export function generateSummary(classified, healthScore, profile = 'general', productName = 'This product') {
  const parts = [];
  const avoidIngredients = classified.filter(i => i.status === 'avoid');
  const riskyIngredients = classified.filter(i => i.status === 'risky');
  const safeIngredients = classified.filter(i => i.status === 'safe');
  const additives = classified.filter(i => i.isAdditive);
  const preservatives = classified.filter(i => i.isPreservative);
  const artificial = classified.filter(i => i.isArtificial);

  // Opening line based on score
  if (healthScore.score >= 75) {
    parts.push(`${productName} scores well in our health analysis.`);
  } else if (healthScore.score >= 50) {
    parts.push(`${productName} has some areas of concern based on its ingredients.`);
  } else {
    parts.push(`${productName} raises significant health concerns.`);
  }

  // Ingredient highlights
  if (avoidIngredients.length > 0) {
    const names = avoidIngredients.slice(0, 3).map(i => i.name).join(', ');
    parts.push(`Contains potentially harmful ingredients including ${names}.`);
  }

  if (riskyIngredients.length > 2) {
    parts.push(`Has ${riskyIngredients.length} ingredients flagged as moderate risk.`);
  }

  // Additives / preservatives
  if (additives.length > 3) {
    parts.push(`Contains ${additives.length} additives.`);
  }

  if (preservatives.length > 0) {
    parts.push(`Contains preservatives.`);
  }

  if (artificial.length > 0) {
    parts.push(`Includes ${artificial.length} artificial ingredient${artificial.length > 1 ? 's' : ''}.`);
  }

  // Profile-specific advice
  if (profile !== 'general') {
    const profileLabel = PROFILE_LABELS[profile];
    if (healthScore.score < 60) {
      parts.push(`Not recommended for ${profileLabel}.`);
    } else if (avoidIngredients.length > 0 || riskyIngredients.length > 2) {
      parts.push(`Consume with caution if you are part of ${profileLabel}.`);
    }
  }

  // Closing recommendation
  if (healthScore.score >= 75) {
    parts.push('Generally suitable for regular consumption.');
  } else if (healthScore.score >= 50) {
    parts.push('Moderate consumption is advised.');
  } else {
    parts.push('Not recommended for daily consumption.');
  }

  return parts.join(' ');
}
