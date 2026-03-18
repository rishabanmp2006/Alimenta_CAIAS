import { createContext, useContext, useState, useEffect } from 'react';

const UserProfileContext = createContext();

// Every condition and what it means
export const CONDITIONS = [
  { key: 'diabetic',    label: 'Diabetic / Pre-diabetic', emoji: '🩺', desc: 'Flags sugars, high-GI ingredients' },
  { key: 'hypertension',label: 'High Blood Pressure',     emoji: '❤️', desc: 'Flags high sodium, caffeine' },
  { key: 'pregnant',    label: 'Pregnant',                emoji: '🤰', desc: 'Flags alcohol, high-mercury fish, deli meats' },
  { key: 'child',       label: 'Feeding a Child',         emoji: '👶', desc: 'Extra strict — no artificial dyes, caffeine' },
  { key: 'vegan',       label: 'Vegan',                   emoji: '🌱', desc: 'Flags gelatin, carmine, dairy, eggs' },
  { key: 'vegetarian',  label: 'Vegetarian',              emoji: '🥗', desc: 'Flags meat-derived additives' },
  { key: 'gluten_free', label: 'Gluten Free / Coeliac',   emoji: '🌾', desc: 'Flags wheat, barley, rye, gluten' },
  { key: 'nut_allergy', label: 'Nut Allergy',             emoji: '🥜', desc: 'Flags all tree nuts and peanuts' },
  { key: 'lactose',     label: 'Lactose Intolerant',      emoji: '🥛', desc: 'Flags dairy, lactose, whey, casein' },
  { key: 'fitness',     label: 'Fitness / Bodybuilding',  emoji: '💪', desc: 'Highlights protein, flags empty calories' },
  { key: 'heart',       label: 'Heart Disease Risk',      emoji: '🫀', desc: 'Flags trans fats, saturated fat, sodium' },
  { key: 'kidney',      label: 'Kidney Disease',          emoji: '🫘', desc: 'Flags high phosphate, potassium, protein' },
  { key: 'pku',         label: 'PKU (Phenylketonuria)',   emoji: '⚗️', desc: 'Flags aspartame and phenylalanine' },
];

