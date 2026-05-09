import { useAuth } from '../hooks/useAuth';

export const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-black via-black to-gray-900 animate-fadeIn">
      <div className="mb-10">
        <h1 className="text-5xl font-ubuntu font-black mb-2 text-white tracking-tight">
          Settings
        </h1>
        <p className="text-white/60 font-ubuntu-light">Manage your account and system preferences</p>
      </div>

      <div className="space-y-6">
        {/* Account Settings */}
        <div className="bg-gradient-to-br from-black/90 to-black/70 border border-white/20 rounded-2xl p-8 backdrop-blur-sm glow card-hover">
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

        {/* System Settings */}
        <div className="bg-gradient-to-br from-black/90 to-black/70 border border-white/20 rounded-2xl p-8 backdrop-blur-sm glow card-hover">
          <h2 className="text-2xl font-ubuntu font-black mb-6 text-white">
            System Information
          </h2>
          <div className="space-y-2 text-white/70 font-ubuntu-light">
            <p>Firebase Project: opilex-3373e</p>
            <p>Admin Panel Version: 1.0.0</p>
            <p>Build Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};





