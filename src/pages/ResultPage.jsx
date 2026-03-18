import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { parseIngredients, detectCategory } from '../engine/parser';
import { classifyIngredients } from '../engine/classifier';
import { computeHealthScore, computeTrustScore } from '../engine/scorer';
import { generateSummary } from '../engine/summary';
import { getLongTermEffects, getLongTermSummary } from '../engine/longTermEffects';
import { detectHiddenDangers, getDangerSummary } from '../engine/hiddenDangers';
import { getAlternatives } from '../engine/alternatives';
import { useHistory } from '../hooks/useHistory';
import { useStreak } from '../hooks/useStreak';
import { useUserProfile, getPersonalisedWarnings } from '../contexts/UserProfileContext';

import QuickDecision from '../components/QuickDecision';
import PersonalisedWarnings from '../components/PersonalisedWarnings';
import ProfileSelector from '../components/ProfileSelector';
import SmartSummary from '../components/SmartSummary';
import RiskDashboard from '../components/RiskDashboard';
import IngredientList from '../components/IngredientList';
import LongTermEffects from '../components/LongTermEffects';
import HiddenDangers from '../components/HiddenDangers';
import AlternativeSuggestions from '../components/AlternativeSuggestions';
import TrustScore from '../components/TrustScore';
import AIChatAssistant from '../components/AIChatAssistant';
import ShareButton from '../components/ShareButton';
import NutriScoreLabel from '../components/NutriScoreLabel';
import AdditiveAlerts from '../components/AdditiveAlerts';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToHistory } = useHistory();
  const { streak, recordScan } = useStreak();
  const { userProfile } = useUserProfile();
  const [profile, setProfile] = useState('general');
  const savedIdRef = useRef(null);

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
    if (product && analysis && savedIdRef.current !== product.id) {
      savedIdRef.current = product.id;
      addToHistory({ ...product, healthScore: analysis.healthScore });
      recordScan();
    }
  }, [product, analysis, addToHistory, recordScan]);

  const personalisedWarnings = analysis
    ? getPersonalisedWarnings(analysis.classified, userProfile)
    : [];

  if (!product || !analysis) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-text-tertiary text-[15px]">No ingredient data available for this product.</p>
        <p className="text-text-tertiary text-[13px] mt-1 mb-6">The product may not have an ingredient list in the database.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-text-primary text-white rounded-full text-[13px] font-semibold"
        >
          ← Search Another Product
        </button>
      </div>
    );
  }

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

      <div className="space-y-6">

        {/* 0. Personalised warnings — always shown first */}
        {userProfile?.conditions?.length > 0 && (
          <div className="animate-fade-in-up">
            <PersonalisedWarnings
              warnings={personalisedWarnings}
              userName={userProfile.name}
            />
          </div>
        )}

        {/* 1. Red flag alerts — shown first if any */}
        {analysis.classified.some(i => i.status === 'avoid') && (
          <div className="animate-fade-in-up">
            <AdditiveAlerts classified={analysis.classified} />
          </div>
        )}

        {/* 2. Quick Decision */}
        <div className="animate-fade-in-up delay-1">
          <QuickDecision healthScore={analysis.healthScore} />
        </div>

        {/* 3. Nutri-Score */}
        <div className="animate-fade-in-up delay-1">
          <NutriScoreLabel nutriScore={product.nutriScore} healthScore={analysis.healthScore} />
        </div>

        {/* 4. Profile selector */}
        <div className="animate-fade-in-up delay-2">
          <ProfileSelector selected={profile} onChange={setProfile} />
        </div>

        {/* 5. Risk Dashboard */}
        <div className="animate-fade-in-up delay-3">
          <p className="section-title">Health Score</p>
          <RiskDashboard healthScore={analysis.healthScore} classified={analysis.classified} />
        </div>

        {/* 6. Summary */}
        <div className="animate-fade-in-up delay-4">
          <SmartSummary summary={analysis.summary} productName={product.name} />
        </div>

        {/* 7. AI Chat Assistant */}
        <div className="animate-fade-in-up delay-4">
          <AIChatAssistant product={product} analysis={analysis} profile={profile} />
        </div>

        {/* 8. Trust Score */}
        <div className="animate-fade-in-up delay-5">
          <p className="section-title">Trust</p>
          <TrustScore trustScore={analysis.trustScore} />
        </div>

        {/* 9. Long-Term Effects */}
        <div className="animate-fade-in-up delay-5">
          <LongTermEffects effects={analysis.effects} summary={analysis.effectsSummary} />
        </div>

        {/* 10. Hidden Dangers */}
        <div className="animate-fade-in-up delay-6">
          <HiddenDangers dangers={analysis.dangers} summary={analysis.dangersSummary} />
        </div>

        {/* 11. Alternatives */}
        <div className="animate-fade-in-up delay-6">
          <AlternativeSuggestions alternatives={analysis.alternatives} category={analysis.category} />
        </div>

        {/* 12. Ingredient Breakdown */}
        <div className="animate-fade-in-up delay-7">
          <IngredientList ingredients={analysis.classified} />
        </div>

        {/* 13. Share + Scan Another */}
        <div className="animate-fade-in-up delay-7 space-y-3 pb-8">
          <ShareButton product={product} healthScore={analysis.healthScore} />
          <button
            onClick={() => navigate('/')}
            className="w-full card p-4 text-center text-[14px] font-semibold text-text-secondary hover:text-text-primary transition-all"
          >
            🔍 Scan Another Product
          </button>
          <button
            onClick={() => navigate('/compare')}
            className="w-full card p-4 text-center text-[14px] font-semibold text-text-secondary hover:text-text-primary transition-all"
          >
            ⚖️ Compare with Another Product
          </button>
        </div>

      </div>
    </div>
  );
}