// Ingredient → warning rules per condition
// Each rule: { match: string[], severity: 'danger'|'warning', message: string }
export const CONDITION_RULES = {
  diabetic: [
    { match: ['sugar','high fructose corn syrup','corn syrup','glucose syrup','dextrose','fructose','maltodextrin','sucrose','glucose','invert sugar','brown sugar','raw sugar','jaggery','agave syrup','fruit juice concentrate','honey','maple syrup','molasses','coconut sugar','dates','sabudana','maida','bleached flour','enriched flour','cake flour'], severity: 'danger', message: 'Raises blood sugar — dangerous for diabetics' },
    { match: ['aspartame','sucralose','saccharin','acesulfame potassium','cyclamate'], severity: 'warning', message: 'Artificial sweetener — may still affect insulin response' },
    { match: ['white rice','bread flour','semolina','suji','rava','vermicelli','noodles'], severity: 'warning', message: 'High glycaemic index — monitor portion size' },
  ],
  hypertension: [
    { match: ['salt','sodium','sodium benzoate','sodium nitrite','sodium nitrate','sodium phosphate','monosodium glutamate','sodium metabisulphite','sodium stearoyl lactylate','sodium carbonate','sodium bicarbonate','sodium tripolyphosphate','iodised salt','soy sauce'], severity: 'danger', message: 'High sodium — raises blood pressure' },
    { match: ['caffeine','guarana','green tea extract'], severity: 'warning', message: 'Stimulant — can temporarily raise blood pressure' },
    { match: ['liquorice','licorice'], severity: 'warning', message: 'Liquorice raises blood pressure at high intake' },
  ],
  pregnant: [
    { match: ['aspartame','saccharin','cyclamate','acesulfame potassium'], severity: 'danger', message: 'Artificial sweetener — avoid during pregnancy' },
    { match: ['sodium nitrite','sodium nitrate','nitrite'], severity: 'danger', message: 'Curing salt in processed meats — avoid during pregnancy' },
    { match: ['caffeine','guarana','taurine'], severity: 'warning', message: 'Limit to <200mg/day caffeine during pregnancy' },
    { match: ['vitamin a','retinol'], severity: 'warning', message: 'Excess Vitamin A can harm foetal development' },
    { match: ['alcohol','ethanol'], severity: 'danger', message: 'Alcohol — strictly avoid during pregnancy' },
    { match: ['unpasteurised','raw milk'], severity: 'danger', message: 'Unpasteurised dairy — listeria risk during pregnancy' },
    { match: ['tbhq','bha','bht'], severity: 'warning', message: 'Synthetic antioxidant — limited safety data in pregnancy' },
  ],
  child: [
    { match: ['tartrazine','red 40','yellow 5','yellow 6','blue 1','blue 2','red 3','sunset yellow','carmoisine','ponceau 4r','brilliant black','quinoline yellow','e102','e110','e129','e122','e124','e151','e104'], severity: 'danger', message: 'Artificial dye linked to hyperactivity in children' },
    { match: ['caffeine','guarana','taurine'], severity: 'danger', message: 'Stimulant — not suitable for children' },
    { match: ['aspartame','saccharin','cyclamate','sucralose','acesulfame potassium','neotame'], severity: 'danger', message: 'Artificial sweetener — not recommended for children' },
    { match: ['sodium benzoate','benzoic acid','e211','e210'], severity: 'danger', message: 'Preservative linked to hyperactivity in children' },
    { match: ['calcium propionate','sodium propionate'], severity: 'warning', message: 'May cause behavioural issues in sensitive children' },
    { match: ['monosodium glutamate','disodium inosinate','disodium guanylate','yeast extract','ajinomoto'], severity: 'warning', message: 'Flavour enhancer — use caution with young children' },
    { match: ['alcohol','ethanol'], severity: 'danger', message: 'Alcohol — never give to children' },
    { match: ['brominated vegetable oil','potassium bromate','azodicarbonamide'], severity: 'danger', message: 'Banned additive — especially dangerous for children' },
  ],
  vegan: [
    { match: ['gelatin','gelatine'], severity: 'danger', message: 'Gelatin is derived from animal bones/skin — not vegan' },
    { match: ['carmine','cochineal','e120'], severity: 'danger', message: 'Carmine is made from crushed insects — not vegan' },
    { match: ['milk','dairy','lactose','whey','casein','cream','butter','cheese','ghee','paneer','curd','skim milk','whole milk powder','condensed milk','buttermilk'], severity: 'danger', message: 'Dairy ingredient — not vegan' },
    { match: ['egg','albumin','lysozyme'], severity: 'danger', message: 'Egg-derived — not vegan' },
    { match: ['honey'], severity: 'danger', message: 'Honey is an animal product — not vegan' },
    { match: ['l-cysteine','e920'], severity: 'warning', message: 'L-cysteine is often derived from animal hair/feathers' },
    { match: ['sodium stearoyl lactylate','e481'], severity: 'warning', message: 'May be animal-derived — check manufacturer' },
    { match: ['vitamin d','vitamin d3'], severity: 'warning', message: 'Vitamin D3 is usually from lanolin (sheep wool) — not vegan' },
  ],
  vegetarian: [
    { match: ['gelatin','gelatine'], severity: 'danger', message: 'Gelatin is derived from animal bones — not vegetarian' },
    { match: ['carmine','cochineal','e120'], severity: 'danger', message: 'Carmine is made from crushed insects — not vegetarian' },
    { match: ['lard','animal fat','beef fat','pork fat','suet'], severity: 'danger', message: 'Animal fat — not vegetarian' },
    { match: ['rennet'], severity: 'danger', message: 'Animal rennet — not vegetarian' },
    { match: ['l-cysteine','e920'], severity: 'warning', message: 'L-cysteine often from animal sources — check label' },
    { match: ['mechanically separated meat'], severity: 'danger', message: 'Meat ingredient — not vegetarian' },
  ],
  gluten_free: [
    { match: ['wheat','wheat flour','whole wheat','enriched flour','bleached flour','bread flour','cake flour','semolina','suji','rava','maida','durum','spelt','kamut','bulgur','farro'], severity: 'danger', message: 'Contains wheat/gluten — dangerous for coeliac disease' },
    { match: ['barley','malt','malt extract','malt vinegar'], severity: 'danger', message: 'Contains barley/malt — not gluten free' },
    { match: ['rye'], severity: 'danger', message: 'Contains rye — not gluten free' },
    { match: ['oats','oat flour'], severity: 'warning', message: 'Oats may be cross-contaminated with gluten — look for certified GF oats' },
    { match: ['modified starch','wheat starch'], severity: 'warning', message: 'Modified starch — may contain gluten, check source' },
  ],
  nut_allergy: [
    { match: ['peanut','peanuts','peanut oil','groundnut','groundnut oil'], severity: 'danger', message: 'Contains peanuts — severe allergen' },
    { match: ['almonds','almond','almond milk'], severity: 'danger', message: 'Contains almonds — tree nut allergen' },
    { match: ['cashews','cashew'], severity: 'danger', message: 'Contains cashews — tree nut allergen' },
    { match: ['walnuts','walnut'], severity: 'danger', message: 'Contains walnuts — tree nut allergen' },
    { match: ['hazelnuts','hazelnut'], severity: 'danger', message: 'Contains hazelnuts — tree nut allergen' },
    { match: ['pistachios','pistachio'], severity: 'danger', message: 'Contains pistachios — tree nut allergen' },
    { match: ['macadamia'], severity: 'danger', message: 'Contains macadamia — tree nut allergen' },
    { match: ['pecan'], severity: 'danger', message: 'Contains pecans — tree nut allergen' },
    { match: ['brazil nut'], severity: 'danger', message: 'Contains brazil nuts — tree nut allergen' },
    { match: ['tree nuts','mixed nuts','nut'], severity: 'danger', message: 'Contains tree nuts — allergen warning' },
    { match: ['may contain nuts','traces of nuts'], severity: 'warning', message: 'May contain nut traces — risk for severe allergies' },
  ],
  lactose: [
    { match: ['milk','dairy','lactose','whole milk','skim milk','skimmed milk','whole milk powder','skim milk powder','condensed milk','buttermilk'], severity: 'danger', message: 'Contains lactose — will cause symptoms in lactose intolerant individuals' },
    { match: ['whey','whey protein','casein','cream','butter','cheese','ghee','paneer','curd'], severity: 'warning', message: 'Dairy derivative — may contain lactose' },
    { match: ['lactalbumin','lactoglobulin'], severity: 'warning', message: 'Milk protein — may cause issues for lactose intolerant' },
  ],
  fitness: [
    { match: ['hydrogenated oil','partially hydrogenated oil','trans fat','margarine','interesterified fat'], severity: 'danger', message: 'Trans fat — seriously impairs athletic performance and recovery' },
    { match: ['high fructose corn syrup','corn syrup','dextrose','maltodextrin','sucrose','glucose syrup'], severity: 'warning', message: 'Empty calories — avoid around training sessions' },
    { match: ['artificial flavors','artificial colours','tbhq','bha','bht'], severity: 'warning', message: 'Synthetic additive — may increase oxidative stress' },
    { match: ['whey protein','whey isolate','whey concentrate','casein','pea protein','bcaa'], severity: 'safe_flag', message: '✅ Good protein source for muscle recovery' },
    { match: ['creatine','beta alanine'], severity: 'safe_flag', message: '✅ Performance supplement' },
  ],
  heart: [
    { match: ['hydrogenated oil','partially hydrogenated oil','trans fat','margarine','interesterified fat'], severity: 'danger', message: 'Trans fat — major cardiovascular risk factor' },
    { match: ['salt','sodium','sodium benzoate','sodium nitrite','monosodium glutamate','sodium phosphate'], severity: 'danger', message: 'High sodium — raises blood pressure and heart disease risk' },
    { match: ['sodium nitrite','sodium nitrate','nitrite'], severity: 'danger', message: 'Processed meat preservative — linked to cardiovascular disease' },
    { match: ['palm oil','palm kernel oil','lard','saturated fat','coconut oil'], severity: 'warning', message: 'Saturated fat — raises LDL cholesterol' },
    { match: ['caffeine','taurine','guarana'], severity: 'warning', message: 'Stimulant — can increase heart rate and blood pressure' },
    { match: ['omega 3','dha','epa','fish oil','flaxseed'], severity: 'safe_flag', message: '✅ Omega-3 supports heart health' },
  ],
  kidney: [
    { match: ['sodium','salt','sodium phosphate','sodium tripolyphosphate','dipotassium phosphate','sodium benzoate','sodium nitrite','monosodium glutamate'], severity: 'danger', message: 'High sodium — extra burden on kidneys' },
    { match: ['phosphoric acid','calcium phosphate','phosphate','sodium tripolyphosphate'], severity: 'danger', message: 'High phosphate — dangerous for kidney disease patients' },
    { match: ['potassium chloride','potassium sorbate','potassium carbonate'], severity: 'danger', message: 'High potassium — dangerous for kidney disease patients' },
    { match: ['whey protein','soy protein','pea protein','casein','protein'], severity: 'warning', message: 'High protein — kidneys must work harder to filter' },
    { match: ['oxalic acid','spinach','beets'], severity: 'warning', message: 'High oxalate — kidney stone risk' },
  ],
  pku: [
    { match: ['aspartame','e951'], severity: 'danger', message: '🚨 CONTAINS PHENYLALANINE — extremely dangerous for PKU patients' },
    { match: ['phenylalanine'], severity: 'danger', message: '🚨 Contains phenylalanine — forbidden for PKU' },
    { match: ['neotame','e961'], severity: 'danger', message: 'Contains aspartame derivative — avoid with PKU' },
  ],
};

