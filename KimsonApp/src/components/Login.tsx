import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || '';
      if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'this site';
        setError(
          `This domain (${domain}) is not authorized for login. Add it in Firebase Console → Authentication → Settings → Authorized domains, then try again.`
        );
      } else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('Invalid email or password. Please check and try again.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Check your connection and try again.');
      } else {
        setError(msg || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Half - Logo Section */}
      <div className="w-1/2 bg-black flex items-center justify-center p-10 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="flex flex-col items-center relative z-10">
          {/* Logo Circle with Image */}
          <div className="w-40 h-40 rounded-full bg-white flex items-center justify-center mb-8 shadow-2xl border-4 border-white/20">
            <img
              src="/assets/logo-light.png"
              alt="Opilex Logo"
              className="w-28 h-28 object-contain"
              onError={(e) => {
                // Fallback to logo.png if logo-light.png doesn't exist
                (e.target as HTMLImageElement).src = '/assets/logo.png';
              }}
            />
          </div>
          
          {/* Brand Name */}
          <h1 className="text-6xl font-black text-white mb-5 tracking-[0.2em] drop-shadow-2xl" style={{ fontFamily: 'Ubuntu, sans-serif', textShadow: '0 4px 20px rgba(255, 255, 255, 0.3)' }}>
            OPILEX
          </h1>
          
          {/* Divider */}
          <div className="w-24 h-1 bg-white/60 mb-6 rounded-full"></div>
          
          {/* Tagline */}
          <p className="text-2xl font-semibold text-white mb-4 tracking-wider" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
            Admin Portal
          </p>
          
          {/* Subtitle */}
          <p className="text-base font-normal text-white/80 text-center leading-relaxed tracking-wide max-w-sm" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
            Reward System
          </p>
        </div>
      </div>

      {/* Right Half - Login Form */}
      <div className="w-1/2 bg-white flex items-center justify-center p-16 relative">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
        
        <div className="w-full max-w-md relative z-10">
          {/* Welcome Text */}
          <div className="mb-12">
            <h2 className="text-5xl font-black text-black mb-3 tracking-tight" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
              Welcome Back
            </h2>
            <p className="text-lg font-normal text-black/60 tracking-wide" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
              Sign in to your admin account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-black text-black mb-3 uppercase tracking-widest" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
                Email Address
              </label>
              <div className="flex items-center border-2 border-black/20 rounded-xl bg-white px-5 h-16 shadow-sm transition-all duration-300 hover:border-black/40 hover:shadow-md focus-within:border-black focus-within:shadow-lg">
                <svg className="w-5 h-5 text-black/40 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="flex-1 h-full text-base font-medium text-black bg-transparent border-none outline-none placeholder:text-black/40"
                  style={{ fontFamily: 'Ubuntu, sans-serif' }}
                  placeholder="admin@opilex.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-black text-black mb-3 uppercase tracking-widest" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
                Password
              </label>
              <div className="relative flex items-center border-2 border-black/20 rounded-xl bg-white px-5 h-16 shadow-sm transition-all duration-300 hover:border-black/40 hover:shadow-md focus-within:border-black focus-within:shadow-lg">
                <svg className="w-5 h-5 text-black/40 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="flex-1 h-full text-base font-medium text-black bg-transparent border-none outline-none placeholder:text-black/40"
                  style={{ fontFamily: 'Ubuntu, sans-serif' }}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPassword(!showPassword);
                  }}
                  className="ml-3 p-2 text-black/40 hover:text-black cursor-pointer transition-colors duration-200 flex-shrink-0"
                  disabled={loading}
                  style={{ pointerEvents: loading ? 'none' : 'auto' }}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-white border-2 border-black/20 rounded-xl p-4">
                <p className="text-sm font-semibold text-black text-center" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
                  {error}
                </p>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white rounded-xl h-16 flex items-center justify-center mt-8 mb-6 shadow-xl hover:shadow-2xl hover:bg-black/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: 'Ubuntu, sans-serif' }}
            >
              {loading ? (
                <span className="text-lg font-black tracking-wide flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </span>
              ) : (
                <span className="text-lg font-black tracking-wide">Sign In</span>
              )}
            </button>

            {/* Footer Text */}
            <div className="text-center pt-4">
              <p className="text-xs font-medium text-black/60 tracking-wider" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
                © 2026 Opilex. All rights reserved.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};




