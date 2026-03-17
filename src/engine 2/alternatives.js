import alternativesDB from '../data/alternativesDB.json';

/**
 * Get healthier alternatives based on product category
 * @param {string} category - detected category from parser.js
 * @returns {Array<{ name, reason, healthScore }>}
 */
export function getAlternatives(category) {
  const key = category.toLowerCase();
  return alternativesDB[key] || alternativesDB['default'];
}