export function UserProfileProvider({ children }) {
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('alimenta_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return !localStorage.getItem('alimenta_user_profile');
    } catch { return true; }
  });

  const saveProfile = (profile) => {
    localStorage.setItem('alimenta_user_profile', JSON.stringify(profile));
    setUserProfile(profile);
    setShowOnboarding(false);
  };

  const resetProfile = () => {
    localStorage.removeItem('alimenta_user_profile');
    setUserProfile(null);
    setShowOnboarding(true);
  };

  return (
    <UserProfileContext.Provider value={{ userProfile, showOnboarding, saveProfile, resetProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  return useContext(UserProfileContext);
}

/**
 * Analyse ingredients against the user's personal conditions
 * Returns array of personalised warnings sorted by severity
 */
export function getPersonalisedWarnings(classifiedIngredients, userProfile) {
  if (!userProfile?.conditions?.length || !classifiedIngredients?.length) return [];

  const warnings = [];
  const seen = new Set();

  for (const condition of userProfile.conditions) {
    const rules = CONDITION_RULES[condition] || [];
    for (const rule of rules) {
      for (const ingredient of classifiedIngredients) {
        const name = ingredient.name.toLowerCase();
        const matched = rule.match.some(m => name.includes(m) || m.includes(name));
        if (matched) {
          const key = `${condition}_${rule.message}`;
          if (!seen.has(key)) {
            seen.add(key);
            const conditionInfo = CONDITIONS.find(c => c.key === condition);
            warnings.push({
              condition,
              conditionLabel: conditionInfo?.label || condition,
              conditionEmoji: conditionInfo?.emoji || '⚠️',
              ingredient: ingredient.name,
              severity: rule.severity,
              message: rule.message,
            });
          }
        }
      }
    }
  }

  // Sort: danger first, then warning, then safe_flag
  const order = { danger: 0, warning: 1, safe_flag: 2 };
  return warnings.sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3));
}
