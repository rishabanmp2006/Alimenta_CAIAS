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

import QuickDecision from '../components/QuickDecision';
import ProfileSelector from '../components/ProfileSelector';
import SmartSummary from '../components/SmartSummary';
import RiskDashboard from '../components/RiskDashboard';
import IngredientList from '../components/IngredientList';
import LongTermEffects from '../components/LongTermEffects';
import HiddenDangers from '../components/HiddenDangers';
import AlternativeSuggestions from '../components/AlternativeSuggestions';
import TrustScore from '../components/TrustScore';
import AIChatAssistant from '../components/AIChatAssistant';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToHistory } = useHistory();
  const [profile, setProfile] = useState('general');

  const product = location.state?.product;

  useEffect(() => {
    if (!product) navigate('/');
  }, [product, navigate]);

  const parsedIngredients = useMemo(() => {
    if (!product?.ingredients) return [];
    return parseIngredients(product.ingredients);
  }, [product]);

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
    return { classified, healthScore, trustScore, summary, effects, effectsSummary, dangers, dangersSummary, category, alternatives };
  }, [parsedIngredients, profile, product]);

  useEffect(() => {
    if (product && analysis) {
      addToHistory({ ...product, healthScore: analysis.healthScore });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (!product || !analysis) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Back + Product header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
        <button
          onClick={() => navigate('/')}
          className="shrink-0 w-9 h-9 rounded-full bg-surface-secondary flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-border-light transition-all text-[14px]"
        >
          ←
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {product.image && (
            <img src={product.image} alt={product.name} className="w-11 h-11 object-contain rounded-xl bg-surface-secondary shrink-0" />
          )}
          <div className="min-w-0">
            <h1 className="text-[18px] font-bold text-text-primary truncate">{product.name}</h1>
            <p className="text-[13px] text-text-tertiary">{product.brand}</p>
          </div>
        </div>
      </div>

      {/* Vertical layout — each section stacked */}
      <div className="space-y-8">
        {/* 1. Quick Decision */}
        <div className="animate-fade-in-up delay-1">
          <QuickDecision healthScore={analysis.healthScore} />
        </div>

        {/* 2. Profile selector */}
        <div className="animate-fade-in-up delay-2">
          <ProfileSelector selected={profile} onChange={setProfile} />
        </div>

        {/* 3. Risk Dashboard */}
        <div className="animate-fade-in-up delay-3">
          <p className="section-title">Health Score</p>
          <RiskDashboard healthScore={analysis.healthScore} classified={analysis.classified} />
        </div>

        {/* 4. Summary */}
        <div className="animate-fade-in-up delay-4">
          <SmartSummary summary={analysis.summary} productName={product.name} />
        </div>

        {/* 4.5. AI Chat Assistant */}
        <div className="animate-fade-in-up delay-4">
          <AIChatAssistant 
            product={product} 
            analysis={analysis} 
            profile={profile}
          />
        </div>

        {/* 5. Trust Score */}
        <div className="animate-fade-in-up delay-5">
          <p className="section-title">Trust</p>
          <TrustScore trustScore={analysis.trustScore} />
        </div>

        {/* 6. Long-Term Effects */}
        <div className="animate-fade-in-up delay-5">
          <LongTermEffects effects={analysis.effects} summary={analysis.effectsSummary} />
        </div>

        {/* 7. Hidden Dangers */}
        <div className="animate-fade-in-up delay-6">
          <HiddenDangers dangers={analysis.dangers} summary={analysis.dangersSummary} />
        </div>

        {/* 8. Alternatives */}
        <div className="animate-fade-in-up delay-6">
          <AlternativeSuggestions alternatives={analysis.alternatives} category={analysis.category} />
        </div>

        {/* 9. Ingredient Breakdown */}
        <div className="animate-fade-in-up delay-7">
          <IngredientList ingredients={analysis.classified} />
        </div>
      </div>
    </div>
  );
}
