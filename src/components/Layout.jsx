import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/compare', label: 'Compare', icon: '⚖️' },
  { to: '/history', label: 'History', icon: '🕐' },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — clean Apple-style */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border-light">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5">
            <span className="text-xl font-extrabold tracking-tight text-text-primary">
              eat<span className="text-accent">iq</span>
            </span>
          </NavLink>
          
          <nav className="flex items-center gap-0.5">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-text-primary text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-text-tertiary">
        eatiq · ingredient intelligence
      </footer>
    </div>
  );
}
