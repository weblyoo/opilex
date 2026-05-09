import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { adminUserService } from '../services/adminService';
import { adminRewardService } from '../services/adminService';
import { adminWireAuthService } from '../services/adminService';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const UserDetailModal = ({ isOpen, onClose, userId }: UserDetailModalProps) => {
  const [user, setUser] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [authentications, setAuthentications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pointsAdjustment, setPointsAdjustment] = useState('');
  const [pointsReason, setPointsReason] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadUserData();
    }
  }, [isOpen, userId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [userData, userRewards, userAuths] = await Promise.all([
        adminUserService.getUserById(userId),
        adminRewardService.getRewardsByUser(userId),
        adminWireAuthService.getAuthenticationsByUser(userId),
      ]);
      setUser(userData);
      setRewards(userRewards);
      setAuthentications(userAuths);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePointsAdjustment = async () => {
    if (!pointsAdjustment || !pointsReason) return;
    
    setUpdating(true);
    try {
      await adminUserService.updateUserPoints(userId, parseInt(pointsAdjustment), pointsReason);
      setPointsAdjustment('');
      setPointsReason('');
      loadUserData(); // Reload user data
    } catch (error) {
      console.error('Error updating points:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="lg">
        <p className="text-white font-ubuntu-light">Loading user data...</p>
      </Modal>
    );
  }

  if (!user) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="lg">
        <p className="text-white font-ubuntu-light">User not found</p>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="lg">
      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-gradient-to-br from-black/70 to-black/50 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-ubuntu font-black text-white mb-6">User Information</h3>
          <div className="grid grid-cols-2 gap-6 text-white font-ubuntu-light">
            <div>
              <span className="text-white/60 text-sm font-ubuntu-medium uppercase tracking-wide">Phone:</span>
              <p className="font-ubuntu-bold text-lg mt-1">{user.phoneNumber || 'N/A'}</p>
            </div>
            <div>
              <span className="text-white/60 text-sm font-ubuntu-medium uppercase tracking-wide">Name:</span>
              <p className="font-ubuntu-bold text-lg mt-1">{user.name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-white/60 text-sm font-ubuntu-medium uppercase tracking-wide">Reward Points:</span>
              <p className="font-ubuntu-black text-3xl text-green-400 mt-1">{user.rewardPoints || 0}</p>
            </div>
            <div>
              <span className="text-white/60 text-sm font-ubuntu-medium uppercase tracking-wide">Created:</span>
              <p className="font-ubuntu-bold text-lg mt-1">
                {user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Points Adjustment */}
        <div className="bg-gradient-to-br from-black/70 to-black/50 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-ubuntu font-black text-white mb-6">Adjust Points</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-ubuntu-bold mb-3 text-white uppercase tracking-wide">
                Points (positive or negative)
              </label>
              <input
                type="number"
                value={pointsAdjustment}
                onChange={(e) => setPointsAdjustment(e.target.value)}
                placeholder="e.g., 100 or -50"
                className="w-full px-5 py-4 border border-white/20 rounded-xl bg-black/50 backdrop-blur-sm text-white placeholder-white/40 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 font-ubuntu-light transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-ubuntu-bold mb-3 text-white uppercase tracking-wide">
                Reason
              </label>
              <input
                type="text"
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
                placeholder="Reason for adjustment"
                className="w-full px-5 py-4 border border-white/20 rounded-xl bg-black/50 backdrop-blur-sm text-white placeholder-white/40 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 font-ubuntu-light transition-all duration-300"
              />
            </div>
            <button
              onClick={handlePointsAdjustment}
              disabled={!pointsAdjustment || !pointsReason || updating}
              className="w-full bg-white text-black py-4 rounded-xl hover:bg-white/90 disabled:opacity-50 font-ubuntu-black transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/30 transform"
            >
              {updating ? 'Updating...' : 'Update Points'}
            </button>
          </div>
        </div>

        {/* Rewards History */}
        <div className="bg-gradient-to-br from-black/70 to-black/50 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-ubuntu font-black text-white mb-6">
            Rewards History ({rewards.length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {rewards.length === 0 ? (
              <p className="text-white/60 font-ubuntu-light text-sm text-center py-4">No rewards yet</p>
            ) : (
              rewards.slice(0, 10).map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/10 hover:border-white/20 transition-all group"
                >
                  <div>
                    <p className="text-white font-ubuntu-medium text-sm group-hover:text-white transition-colors">
                      {reward.description || 'No description'}
                    </p>
                    <p className="text-white/50 font-ubuntu-light text-xs mt-1">
                      {reward.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-lg font-ubuntu-bold text-sm border ${
                      reward.points > 0 
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}
                  >
                    {reward.points > 0 ? '+' : ''}
                    {reward.points}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Authentications */}
        <div className="bg-gradient-to-br from-black/70 to-black/50 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-ubuntu font-black text-white mb-6">
            Wire Authentications ({authentications.length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {authentications.length === 0 ? (
              <p className="text-white/60 font-ubuntu-light text-sm text-center py-4">No authentications yet</p>
            ) : (
              authentications.slice(0, 10).map((auth) => (
                <div
                  key={auth.id}
                  className="p-4 bg-black/30 rounded-xl border border-white/10 hover:border-white/20 transition-all group"
                >
                  <p className="text-white font-ubuntu-medium text-sm group-hover:text-white transition-colors">
                    Wire Code: <span className="font-ubuntu-bold">{auth.wireCode || 'N/A'}</span>
                  </p>
                  <p className="text-white/50 font-ubuntu-light text-xs mt-1">
                    {auth.authenticatedAt?.toDate?.()?.toLocaleString() || 'N/A'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};





