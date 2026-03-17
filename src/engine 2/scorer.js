/**
 * Health Score Scorer
 * Computes a 0-100 health score based on classified ingredients
 */

const STATUS_WEIGHTS = {
  safe: 0,
  risky: -8,
  avoid: -18,
  unknown: -5
};

/**
 * Compute health score from classified ingredients
 * @param {Array} classifiedIngredients - from classifier.js
 * @returns {{ score: number, label: string, color: string }}
 */
export function computeHealthScore(classifiedIngredients) {
  if (!classifiedIngredients || classifiedIngredients.length === 0) {
    return { score: 50, label: 'Unknown', color: '#f59e0b' };
  }

  let baseScore = 85; // Start optimistic
  
  const counts = { safe: 0, risky: 0, avoid: 0, unknown: 0 };
  
  classifiedIngredients.forEach(ing => {
    const status = ing.status || 'unknown';
    counts[status] = (counts[status] || 0) + 1;
    baseScore += (STATUS_WEIGHTS[status] || 0);
  });

  // Bonus for high ratio of safe ingredients
  const total = classifiedIngredients.length;
  const safeRatio = counts.safe / total;
  if (safeRatio > 0.8) baseScore += 5;
  if (safeRatio > 0.9) baseScore += 5;

  // Extra penalty for many avoid ingredients
  if (counts.avoid >= 3) baseScore -= 10;
  if (counts.avoid >= 5) baseScore -= 10;

  // Clamp
  const score = Math.max(0, Math.min(100, Math.round(baseScore)));

  let label, color;
  if (score >= 70) {
    label = 'Good';
    color = '#22c55e';
  } else if (score >= 40) {
    label = 'Moderate';
    color = '#f59e0b';
  } else {
    label = 'Poor';
    color = '#ef4444';
  }

  return { score, label, color };
}

/**
 * Get trust score based on ingredient matching and classification
 */
export function computeTrustScore(classifiedIngredients) {
  if (!classifiedIngredients || classifiedIngredients.length === 0) {
    return { level: 'Unknown', color: '#6b7280', description: 'No ingredients to analyze' };
  }

  const matched = classifiedIngredients.filter(i => i.matched).length;
  const total = classifiedIngredients.length;
  const matchRatio = matched / total;

  const avoidCount = classifiedIngredients.filter(i => i.status === 'avoid').length;
  const riskyCount = classifiedIngredients.filter(i => i.status === 'risky').length;

  if (matchRatio > 0.8 && avoidCount === 0 && riskyCount <= 1) {
    return {
      level: 'Good',
      color: '#22c55e',
      description: 'Most ingredients are well-known and safe. This product is trustworthy.'
    };
  } else if (matchRatio > 0.5 && avoidCount <= 2) {
    return {
      level: 'Moderate',
      color: '#f59e0b',
      description: 'Some concerns detected. Review the ingredient breakdown for details.'
    };
  } else {
    return {
      level: 'Poor',
      color: '#ef4444',
      description: 'Multiple harmful or unknown ingredients detected. Exercise caution.'
    };
  }
}
