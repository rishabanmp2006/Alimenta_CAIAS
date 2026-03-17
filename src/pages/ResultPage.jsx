import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { parseIngredients, detectCategory } from '../engine/parser';
import { classifyIngredients } from '../engine/classifier';
import { computeHealthScore, computeTrustScore } from '../engine/scorer';
import { generateSummary } from '../engine/summary';
import { getLongTermEffects, getLongTermSummary } from '../engine/longTermEffects';
import { detectHiddenDangers, getDangerSummary } from '../engine/hiddenDangers';
import { getAlternatives } from '../engine/alternatives';
import { useHistory } from '../hooks/useHistory';

import RiskDashboard from '../components/RiskDashboard';
import SmartSummary from '../components/SmartSummary';
import ProfileSelector from '../components/ProfileSelector';
import IngredientList from '../components/IngredientList';
import LongTermEffects from '../components/LongTermEffects';
import HiddenDangers from '../components/HiddenDangers';
import AlternativeSuggestions from '../components/AlternativeSuggestions';
import QuickDecision from '../components/QuickDecision';
import TrustScore from '../components/TrustScore';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToHistory } = useHistory();
  const [profile, setProfile] = useState('general');
  
  const product = location.state?.product;

  useEffect(() => {
    if (!product) {
      navigate('/');
    }
  }, [product, navigate]);

  // Parse ingredients once
  const parsedIngredients = useMemo(() => {
    if (!product?.ingredients) return [];
    return parseIngredients(product.ingredients);
  }, [product]);

  // All analysis is profile-dependent
  const analysis = useMemo(() => {
    if (parsedIngredients.length === 0) return null;

    const classified = classifyIngredients(parsedIngredients, profile);
    const healthScore = computeHealthScore(classified);
    const trustScore = computeTrustScore(classified);
    const summary = generateSummary(classified, healthScore, profile, product?.name);
    const effects = getLongTermEffects(classified);
    const effectsSummary = getLongTermSummary(effects);
    const dangers = detectHiddenDangers(classified);
    const dangersSummary = getDangerSummary(dangers);
    const category = detectCategory(product?.name, parsedIngredients);
    const alternatives = getAlternatives(category);

    return {
      classified,
      healthScore,
      trustScore,
      summary,
      effects,
      effectsSummary,
      dangers,
      dangersSummary,
      category,
      alternatives,
    };
  }, [parsedIngredients, profile, product]);

  // Save to history on first load
  useEffect(() => {
    if (product && analysis) {
      addToHistory({
        ...product,
        healthScore: analysis.healthScore,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (!product || !analysis) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button + Product header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
        <button
          onClick={() => navigate('/')}
          className="shrink-0 w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center text-slate-400 hover:text-accent hover:bg-accent/10 transition-all"
        >
          ←
        </button>
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="w-14 h-14 object-contain rounded-lg bg-white/5 shrink-0"
            />
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-200 truncate">{product.name}</h1>
            <p className="text-sm text-slate-500">{product.brand}</p>
          </div>
        </div>
      </div>

      {/* Quick Decision */}
      <div className="mb-6 animate-fade-in-up delay-100">
        <QuickDecision healthScore={analysis.healthScore} />
      </div>

      {/* Profile + Summary row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="animate-fade-in-up delay-200">
          <ProfileSelector selected={profile} onChange={setProfile} />
        </div>
        <div className="animate-fade-in-up delay-200">
          <SmartSummary summary={analysis.summary} productName={product.name} />
        </div>
      </div>

      {/* Risk Dashboard */}
      <div className="mb-6 animate-fade-in-up delay-300">
        <RiskDashboard healthScore={analysis.healthScore} classified={analysis.classified} />
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-6">
          <div className="animate-fade-in-up delay-300">
            <LongTermEffects effects={analysis.effects} summary={analysis.effectsSummary} />
          </div>
          <div className="animate-fade-in-up delay-400">
            <HiddenDangers dangers={analysis.dangers} summary={analysis.dangersSummary} />
          </div>
        </div>
        <div className="space-y-6">
          <div className="animate-fade-in-up delay-300">
            <TrustScore trustScore={analysis.trustScore} />
          </div>
          <div className="animate-fade-in-up delay-400">
            <AlternativeSuggestions alternatives={analysis.alternatives} category={analysis.category} />
          </div>
        </div>
      </div>

      {/* Ingredient Breakdown — full width */}
      <div className="animate-fade-in-up delay-500">
        <IngredientList ingredients={analysis.classified} />
      </div>
    </div>
  );
}
