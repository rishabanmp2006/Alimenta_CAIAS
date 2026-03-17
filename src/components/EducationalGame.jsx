import { useState, useEffect } from 'react';
import ingredientDB from '../data/ingredientDB.json';

export default function EducationalGame() {
  const [gameMode, setGameMode] = useState(null); // null, 'quiz', 'drag'
  const [currentIngredient, setCurrentIngredient] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const getRandomIngredient = () => {
    const randomIndex = Math.floor(Math.random() * ingredientDB.length);
    return ingredientDB[randomIndex];
  };

  const startQuiz = () => {
    setGameMode('quiz');
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTotalAttempts(0);
    setShowResults(false);
    setCurrentIngredient(getRandomIngredient());
  };

  const checkAnswer = (userAnswer) => {
    setTotalAttempts(totalAttempts + 1);
    const correct = userAnswer === currentIngredient.category;

    if (correct) {
      setScore(score + 10 + streak * 2);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(prev => Math.max(prev, newStreak));
      setFeedback({
        correct: true,
        message: `Correct! ${currentIngredient.name} is ${currentIngredient.category}. +${10 + streak * 2} points!`
      });
    } else {
      setStreak(0);
      setFeedback({
        correct: false,
        message: `Wrong! ${currentIngredient.name} is actually ${currentIngredient.category}. ${currentIngredient.description}`
      });
    }

    setTimeout(() => {
      if (totalAttempts >= 9) {
        setShowResults(true);
      } else {
        setFeedback(null);
        setCurrentIngredient(getRandomIngredient());
      }
    }, 2500);
  };

  const getBadge = () => {
    const accuracy = (score / ((totalAttempts + 1) * 10)) * 100;
    if (accuracy >= 90) return { emoji: '🏆', title: 'Nutrition Expert', color: 'text-safe' };
    if (accuracy >= 70) return { emoji: '⭐', title: 'Health Conscious', color: 'text-accent' };
    if (accuracy >= 50) return { emoji: '👍', title: 'Learning Fast', color: 'text-risky' };
    return { emoji: '💪', title: 'Keep Practicing', color: 'text-text-secondary' };
  };

  return (
    <div className="card overflow-hidden">
      {/* Menu */}
      {!gameMode && (
        <div className="p-6">
          <div className="text-center mb-6">
            <span className="text-5xl mb-3 block">🎓</span>
            <h2 className="text-[20px] font-extrabold text-text-primary">Learn & Play</h2>
            <p className="text-[13px] text-text-tertiary mt-1">Master ingredient knowledge through fun games</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={startQuiz}
              className="card card-interactive w-full p-4 flex items-center gap-4 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-safe-light flex items-center justify-center text-2xl shrink-0">
                ❓
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-text-primary">Ingredient Quiz</p>
                <p className="text-[12px] text-text-tertiary">Guess if ingredients are safe, risky, or harmful</p>
              </div>
              <span className="text-text-tertiary">→</span>
            </button>

            <div className="card p-4 bg-surface-secondary opacity-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-border-light flex items-center justify-center text-2xl shrink-0">
                  🎯
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-text-primary">More Games Coming Soon!</p>
                  <p className="text-[12px] text-text-tertiary">Drag & drop, memory match, and more...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Game */}
      {gameMode === 'quiz' && !showResults && (
        <div className="p-6">
          {/* Score Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-light">
            <div>
              <p className="text-[11px] font-semibold text-text-tertiary uppercase">Question {totalAttempts + 1}/10</p>
              <p className="text-[18px] font-bold text-text-primary">Score: {score}</p>
            </div>
            {streak > 0 && (
              <div className="px-3 py-1.5 bg-safe-light rounded-full">
                <p className="text-[12px] font-semibold text-safe">🔥 {streak} streak</p>
              </div>
            )}
          </div>

          {/* Question */}
          {currentIngredient && !feedback && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-6">
                <div className="inline-block px-6 py-3 bg-surface-secondary rounded-2xl mb-4">
                  <p className="text-[18px] font-bold text-text-primary capitalize">
                    {currentIngredient.name}
                  </p>
                </div>
                <p className="text-[13px] text-text-tertiary">Is this ingredient safe, risky, or should be avoided?</p>
              </div>

              {/* Answer Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => checkAnswer('safe')}
                  className="card card-interactive w-full p-4 flex items-center gap-3 border-2 border-transparent hover:border-safe transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-safe-light flex items-center justify-center text-xl shrink-0">
                    ✅
                  </div>
                  <p className="text-[14px] font-semibold text-text-primary">Safe</p>
                </button>

                <button
                  onClick={() => checkAnswer('risky')}
                  className="card card-interactive w-full p-4 flex items-center gap-3 border-2 border-transparent hover:border-risky transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-risky-light flex items-center justify-center text-xl shrink-0">
                    ⚠️
                  </div>
                  <p className="text-[14px] font-semibold text-text-primary">Risky</p>
                </button>

                <button
                  onClick={() => checkAnswer('avoid')}
                  className="card card-interactive w-full p-4 flex items-center gap-3 border-2 border-transparent hover:border-avoid transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-avoid-light flex items-center justify-center text-xl shrink-0">
                    ❌
                  </div>
                  <p className="text-[14px] font-semibold text-text-primary">Avoid</p>
                </button>
              </div>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div className={`card p-6 text-center animate-fade-in ${feedback.correct ? 'bg-safe-light' : 'bg-avoid-light'}`}>
              <p className="text-4xl mb-3">{feedback.correct ? '🎉' : '😔'}</p>
              <p className="text-[15px] font-semibold text-text-primary mb-2">
                {feedback.correct ? 'Awesome!' : 'Not quite...'}
              </p>
              <p className="text-[13px] text-text-secondary">
                {feedback.message}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Results Screen */}
      {showResults && (
        <div className="p-6 text-center animate-fade-in-up">
          <p className="text-6xl mb-4">{getBadge().emoji}</p>
          <h3 className="text-[24px] font-extrabold text-text-primary mb-2">Quiz Complete!</h3>
          <p className={`text-[18px] font-semibold mb-6 ${getBadge().color}`}>{getBadge().title}</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card p-4">
              <p className="text-[24px] font-extrabold text-text-primary">{score}</p>
              <p className="text-[11px] text-text-tertiary uppercase">Score</p>
            </div>
            <div className="card p-4">
              <p className="text-[24px] font-extrabold text-text-primary">
                {Math.round((score / (totalAttempts * 10)) * 100)}%
              </p>
              <p className="text-[11px] text-text-tertiary uppercase">Accuracy</p>
            </div>
            <div className="card p-4">
              <p className="text-[24px] font-extrabold text-text-primary">{bestStreak}</p>
              <p className="text-[11px] text-text-tertiary uppercase">Best Streak</p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={startQuiz}
              className="w-full bg-text-primary hover:bg-black text-white py-3 rounded-xl text-[14px] font-semibold transition-all"
            >
              Play Again
            </button>
            <button
              onClick={() => setGameMode(null)}
              className="w-full bg-surface-secondary hover:bg-border-light text-text-primary py-3 rounded-xl text-[14px] font-semibold transition-all"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
