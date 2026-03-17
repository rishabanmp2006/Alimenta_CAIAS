import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/compare', label: 'Compare', icon: '⚖️' },
  { to: '/history', label: 'History', icon: '📋' },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-dark-600" style={{ background: 'rgba(10, 14, 23, 0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-accent to-green-400 bg-clip-text text-transparent group-hover:from-green-400 group-hover:to-accent transition-all duration-500">
              EATIQ
            </span>
            <span className="hidden sm:block text-xs text-slate-500 font-medium mt-1">Ingredient Intelligence</span>
          </NavLink>
          
          <nav className="flex items-center gap-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-accent/15 text-accent'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-dark-600/50'
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-600 py-4 text-center text-xs text-slate-600">
        <p>EATIQ — Know What You Eat • Powered by OpenFoodFacts</p>
      </footer>
    </div>
  );
}
