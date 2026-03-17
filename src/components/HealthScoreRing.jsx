import { useEffect, useState, useRef } from 'react';

export default function HealthScoreRing({ score, label, color, size = 160 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const dashOffset = circumference - progress;

  useEffect(() => {
    setAnimatedScore(0);
    
    // Clear any existing timers
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      let current = 0;
      intervalRef.current = setInterval(() => {
        current += 1;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        } else {
          setAnimatedScore(current);
        }
      }, 12);
    }, 150);
    
    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [score]);

  const getColor = (s) => {
    if (s >= 70) return '#34c759';
    if (s >= 40) return '#ff9f0a';
    return '#ff3b30';
  };

  const ringColor = color || getColor(animatedScore);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f0f0f2"
          strokeWidth={strokeWidth}
        />
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
          style={{ transition: 'stroke-dashoffset 0.04s linear, stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[40px] font-extrabold tracking-tight leading-none" style={{ color: ringColor }}>
          {animatedScore}
        </span>
        <span className="text-[11px] font-medium text-text-tertiary tracking-wide uppercase mt-1">
          {label || 'Score'}
        </span>
      </div>
    </div>
  );
}
