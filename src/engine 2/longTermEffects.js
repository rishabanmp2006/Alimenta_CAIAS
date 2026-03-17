/**
 * Long-Term Effects Engine
 * Aggregates and de-duplicates long-term health effects from flagged ingredients
 */

const SEVERITY_MAP = {
  'Cancer risk': 5,
  'Possible carcinogenicity': 5,
  'Increased cancer risk': 5,
  'Possible carcinogen formation': 5,
  'DNA damage': 5,
  'Heart disease': 4,
  'Stroke': 4,
  'Cardiovascular disease': 4,
  'Cardiovascular issues': 4,
  'Elevated LDL cholesterol': 4,
  'Elevated cholesterol': 4,
  'Type 2 diabetes': 4,
  'Fatty liver disease': 4,
  'Fatty liver risk': 4,
  'Liver enlargement': 4,
  'Kidney damage': 4,
  'Kidney strain': 3,
  'Possible kidney damage with excess': 3,
  'Endocrine disruption': 4,
  'Possible DNA damage': 4,
  'Gut inflammation': 3,
  'Possible gut damage': 3,
  'Digestive inflammation': 3,
  'Immune system suppression': 4,
  'Potential neurological effects': 3,
  'Possible neurotoxicity with chronic excess': 3,
  'Formation of nitrosamines': 4,
  'Metabolic syndrome': 3,
  'Obesity': 3,
  'Weight gain': 2,
  'Insulin resistance': 3,
  'Blood sugar spikes': 2,
  'Possible glucose intolerance': 2,
  'Inflammation': 3,
  'Microbiome disruption': 2,
  'Gut microbiome disruption': 2,
  'Gut microbiome changes': 2,
  'Gut bacteria disruption': 2,
  'Hyperactivity': 2,
  'Hyperactivity in children': 2,
  'Allergic reactions': 2,
  'Skin irritation': 1,
  'Asthma triggers': 2,
  'Headaches': 1,
  'Possible allergic reactions': 1,
  'Unknown long-term effects': 1,
  'Possible metabolic effects': 1,
  'Water retention': 1,
  'Hypertension': 3,
  'Possible digestive issues': 1,
  'Tooth decay': 1,
  'Possible carcinogenicity': 4
};

/**
 * Get aggregated long-term effects
 * @param {Array} classifiedIngredients
 * @returns {{ effect: string, severity: number, sources: string[] }[]}
 */
export function getLongTermEffects(classifiedIngredients) {
  const effectMap = new Map();

  classifiedIngredients.forEach(ing => {
    if (ing.status === 'avoid' || ing.status === 'risky') {
      (ing.longTermEffects || []).forEach(effect => {
        if (effectMap.has(effect)) {
          effectMap.get(effect).sources.push(ing.name);
        } else {
          effectMap.set(effect, {
            effect,
            severity: SEVERITY_MAP[effect] || 2,
            sources: [ing.name]
          });
        }
      });
    }
  });

  // Sort by severity (highest first)
  return Array.from(effectMap.values())
    .sort((a, b) => b.severity - a.severity);
}

/**
 * Get a summary statement about long-term effects
 */
export function getLongTermSummary(effects) {
  if (effects.length === 0) {
    return 'No significant long-term health risks identified from the ingredients.';
  }
  
  const severe = effects.filter(e => e.severity >= 4);
  const moderate = effects.filter(e => e.severity >= 2 && e.severity < 4);

  const parts = ['Frequent consumption may lead to'];
  
  if (severe.length > 0) {
    parts.push(severe.slice(0, 3).map(e => e.effect.toLowerCase()).join(', '));
  }
  
  if (moderate.length > 0 && severe.length > 0) {
    parts[parts.length - 1] += ',';
    parts.push('as well as ' + moderate.slice(0, 2).map(e => e.effect.toLowerCase()).join(' and '));
  } else if (moderate.length > 0) {
    parts.push(moderate.slice(0, 3).map(e => e.effect.toLowerCase()).join(', '));
  }

  return parts.join(' ') + '.';
}
