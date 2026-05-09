import { useAuth } from '../hooks/useAuth';

export const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-[#111111] via-[#111111] to-[#0F0F0F] animate-fadeIn">
      <div className="mb-10">
        <h1 className="text-5xl font-ubuntu font-black mb-2 text-white tracking-tight">
          Settings
        </h1>
        <p className="text-white/60 font-ubuntu-light">Manage your account and system preferences</p>
      </div>

      <div className="space-y-6">
        {/* Account Settings */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-white/10 rounded-2xl p-8 backdrop-blur-sm glow card-hover">
          <h2 className="text-2xl font-ubuntu font-black mb-6 text-white">
            Account Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-ubuntu-medium mb-2 text-white">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full max-w-md px-4 py-3 border border-white/30 rounded-md bg-black/50 text-white/60 font-ubuntu-light"
              />
            </div>
            <div>
              <label className="block text-sm font-ubuntu-medium mb-2 text-white">
                Role
              </label>
              <input
                type="text"
                value={user?.role || ''}
                disabled
                className="w-full max-w-md px-4 py-3 border border-white/30 rounded-md bg-black/50 text-white/60 font-ubuntu-light"
              />
            </div>
            <div>
              <label className="block text-sm font-ubuntu-medium mb-2 text-white">
                User ID
              </label>
              <input
                type="text"
                value={user?.uid || ''}
                disabled
                className="w-full max-w-md px-4 py-3 border border-white/30 rounded-md bg-black/50 text-white/60 font-ubuntu-light text-xs"
              />
            </div>
          </div>
        </div>

        {/* Razorpay API Settings */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-white/10 rounded-2xl p-8 backdrop-blur-sm glow card-hover">
          <h2 className="text-2xl font-ubuntu font-black mb-6 text-white">
            Razorpay API Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-ubuntu-medium mb-2 text-white">
                Razorpay Key ID
              </label>
              <input
                type="text"
                placeholder="rzp_test_xxxxx or rzp_live_xxxxx"
                className="w-full max-w-md px-4 py-3 border border-white/30 rounded-md bg-black/50 text-white font-ubuntu-light placeholder:text-white/40 focus:border-white/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-ubuntu-medium mb-2 text-white">
                Razorpay Key Secret
              </label>
              <input
                type="password"
                placeholder="Enter your Razorpay secret key"
                className="w-full max-w-md px-4 py-3 border border-white/30 rounded-md bg-black/50 text-white font-ubuntu-light placeholder:text-white/40 focus:border-white/60 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="razorpay-test-mode"
                className="w-4 h-4 rounded border-white/30 bg-black/50 text-white focus:ring-2 focus:ring-white/20"
              />
              <label htmlFor="razorpay-test-mode" className="text-sm font-ubuntu-medium text-white/80">
                Use Test Mode (Sandbox)
              </label>
            </div>
            <button className="px-6 py-3 bg-[#E31E24] text-white rounded-xl font-ubuntu-bold hover:bg-white/90 transition-all duration-300 hover:scale-105">
              Save Razorpay Settings
            </button>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-white/10 rounded-2xl p-8 backdrop-blur-sm glow card-hover">
          <h2 className="text-2xl font-ubuntu font-black mb-6 text-white">
            System Information
          </h2>
          <div className="space-y-2 text-white/70 font-ubuntu-light">
            <p>Firebase Project: kimson-3373e</p>
            <p>Admin Panel Version: 1.0.0</p>
            <p>Build Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

