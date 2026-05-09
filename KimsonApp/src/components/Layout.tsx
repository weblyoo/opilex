import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-black/80 backdrop-blur-xl border-b border-white/20 fixed top-0 right-0 left-64 z-10 h-16 shadow-lg">
          <div className="px-8 py-4 h-full flex items-center justify-end gap-6">
            {user && (
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white font-ubuntu-medium text-sm">{user.email}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 border border-white/30 rounded-xl text-white font-ubuntu-medium hover:bg-white hover:text-black transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/20"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="bg-black pt-16">
          {children}
        </main>
      </div>
    </div>
  );
};





