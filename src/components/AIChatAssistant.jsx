import { useState, useRef, useEffect } from 'react';

export default function AIChatAssistant({ product, analysis, profile }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm your nutrition AI assistant. I've analyzed ${product.name}. Ask me anything about this product's ingredients, health effects, or alternatives!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const askAI = async (question) => {
    if (!question.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build context for Claude
      const context = `You are a nutrition expert AI assistant analyzing food products. 

Product Information:
- Name: ${product.name}
- Brand: ${product.brand}
- Ingredients: ${product.ingredients}
- Health Score: ${analysis.healthScore.score}/100 (${analysis.healthScore.label})
- Trust Score: ${analysis.trustScore.level}
- User Profile: ${profile}

Ingredient Breakdown:
- Safe: ${analysis.classified.filter(i => i.status === 'safe').length}
- Risky: ${analysis.classified.filter(i => i.status === 'risky').length}
- Avoid: ${analysis.classified.filter(i => i.status === 'avoid').length}

Summary: ${analysis.summary}

Provide helpful, accurate, and concise nutrition advice. Be empathetic and encouraging. Focus on actionable insights.`;

      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error('No API key configured');

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: context,
          messages: [{ role: 'user', content: question }]
        })
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }

      const data = await response.json();
      
      if (data.content && data.content[0] && data.content[0].text) {
        const assistantMessage = {
          role: 'assistant',
          content: data.content[0].text
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      
      // Provide intelligent fallback based on the question
      let fallbackResponse = '';
      
      const lowerQ = question.toLowerCase();
      if (lowerQ.includes('daily') || lowerQ.includes('every day')) {
        if (analysis.healthScore.score >= 70) {
          fallbackResponse = `Based on the health score of ${analysis.healthScore.score}/100, ${product.name} can be consumed regularly in moderation. It has ${analysis.classified.filter(i => i.status === 'safe').length} safe ingredients. However, always maintain a balanced diet!`;
        } else if (analysis.healthScore.score >= 40) {
          fallbackResponse = `With a score of ${analysis.healthScore.score}/100, I'd recommend limiting ${product.name} to 1-2 times per week rather than daily consumption. It contains ${analysis.classified.filter(i => i.status === 'risky').length + analysis.classified.filter(i => i.status === 'avoid').length} ingredients that may be concerning with frequent consumption.`;
        } else {
          fallbackResponse = `Given the low health score of ${analysis.healthScore.score}/100, ${product.name} is not recommended for daily consumption. Reserve it for rare treats only. The product contains ${analysis.classified.filter(i => i.status === 'avoid').length} ingredients to avoid.`;
        }
      } else if (lowerQ.includes('concern') || lowerQ.includes('problem') || lowerQ.includes('bad') || lowerQ.includes('worst')) {
        const avoidIngredients = analysis.classified.filter(i => i.status === 'avoid');
        if (avoidIngredients.length > 0) {
          fallbackResponse = `The main health concerns are: ${avoidIngredients.slice(0, 3).map(i => i.name).join(', ')}. ${avoidIngredients[0].description}`;
        } else {
          fallbackResponse = `The main areas of concern are the ${analysis.classified.filter(i => i.status === 'risky').length} moderately risky ingredients. Check the detailed breakdown above for specifics.`;
        }
      } else if (lowerQ.includes('alternative') || lowerQ.includes('instead') || lowerQ.includes('healthier')) {
        fallbackResponse = `For healthier alternatives, check the "Healthier Alternatives" section above. Generally, look for products with: fewer additives, more natural ingredients, lower sugar content, and higher whole food ingredients.`;
      } else if (lowerQ.includes('kid') || lowerQ.includes('child') || lowerQ.includes('children')) {
        if (analysis.healthScore.score >= 60) {
          fallbackResponse = `With a score of ${analysis.healthScore.score}/100, ${product.name} can be given to children occasionally. Monitor portion sizes and frequency.`;
        } else {
          fallbackResponse = `With a score of ${analysis.healthScore.score}/100, this product is not ideal for children. Look for options with fewer artificial additives and preservatives.`;
        }
      } else {
        fallbackResponse = `Based on the analysis: ${product.name} scored ${analysis.healthScore.score}/100 for health. ${analysis.summary.slice(0, 200)}... Check the detailed analysis above for more information!`;
      }
      
      const errorMessage = {
        role: 'assistant',
        content: fallbackResponse
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const quickQuestions = [
    "Is this suitable for daily consumption?",
    "What are the main health concerns?",
    "Suggest healthier alternatives",
    "What's the worst ingredient here?",
    "Can kids eat this safely?"
  ];

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-secondary transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className="text-[14px] font-semibold text-text-primary">AI Nutrition Assistant</h3>
            <p className="text-[12px] text-text-tertiary">
              Powered by Claude • Ask me anything
            </p>
          </div>
        </div>
        <span className="text-text-tertiary text-[14px]">
          {isOpen ? '−' : '+'}
        </span>
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="border-t border-border-light">
          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-surface-secondary">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 text-[14px]">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] ${
                    msg.role === 'user'
                      ? 'bg-accent text-white'
                      : 'bg-white text-text-primary'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-text-primary flex items-center justify-center shrink-0 text-[14px] text-white">
                    👤
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 text-[14px]">
                  🤖
                </div>
                <div className="bg-white rounded-2xl px-4 py-2.5 text-[13px] text-text-tertiary">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="p-3 bg-white border-t border-border-light">
              <p className="text-[11px] text-text-tertiary font-medium mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => askAI(q)}
                    className="px-3 py-1.5 bg-surface-secondary hover:bg-border-light text-text-secondary rounded-full text-[11px] transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); askAI(input); }}
            className="p-3 bg-white border-t border-border-light flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about ingredients, health effects..."
              disabled={loading}
              className="flex-1 bg-surface-secondary rounded-xl px-4 py-2 text-[13px] text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-accent hover:bg-blue-600 disabled:opacity-30 text-white px-4 py-2 rounded-xl text-[12px] font-semibold transition-all"
            >
              {loading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
