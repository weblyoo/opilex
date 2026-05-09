import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/users', label: 'Users', icon: '👥' },
  { path: '/authentications', label: 'Wire Auth', icon: '🔐' },
  { path: '/rewards', label: 'Rewards', icon: '🎁' },
  { path: '/schemes', label: 'Schemes', icon: '🎯' },
  { path: '/transactions', label: 'Transactions', icon: '💰' },
  { path: '/generate-qr', label: 'Generate QR', icon: '🔲' },
  { path: '/qr-labels', label: 'QR Labels', icon: '🏷️' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/sliders', label: 'Sliders', icon: '🖼️' },
  { path: '/documents', label: 'Documents', icon: '📄' },
  { path: '/documents-display', label: 'Documents View', icon: '👁️' },
  { path: '/price-list', label: 'Price List', icon: '💰' },
  { path: '/product-catalog', label: 'Product Catalog', icon: '📦' },
  { path: '/ledger', label: 'Ledger', icon: '📒' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="bg-[#0F0F0F] backdrop-blur-xl border-r border-[#E31E24]/20 w-64 h-screen fixed left-0 top-0 pt-0 z-20 shadow-2xl">
      <div className="p-6 pt-6 h-full overflow-y-auto">
        <div className="flex items-center justify-center border-b border-[#E31E24]/20 w-full overflow-hidden pb-4">
          <Logo size={160} dark={true} style={{ width: '200px', height: '50px' }} />
        </div>
        
        <nav className="space-y-1.5 mt-3">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden
                  ${isActive
                    ? 'bg-[#E31E24] text-white font-ubuntu-bold shadow-lg shadow-[#E31E24]/30 scale-105'
                    : 'text-white/60 hover:text-white hover:bg-white/5 font-ubuntu-medium'
                  }
                `}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
