import { useEffect, useState } from 'react';
import { adminRewardService, adminUserService } from '../services/adminService';
import { StatsCard } from '../components/StatsCard';

export const Rewards = () => {
  const [rewards, setRewards] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [users, setUsers] = useState<Map<string, any>>(new Map());
  const [viewMode, setViewMode] = useState<'all' | 'byUser'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allRewards, rewardStats, allUsers] = await Promise.all([
        adminRewardService.getAllRewards(),
        adminRewardService.getTotalPointsStats(),
        adminUserService.getAllUsers()
      ]);
      
      setRewards(allRewards || []);
      setStats(rewardStats || {
        totalPoints: 0,
        totalRewards: 0,
        uniqueUsers: 0,
        averagePerUser: 0
      });

      // Create user map for quick lookup
      const userMap = new Map();
      (allUsers || []).forEach((user: any) => {
        userMap.set(user.id, user);
      });
      setUsers(userMap);
    } catch (error) {
      console.error('Error loading rewards:', error);
      setRewards([]);
      setStats({
        totalPoints: 0,
        totalRewards: 0,
        uniqueUsers: 0,
        averagePerUser: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and search rewards
  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = !searchTerm || 
      reward.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      users.get(reward.userId)?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      users.get(reward.userId)?.phoneNumber?.includes(searchTerm);
    
    const matchesFilter = filterType === 'all' || reward.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  // Group rewards by user
  const rewardsByUser = filteredRewards.reduce((acc: any, reward: any) => {
    const userId = reward.userId;
    if (!acc[userId]) {
      const user = users.get(userId);
      acc[userId] = {
        userId,
        userName: user?.name || 'Unknown',
        userPhone: user?.phoneNumber || 'N/A',
        userEmail: user?.email || 'N/A',
        userType: user?.userType || 'N/A',
        currentBalance: user?.rewardPoints || 0,
        totalEarned: 0,
        totalSpent: 0,
        rewardCount: 0,
        rewards: []
      };
    }
    acc[userId].totalEarned += reward.points > 0 ? reward.points : 0;
    acc[userId].totalSpent += reward.points < 0 ? Math.abs(reward.points) : 0;
    acc[userId].rewardCount++;
    acc[userId].rewards.push(reward);
    return acc;
  }, {});

  const userRewardsList = Object.values(rewardsByUser).sort((a: any, b: any) => 
    b.currentBalance - a.currentBalance
  );

  const displayData = viewMode === 'all' ? filteredRewards : userRewardsList;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-[#111111] flex items-center justify-center">
        <p className="text-white font-ubuntu-light">Loading rewards...</p>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-[#111111]">
      <div className="mb-10">
        <h1 className="text-5xl font-ubuntu font-black mb-2 text-white tracking-tight">
          Rewards Management
        </h1>
        <p className="text-white/60 font-ubuntu-light">Track and manage all reward points</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Total Points" 
            value={stats.totalPoints ? stats.totalPoints.toLocaleString() : 0} 
            subtitle="All rewards" 
            color="default" 
            icon="🎁" 
          />
          <StatsCard 
            title="Total Rewards" 
            value={stats.totalRewards || 0} 
            subtitle="Transactions" 
            color="default" 
          />
          <StatsCard 
            title="Unique Users" 
            value={stats.uniqueUsers || 0} 
            subtitle="With rewards" 
            color="default" 
          />
          <StatsCard 
            title="Avg Per User" 
            value={stats.averagePerUser ? Math.round(stats.averagePerUser) : 0} 
            subtitle="Points average" 
            color="default" 
          />
        </div>
      )}

      {/* Filters and View Mode */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 mb-8">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-xs font-ubuntu-bold text-white/60 mb-2 uppercase tracking-wider">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by user, description..."
              className="w-full px-4 py-3 bg-[#111111] border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 font-ubuntu-light"
            />
          </div>

          {/* Filter by Type */}
          <div>
            <label className="block text-xs font-ubuntu-bold text-white/60 mb-2 uppercase tracking-wider">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 bg-[#111111] border border-white/10 rounded-xl text-white focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 font-ubuntu-light"
            >
              <option value="all">All Types</option>
              <option value="wire_authentication">Wire Authentication</option>
              <option value="bonus">Bonus</option>
              <option value="referral">Referral</option>
            </select>
          </div>

          {/* View Mode */}
          <div>
            <label className="block text-xs font-ubuntu-bold text-white/60 mb-2 uppercase tracking-wider">
              View Mode
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('all')}
                className={`flex-1 px-4 py-3 rounded-xl border font-ubuntu-medium transition-all ${
                  viewMode === 'all'
                    ? 'bg-[#E31E24] text-white border-white'
                    : 'bg-[#111111] text-white border-white/10 hover:border-white/40'
                }`}
              >
                All Rewards
              </button>
              <button
                onClick={() => setViewMode('byUser')}
                className={`flex-1 px-4 py-3 rounded-xl border font-ubuntu-medium transition-all ${
                  viewMode === 'byUser'
                    ? 'bg-[#E31E24] text-white border-white'
                    : 'bg-[#111111] text-white border-white/10 hover:border-white/40'
                }`}
              >
                By User
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Table */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#111111] border-b border-white/10">
              <tr>
                {viewMode === 'all' ? (
                  <>
                    <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                      User
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                      Points
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                      Type
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                      Description
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                      Created At
                    </th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                      User
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                      Current Balance
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                      Total Earned
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                      Total Spent
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                      Transactions
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                      User Type
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayData.length === 0 ? (
                <tr>
                  <td colSpan={viewMode === 'all' ? 5 : 6} className="px-6 py-12 text-center text-white/50 font-ubuntu-light">
                    No rewards found
                  </td>
                </tr>
              ) : viewMode === 'all' ? (
                displayData.map((reward: any) => {
                  const user = users.get(reward.userId);
                  return (
                    <tr key={reward.id} className="hover:bg-white/5 transition-all duration-200 group">
                      <td className="px-6 py-4">
                        <div className="text-white font-ubuntu-medium text-sm">
                          <div>{user?.name || 'Unknown User'}</div>
                          <div className="text-white/60 text-xs font-ubuntu-light">{user?.phoneNumber || reward.userId}</div>
                          {user?.email && (
                            <div className="text-white/50 text-xs font-ubuntu-light">{user.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-ubuntu-bold ${
                          reward.points > 0 
                            ? 'bg-white/10 border border-white/30 text-white'
                            : 'bg-red-500/10 border border-red-500/30 text-red-400'
                        }`}>
                          {reward.points > 0 ? '+' : ''}{reward.points || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-ubuntu-bold border ${
                          reward.type === 'bonus' 
                            ? 'bg-white/10 border-white/30 text-white'
                            : reward.type === 'wire_authentication'
                            ? 'bg-white/10 border-white/30 text-white'
                            : 'bg-white/10 border-white/30 text-white'
                        }`}>
                          {reward.type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/70 font-ubuntu-light text-sm group-hover:text-white/80 transition-colors">
                        {reward.description || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-white/60 font-ubuntu-light text-sm group-hover:text-white/80 transition-colors">
                        {formatDate(reward.createdAt)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                displayData.map((userReward: any) => (
                  <tr key={userReward.userId} className="hover:bg-white/5 transition-all duration-200 group">
                    <td className="px-6 py-4">
                      <div className="text-white font-ubuntu-medium text-sm">
                        <div>{userReward.userName}</div>
                        <div className="text-white/60 text-xs font-ubuntu-light">{userReward.userPhone}</div>
                        {userReward.userEmail !== 'N/A' && (
                          <div className="text-white/50 text-xs font-ubuntu-light">{userReward.userEmail}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-ubuntu-bold bg-white/10 border border-white/30 text-white">
                        {userReward.currentBalance.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-ubuntu-bold bg-white/10 border border-white/30 text-white">
                        +{userReward.totalEarned.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-ubuntu-bold bg-red-500/10 border border-red-500/30 text-red-400">
                        -{userReward.totalSpent.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/70 font-ubuntu-light text-sm">
                      {userReward.rewardCount} {userReward.rewardCount === 1 ? 'transaction' : 'transactions'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-ubuntu-bold border ${
                        userReward.userType === 'dealer'
                          ? 'bg-white/10 border-white/30 text-white'
                          : 'bg-white/10 border-white/30 text-white'
                      }`}>
                        {userReward.userType === 'electrician' ? '⚡ Electrician' : userReward.userType === 'dealer' ? '🏪 Dealer' : userReward.userType}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
