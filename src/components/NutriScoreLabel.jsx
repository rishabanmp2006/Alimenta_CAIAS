/**
 * NutriScore Label — European A-E rating system
 * If product has nutriscore from OFF, shows official label.
 * If not, we estimate it from the health score.
 */
export default function NutriScoreLabel({ nutriScore, healthScore }) {
  const grades = ['a', 'b', 'c', 'd', 'e'];
  
  // Determine grade
  let grade = nutriScore?.toLowerCase();
  if (!grade && healthScore) {
    if (healthScore.score >= 80) grade = 'a';
    else if (healthScore.score >= 65) grade = 'b';
    else if (healthScore.score >= 50) grade = 'c';
    else if (healthScore.score >= 35) grade = 'd';
    else grade = 'e';
  }
  if (!grade) return null;

  const colors = { a: '#038141', b: '#85bb2f', c: '#fecb02', d: '#ee8100', e: '#e63e11' };
  const labels = { a: 'Excellent', b: 'Good', c: 'Moderate', d: 'Poor', e: 'Bad' };
  const isEstimated = !nutriScore;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wide">
          Nutri-Score {isEstimated && <span className="text-text-tertiary font-normal normal-case">(estimated)</span>}
        </p>
      </div>
      <div className="flex items-center gap-1">
        {grades.map(g => {
          const isActive = g === grade;
          const color = colors[g];
          return (
            <div
              key={g}
              className="flex-1 flex flex-col items-center rounded-lg py-2 transition-all"
              style={{
                backgroundColor: isActive ? color : `${color}22`,
                transform: isActive ? 'scale(1.15)' : 'scale(1)',
              }}
            >
              <span
                className="text-[15px] font-extrabold uppercase"
                style={{ color: isActive ? 'white' : color }}
              >
                {g}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-center text-[12px] mt-2 font-medium" style={{ color: colors[grade] }}>
        {labels[grade]} nutritional quality
      </p>
    </div>
  );
}
