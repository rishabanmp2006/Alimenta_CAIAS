# 🍎 EatIQ - Intelligent Food Scanner

**Decode Your Food** - A sophisticated web application that analyzes food product ingredients to help you make informed dietary decisions.

## 🎯 What is EatIQ?

EatIQ is a comprehensive food ingredient intelligence platform that:

- 🔍 **Scans Products** - Search by name, barcode, or paste ingredients directly
- 📊 **Analyzes Ingredients** - Real-time classification with health scoring (0-100)
- 👤 **Profile-Based** - Customized analysis for General, Diabetic, Fitness, or Child profiles
- ⚡ **Quick Decisions** - Instant visual indicators (Good/Moderate/Poor)
- 🔬 **Deep Insights** - Long-term health effects, hidden dangers, and trust scores
- 💡 **Smart Suggestions** - Healthier alternative recommendations
- ⚖️ **Side-by-Side Comparison** - Compare two products directly
- 📚 **History Tracking** - Keep track of all scanned products

## 🚀 Features

### Core Functionality
- **Multi-Modal Search**: Product name, barcode, or raw ingredient text
- **Real-Time Analysis**: Powered by OpenFoodFacts API + custom classification engine
- **Health Scoring**: 0-100 score based on ingredient safety and profile
- **Animated Visualizations**: Beautiful Apple-inspired UI with smooth transitions

### Smart Analysis Engine
- **Ingredient Classification**: Safe, Risky, or Avoid categories
- **Profile Customization**: Different scoring for specific health conditions
- **Long-Term Effect Predictions**: Understand cumulative health impacts
- **Hidden Danger Detection**: Identify harmful ingredient combinations
- **Trust Scoring**: Evaluate product transparency and ingredient quality

### User Experience
- **Clean, Modern UI**: Apple-inspired design system
- **Responsive**: Works on desktop, tablet, and mobile
- **Fast Loading**: Optimized with skeleton screens
- **Persistent History**: LocalStorage-based tracking

## 📦 Tech Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS 3
- **API**: OpenFoodFacts REST API
- **Database**: Custom JSON ingredient database (2000+ entries)
- **Storage**: Browser LocalStorage

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ and npm/yarn/pnpm

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will open at `http://localhost:3000`

## 📁 Project Structure

```
eatiq-fixed/
├── src/
│   ├── components/       # React components
│   │   ├── HealthScoreRing.jsx
│   │   ├── QuickDecision.jsx
│   │   ├── ProfileSelector.jsx
│   │   ├── SearchBar.jsx
│   │   └── ...
│   ├── pages/            # Route pages
│   │   ├── HomePage.jsx
│   │   ├── ResultPage.jsx
│   │   ├── ComparePage.jsx
│   │   └── HistoryPage.jsx
│   ├── engine/           # Analysis logic
│   │   ├── parser.js
│   │   ├── classifier.js
│   │   ├── scorer.js
│   │   ├── summary.js
│   │   └── ...
│   ├── api/              # External API clients
│   │   └── openFoodFacts.js
│   ├── data/             # Static databases
│   │   ├── ingredientDB.json (2000+ ingredients)
│   │   └── alternativesDB.json
│   ├── hooks/            # Custom React hooks
│   │   └── useHistory.js
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🐛 Bugs Fixed in This Version

### Critical Fixes:
1. **CSS Import Syntax** - Fixed Tailwind v4 beta syntax to v3 compatible
2. **Memory Leak** - HealthScoreRing component now properly cleans up intervals
3. **SearchInput Scoping** - Fixed incorrect setter in ComparePage
4. **Infinite Loop** - useHistory hook dependency array corrected
5. **Missing Error Boundaries** - Added proper error handling

### Improvements:
- Better loading states across all components
- Optimized re-renders with proper useCallback usage
- Improved LocalStorage persistence logic
- Enhanced animation cleanup

## 🎨 Design System

EatIQ uses a custom Apple-inspired design system:

### Color Palette
- **Safe**: Green (#34c759) - Healthy ingredients
- **Risky**: Orange (#ff9f0a) - Moderate concern
- **Avoid**: Red (#ff3b30) - Harmful ingredients
- **Accent**: Blue (#0071e3) - Interactive elements

### Typography
- **Font**: Inter (fallback to SF Pro Display)
- **Weights**: 400-900

### Components
- **Cards**: Rounded corners (16px), subtle shadows
- **Animations**: Smooth fade-in-up transitions
- **Skeletons**: Shimmer loading states

## 📊 How It Works

1. **Search**: User searches for a product or pastes ingredients
2. **Fetch**: API call to OpenFoodFacts or manual parsing
3. **Parse**: Ingredient string → normalized array
4. **Classify**: Each ingredient → Safe/Risky/Avoid status
5. **Score**: Algorithm computes health score (0-100)
6. **Analyze**: Generate summary, effects, dangers, alternatives
7. **Display**: Beautiful visualizations + actionable insights

## 🔧 Configuration

### API Endpoints
- **OpenFoodFacts**: `https://world.openfoodfacts.org`
- No API key required (public API)

### LocalStorage Keys
- `eatiq_scan_history` - Stores up to 50 recent scans

## 📈 Future Enhancements (See Next Section)

See the "Additional Features" document for hackathon-winning ideas!

## 🤝 Contributing

This is a hackathon project. Feel free to fork and build upon it!

## 📄 License

MIT License - Free to use and modify

## 🙏 Credits

- **OpenFoodFacts** - Product database
- **Tailwind CSS** - Styling framework
- **React** - UI library

---

Built with ❤️ for healthier eating decisions
