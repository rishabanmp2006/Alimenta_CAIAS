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
  const unknown = classified.filter(i => i.status === 'unknown');

  // Calculate percentages for detailed breakdown
  const totalIngredients = classified.length;
  const safePercent = Math.round((safeIngredients.length / totalIngredients) * 100);
  const riskyPercent = Math.round((riskyIngredients.length / totalIngredients) * 100);
  const avoidPercent = Math.round((avoidIngredients.length / totalIngredients) * 100);

  // Opening line based on score with more context
  if (healthScore.score >= 75) {
    parts.push(`✅ ${productName} scores well in our health analysis with a ${healthScore.score}/100 rating.`);
    parts.push(`${safePercent}% of ingredients are classified as safe.`);
  } else if (healthScore.score >= 50) {
    parts.push(`⚠️ ${productName} has some areas of concern based on its ingredients, scoring ${healthScore.score}/100.`);
    parts.push(`Only ${safePercent}% of ingredients are safe, while ${riskyPercent}% are moderately risky.`);
  } else {
    parts.push(`❌ ${productName} raises significant health concerns with a low score of ${healthScore.score}/100.`);
    parts.push(`${avoidPercent}% of ingredients should be avoided, and only ${safePercent}% are considered safe.`);
  }

  // Detailed ingredient breakdown
  if (avoidIngredients.length > 0) {
    const names = avoidIngredients.slice(0, 3).map(i => i.name).join(', ');
    const remaining = avoidIngredients.length - 3;
    if (remaining > 0) {
      parts.push(`Contains ${avoidIngredients.length} potentially harmful ingredients including ${names}, and ${remaining} more.`);
    } else {
      parts.push(`Contains potentially harmful ingredients: ${names}.`);
    }
    
    // Add specific concerns about harmful ingredients
    const concerns = avoidIngredients
      .slice(0, 2)
      .map(i => i.description)
      .filter(Boolean);
    if (concerns.length > 0) {
      parts.push(`⚠️ Key concerns: ${concerns.join(' ')}`);
    }
  }

  if (riskyIngredients.length > 2) {
    parts.push(`Has ${riskyIngredients.length} ingredients flagged as moderate risk (${riskyPercent}% of total).`);
    const riskyNames = riskyIngredients.slice(0, 2).map(i => i.name).join(', ');
    parts.push(`Notable risky ingredients: ${riskyNames}.`);
  }

  // More detailed additive analysis
  if (additives.length > 3) {
    parts.push(`⚗️ Contains ${additives.length} additives (${Math.round((additives.length / totalIngredients) * 100)}% of ingredients).`);
    if (additives.length > 5) {
      parts.push(`This is a heavily processed product with numerous artificial additives.`);
    }
  }

  if (preservatives.length > 0) {
    const preservativeNames = preservatives.slice(0, 2).map(i => i.name).join(', ');
    parts.push(`Contains ${preservatives.length} preservative${preservatives.length > 1 ? 's' : ''}: ${preservativeNames}${preservatives.length > 2 ? ', and more' : ''}.`);
  }

  if (artificial.length > 0) {
    parts.push(`🧪 Includes ${artificial.length} artificial ingredient${artificial.length > 1 ? 's' : ''} (${Math.round((artificial.length / totalIngredients) * 100)}% of total).`);
  }

  // Unknown ingredients warning
  if (unknown.length > 0) {
    parts.push(`⚠️ ${unknown.length} ingredient${unknown.length > 1 ? 's' : ''} could not be fully identified in our database. Exercise caution.`);
  }

  // Nutritional composition insight
  if (safeIngredients.length > riskyIngredients.length + avoidIngredients.length) {
    parts.push(`💚 On a positive note, the majority of ingredients (${safePercent}%) are natural and safe.`);
  } else if (safeIngredients.length < 3 && totalIngredients > 5) {
    parts.push(`🔴 Very few natural ingredients detected. This product is highly processed.`);
  }

  // Profile-specific detailed advice
  if (profile !== 'general') {
    const profileLabel = PROFILE_LABELS[profile];
    if (profile === 'diabetic') {
      const sugaryIngredients = classified.filter(i => 
        i.name.includes('sugar') || i.name.includes('syrup') || i.name.includes('glucose') || i.name.includes('fructose')
      );
      if (sugaryIngredients.length > 0) {
        parts.push(`🩺 For diabetics: Contains ${sugaryIngredients.length} sugar-based ingredient${sugaryIngredients.length > 1 ? 's' : ''} (${sugaryIngredients.map(i => i.name).slice(0, 2).join(', ')}).`);
      }
    } else if (profile === 'fitness') {
      if (artificial.length > 2 || additives.length > 3) {
        parts.push(`💪 For fitness goals: High artificial content may impact recovery and performance.`);
      }
    } else if (profile === 'child') {
      if (avoidIngredients.length > 0 || artificial.length > 2) {
        parts.push(`👶 For children: Contains ingredients that may affect development and behavior.`);
      }
    }
    
    if (healthScore.score < 60) {
      parts.push(`❌ Not recommended for ${profileLabel}.`);
    } else if (avoidIngredients.length > 0 || riskyIngredients.length > 2) {
      parts.push(`⚠️ Consume with caution if you are part of ${profileLabel}.`);
    } else {
      parts.push(`✅ Suitable for ${profileLabel} with moderation.`);
    }
  }

  // Closing recommendation with specific advice
  if (healthScore.score >= 75) {
    parts.push('✅ Generally suitable for regular consumption. Consider as a staple option.');
  } else if (healthScore.score >= 60) {
    parts.push('⚠️ Acceptable in moderation. Limit to occasional consumption (1-2 times per week).');
  } else if (healthScore.score >= 40) {
    parts.push('⚠️ Moderate consumption is strongly advised. Reserve for rare treats only.');
  } else {
    parts.push('❌ Not recommended for daily consumption. Consider healthier alternatives.');
  }

  // Add processing level insight
  const processingLevel = additives.length + preservatives.length + artificial.length;
  if (processingLevel > 10) {
    parts.push('🏭 This is an ultra-processed food (NOVA Group 4). Fresh, whole foods are recommended instead.');
  } else if (processingLevel > 5) {
    parts.push('🏭 This is a processed food product. Minimize consumption when possible.');
  }

  return parts.join(' ');
}
