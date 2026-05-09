import { useEffect, useState } from 'react';
import { adminUserService, adminScratchRewardService } from '../services/adminService';
import { useAuth } from '../hooks/useAuth';

export const SendGift = () => {
  const { user: adminUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; phoneNumber: string; rewardPoints?: number } | null>(null);
  const [points, setPoints] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const list = await adminUserService.getAllUsers();
      setUsers(list || []);
    } catch (e) {
      console.error('Error loading users:', e);
      setUsers([]);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = searchTerm.trim()
    ? users.filter(
        (u: any) =>
          (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.phoneNumber || '').toString().includes(searchTerm.trim())
      )
    : users;

  const handleSendGift = async () => {
    if (!selectedUser || !points.trim() || isNaN(parseInt(points, 10)) || parseInt(points, 10) <= 0) {
      setError('Please select a user and enter valid reward points.');
      return;
    }
    setError(null);
    setSending(true);
    try {
      await adminScratchRewardService.createScratchReward(
        parseInt(points, 10),
        selectedUser.id,
        adminUser?.email || 'admin'
      );
      setSent(true);
      setSelectedUser(null);
      setPoints('');
      setMessage('');
      setTimeout(() => setSent(false), 3000);
    } catch (e: any) {
      console.error('Error sending gift:', e);
      setError(e?.message || 'Failed to send gift. Try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-black flex items-center justify-center">
        <p className="text-white font-ubuntu-light">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-black">
      <div className="mb-10">
        <h1 className="text-5xl font-ubuntu font-black mb-2 text-white tracking-tight">
          Send Gift (Reward Points)
        </h1>
        <p className="text-white/60 font-ubuntu-light">
          Send reward points to any user. They will see a gift in Scratch Rewards in the app and can claim the points.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User list */}
        <div className="bg-black border border-white/20 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/20">
            <h2 className="text-xl font-ubuntu font-black text-white">Select user</h2>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-3 w-full px-4 py-3 border border-white/20 rounded-xl bg-black/50 text-white placeholder-white/40 font-ubuntu-light focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-white/50 font-ubuntu-light">No users found</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {filteredUsers.map((u: any) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedUser({ id: u.id, name: u.name || '—', phoneNumber: u.phoneNumber || '—', rewardPoints: u.rewardPoints })}
                      className={`w-full px-4 py-3 text-left transition-colors font-ubuntu-medium ${
                        selectedUser?.id === u.id
                          ? 'bg-white text-black'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="block truncate">{u.name || 'No name'}</span>
                      <span className="block text-sm opacity-80 truncate">{u.phoneNumber || '—'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Gift form */}
        <div className="bg-black border border-white/20 rounded-2xl overflow-hidden p-6">
          <h2 className="text-xl font-ubuntu font-black text-white mb-4">Gift details</h2>
          {selectedUser ? (
            <>
              <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/20">
                <p className="text-white font-ubuntu-medium">{selectedUser.name}</p>
                <p className="text-white/70 text-sm font-ubuntu-light">{selectedUser.phoneNumber}</p>
                {selectedUser.rewardPoints != null && (
                  <p className="text-white/60 text-xs mt-1">Current points: {selectedUser.rewardPoints.toLocaleString()}</p>
                )}
              </div>
              <label className="block text-sm font-ubuntu-bold text-white/90 mb-2">Reward points to send *</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 500"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-full px-4 py-3 border border-white/20 rounded-xl bg-black/50 text-white placeholder-white/40 font-ubuntu-light focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 mb-4"
              />
              <label className="block text-sm font-ubuntu-bold text-white/90 mb-2">Message (optional)</label>
              <input
                type="text"
                placeholder="e.g. Thank you for being a loyal customer"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 border border-white/20 rounded-xl bg-black/50 text-white placeholder-white/40 font-ubuntu-light focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 mb-6"
              />
              {error && <p className="text-red-400 text-sm font-ubuntu-light mb-4">{error}</p>}
              {sent && <p className="text-green-400 text-sm font-ubuntu-medium mb-4">Gift sent! User will see it in Scratch Rewards.</p>}
              <button
                type="button"
                onClick={handleSendGift}
                disabled={sending || !points.trim() || parseInt(points, 10) <= 0}
                className="w-full px-6 py-4 bg-white text-black rounded-xl font-ubuntu-bold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {sending ? 'Sending...' : 'Send gift'}
              </button>
            </>
          ) : (
            <p className="text-white/60 font-ubuntu-light">Select a user from the list to send a gift.</p>
          )}
        </div>
      </div>
    </div>
  );
};
