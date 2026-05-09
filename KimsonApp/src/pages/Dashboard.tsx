import { useEffect, useState } from 'react';
import { adminWireAuthService } from '../services/adminService';
import { adminRewardService } from '../services/adminService';
import { adminTransactionService } from '../services/adminService';
import { adminUserService } from '../services/adminService';
import { StatsCard } from '../components/StatsCard';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    authentications: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
    rewards: { totalPoints: 0, totalRewards: 0, uniqueUsers: 0, averagePerUser: 0 },
    transactions: { pending: 0, total: 0 },
    users: { total: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [authStats, rewardStats, transactions, users] = await Promise.all([
        adminWireAuthService.getStatistics(),
        adminRewardService.getTotalPointsStats(),
        adminTransactionService.getPendingWithdrawals(),
        adminUserService.getAllUsers(),
      ]);

      setStats({
        authentications: authStats || { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
        rewards: rewardStats || { totalPoints: 0, totalRewards: 0, uniqueUsers: 0, averagePerUser: 0 },
        transactions: {
          pending: transactions?.length || 0,
          total: users?.length || 0,
        },
        users: {
          total: users?.length || 0,
        },
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default values on error
      setStats({
        authentications: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
        rewards: { totalPoints: 0, totalRewards: 0, uniqueUsers: 0, averagePerUser: 0 },
        transactions: { pending: 0, total: 0 },
        users: { total: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-black flex items-center justify-center">
        <p className="text-white font-ubuntu-light">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="mb-10 flex items-center gap-6">
        {/* Logo */}
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl border-4 border-white/20 flex-shrink-0">
          <img
            src="/assets/logo-light.png"
            alt="Opilex Logo"
            className="w-14 h-14 object-contain"
            onError={(e) => {
              // Fallback to logo.png if logo-light.png doesn't exist
              (e.target as HTMLImageElement).src = '/assets/logo.png';
            }}
          />
        </div>
        
        {/* Title Section */}
        <div className="flex-1">
          <h1 className="text-5xl font-ubuntu font-black mb-2 text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-white/60 font-ubuntu-light">Welcome back! Here's what's happening.</p>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Users"
          value={stats.users.total}
          subtitle="Registered users"
          icon="👥"
          color="default"
        />
        <StatsCard
          title="Wire Authentications"
          value={stats.authentications.total}
          subtitle={`Today: ${stats.authentications.today}`}
          icon="🔐"
          color="default"
        />
        <StatsCard
          title="Total Points"
          value={(stats.rewards.totalPoints || 0).toLocaleString()}
          subtitle={`${stats.rewards.uniqueUsers || 0} users`}
          icon="🎁"
          color="default"
        />
        <StatsCard
          title="Pending Withdrawals"
          value={stats.transactions.pending}
          subtitle="Requires action"
          icon="💰"
          color="default"
        />
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="This Week"
          value={stats.authentications.thisWeek}
          subtitle="Authentications"
          color="default"
        />
        <StatsCard
          title="This Month"
          value={stats.authentications.thisMonth}
          subtitle="Authentications"
          color="default"
        />
        <StatsCard
          title="Total Rewards"
          value={stats.rewards.totalRewards}
          subtitle="Reward transactions"
          color="default"
        />
        <StatsCard
          title="Avg Points"
          value={Math.round(stats.rewards.averagePerUser || 0)}
          subtitle="Per user"
          color="default"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-black border border-white/20 rounded-2xl p-6">
        <h2 className="text-2xl font-ubuntu font-black mb-6 text-white tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/users')}
            className="group p-5 border border-white/20 rounded-xl text-white font-ubuntu-medium hover:bg-white hover:text-black transition-all duration-300 text-left bg-black relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform duration-300">👥</div>
              <div className="font-ubuntu-bold">View All Users</div>
            </div>
          </button>
          <button
            onClick={() => navigate('/transactions')}
            className="group p-5 border border-white/20 rounded-xl text-white font-ubuntu-medium hover:bg-white hover:text-black transition-all duration-300 text-left bg-black relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform duration-300">💰</div>
              <div className="font-ubuntu-bold">Process Withdrawals</div>
            </div>
          </button>
          <button
            onClick={() => navigate('/authentications')}
            className="group p-5 border border-white/20 rounded-xl text-white font-ubuntu-medium hover:bg-white hover:text-black transition-all duration-300 text-left bg-black relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform duration-300">🔐</div>
              <div className="font-ubuntu-bold">View Authentications</div>
            </div>
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="group p-5 border border-white/20 rounded-xl text-white font-ubuntu-medium hover:bg-white hover:text-black transition-all duration-300 text-left bg-black relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform duration-300">📈</div>
              <div className="font-ubuntu-bold">View Analytics</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};




