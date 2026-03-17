import { useEffect, useState } from 'react';

export default function HealthScoreRing({ score, label, color, size = 180 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const dashOffset = circumference - progress;

  useEffect(() => {
    setAnimatedScore(0);
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(interval);
        } else {
          setAnimatedScore(current);
        }
      }, 15);
      return () => clearInterval(interval);
    }, 200);
    return () => clearTimeout(timer);
  }, [score]);

  // Interpolate color
  const getColor = (s) => {
    if (s >= 70) return '#22c55e';
    if (s >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const ringColor = color || getColor(animatedScore);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: 'stroke-dashoffset 0.05s linear, stroke 0.3s ease',
            filter: `drop-shadow(0 0 8px ${ringColor}50)`
          }}
        />
      </svg>
      {/* Centered text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black" style={{ color: ringColor }}>
          {animatedScore}
        </span>
        <span className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-1">
          {label || 'Health Score'}
        </span>
      </div>
    </div>
  );
}
