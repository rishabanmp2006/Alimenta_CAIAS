export default function ShareButton({ product, healthScore }) {
  const handleShare = async () => {
    const text = `I just analysed ${product.name} on Alimenta!\n\nHealth Score: ${healthScore.score}/100 (${healthScore.label})\n\nCheck what's really in your food 🔍`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: `Alimenta – ${product.name}`, text, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      alert('Result copied to clipboard!');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-full card p-4 flex items-center justify-center gap-2 text-accent font-semibold text-[14px] hover:bg-accent hover:text-white transition-all border border-accent/30"
    >
      <span>📤</span> Share Result
    </button>
  );
}
