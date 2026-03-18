import ingredientDB from '../data/ingredientDB.json';

// Pre-build a lookup map for O(1) exact lookups
const dbByName = new Map(ingredientDB.map(item => [item.name.toLowerCase().trim(), item]));

// E-number → common name mapping for European additives
const E_NUMBERS = {
  'e100':'turmeric','e102':'tartrazine','e104':'quinoline yellow','e110':'yellow 6',
  'e120':'carmine','e122':'carmoisine','e123':'amaranth','e124':'red 2g',
  'e127':'red 3','e129':'red 40','e131':'blue 2','e132':'indigo carmine',
  'e133':'blue 1','e140':'chlorophylls','e150a':'caramel colour','e150b':'caramel colour',
  'e150c':'caramel colour','e150d':'caramel colour','e160a':'beta carotene',
  'e160b':'annatto','e171':'titanium dioxide','e200':'sorbic acid',
  'e202':'potassium sorbate','e210':'benzoic acid','e211':'sodium benzoate',
  'e220':'sulphur dioxide','e221':'sodium sulphite','e223':'sodium metabisulphite',
  'e250':'sodium nitrite','e251':'sodium nitrate','e260':'acetic acid',
  'e270':'lactic acid','e280':'propionic acid','e282':'calcium propionate',
  'e300':'ascorbic acid','e301':'sodium ascorbate','e306':'vitamin e',
  'e320':'bha','e321':'bht','e322':'lecithin','e407':'carrageenan',
  'e410':'locust bean gum','e412':'guar gum','e415':'xanthan gum',
  'e420':'sorbitol','e421':'mannitol','e422':'glycerol',
  'e440':'pectin','e450':'sodium phosphate','e471':'mono and diglycerides',
  'e472e':'mono and diglycerides','e476':'polyglycerol polyricinoleate',
  'e481':'sodium stearoyl lactylate','e500':'sodium bicarbonate',
  'e503':'ammonium carbonate','e621':'monosodium glutamate',
  'e627':'disodium guanylate','e631':'disodium inosinate',
  'e951':'aspartame','e952':'cyclamate','e954':'saccharin',
  'e955':'sucralose','e960':'stevia','e965':'maltitol',
  'e967':'xylitol','e968':'erythritol',
};

/**
 * Resolve E-number to common name
 */
function resolveENumber(name) {
  const clean = name.toLowerCase().trim().replace(/\s+/g, '');
  // Match patterns like "e102", "e-102", "(e102)"
  const match = clean.match(/e-?(\d{3,4}[a-z]?)/);
  if (match) {
    const key = 'e' + match[1];
    return E_NUMBERS[key] || null;
  }
  return null;
}

/**
 * Multi-strategy ingredient lookup
 */
function findInDB(ingredientName) {
  const raw = ingredientName.toLowerCase().trim();

  // 1. Exact match
  if (dbByName.has(raw)) return dbByName.get(raw);

  // 2. E-number resolution
  const eName = resolveENumber(raw);
  if (eName && dbByName.has(eName)) return dbByName.get(eName);

  // 3. Strip bracketed content e.g. "sugar (as glucose)" → "sugar"
  const stripped = raw.replace(/\(.*?\)/g, '').trim();
  if (stripped !== raw && dbByName.has(stripped)) return dbByName.get(stripped);

  // 4. Strip common prefixes: "partially", "hydrogenated", "refined", "modified"
  const prefixStripped = raw
    .replace(/^(partially |fully |refined |modified |enriched |bleached |defatted |low fat |non-fat |skimmed )/g, '')
    .trim();
  if (prefixStripped !== raw && dbByName.has(prefixStripped)) return dbByName.get(prefixStripped);

  // 5. Substring — DB name appears inside ingredient name
  for (const [key, entry] of dbByName) {
    if (raw.includes(key) && key.length > 3) return entry;
  }

  // 6. Reverse substring — ingredient name appears inside DB name
  for (const [key, entry] of dbByName) {
    if (key.includes(raw) && raw.length > 3) return entry;
  }

  // 7. Word-level match — any DB key word appears in ingredient words
  const words = raw.split(/[\s,()/-]+/).filter(w => w.length > 3);
  for (const word of words) {
    if (dbByName.has(word)) return dbByName.get(word);
  }

  return null;
}

/**
 * Classify all ingredients for a given profile
 */
export function classifyIngredients(ingredients, profile = 'general') {
  return ingredients.map(name => {
    const dbEntry = findInDB(name);

    if (!dbEntry) {
      // Heuristic classification for unknowns
      const lower = name.toLowerCase();
      const isLikelyAdditive = /\d{3}|e\d{3}|colour|color|flavor|flavour|preserv|emulsif|stabiliz|thicken|sweetener|acidity/.test(lower);
      const isLikelySafe = /water|salt|oil|flour|sugar|milk|egg|cream|butter|spice|extract|powder|juice/.test(lower);

      return {
        name,
        status: isLikelyAdditive ? 'risky' : isLikelySafe ? 'safe' : 'unknown',
        description: isLikelyAdditive
          ? 'This appears to be a food additive not in our database. Use caution.'
          : 'Not found in our database. May be safe or a proprietary ingredient.',
        longTermEffects: [],
        isAdditive: isLikelyAdditive,
        isPreservative: false,
        isArtificial: isLikelyAdditive,
        matched: false,
      };
    }

    // Profile-specific override
    let status = dbEntry.category;
    if (profile !== 'general' && dbEntry.profiles?.[profile]) {
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
      matched: true,
    };
  });
}
