import { useEffect, useState } from 'react';
import { adminWireAuthService } from '../services/adminService';
import { adminRewardService } from '../services/adminService';
import { adminTransactionService } from '../services/adminService';

export const Analytics = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [authStats, rewardStats, transactions] = await Promise.all([
        adminWireAuthService.getStatistics(),
        adminRewardService.getTotalPointsStats(),
        adminTransactionService.getAllTransactions()
      ]);

      setAnalytics({
        authentications: authStats,
        rewards: rewardStats,
        transactions: {
          total: transactions.length,
          pending: transactions.filter(t => t.status === 'pending').length,
          approved: transactions.filter(t => t.status === 'approved').length,
          rejected: transactions.filter(t => t.status === 'rejected').length,
        }
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <p className="text-white font-ubuntu-light">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-[#111111] via-[#111111] to-[#0F0F0F] animate-fadeIn">
      <div className="mb-10">
        <h1 className="text-5xl font-ubuntu font-black mb-2 text-white tracking-tight">
          Analytics & Reports
        </h1>
        <p className="text-white/60 font-ubuntu-light">Comprehensive insights and statistics</p>
      </div>

      {analytics && (
        <div className="space-y-6">
          {/* Authentications Analytics */}
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-white/10 rounded-2xl p-8 backdrop-blur-sm glow card-hover">
            <h2 className="text-3xl font-ubuntu font-black mb-6 text-white">
              Wire Authentications
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-white/60 font-ubuntu-light text-sm mb-1">Total</p>
                <p className="text-3xl font-ubuntu font-bold text-white">
                  {analytics.authentications.total}
                </p>
              </div>
              <div>
                <p className="text-white/60 font-ubuntu-light text-sm mb-1">Today</p>
                <p className="text-3xl font-ubuntu font-bold text-white">
                  {analytics.authentications.today}
                </p>
              </div>
              <div>
                <p className="text-white/60 font-ubuntu-light text-sm mb-1">This Week</p>
                <p className="text-3xl font-ubuntu font-bold text-white">
                  {analytics.authentications.thisWeek}
                </p>
              </div>
              <div>
                <p className="text-white/60 font-ubuntu-light text-sm mb-1">This Month</p>
                <p className="text-3xl font-ubuntu font-bold text-white">
                  {analytics.authentications.thisMonth}
                </p>
              </div>
            </div>
          </div>

          {/* Rewards Analytics */}
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-white/10 rounded-2xl p-8 backdrop-blur-sm glow card-hover">
            <h2 className="text-3xl font-ubuntu font-black mb-6 text-white">
              Rewards Analytics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-white/60 font-ubuntu-light text-sm mb-1">Total Points</p>
                <p className="text-3xl font-ubuntu font-bold text-white">
                  {analytics.rewards.totalPoints.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-white/60 font-ubuntu-light text-sm mb-1">Total Rewards</p>
                <p className="text-3xl font-ubuntu font-bold text-white">
                  {analytics.rewards.totalRewards}
                </p>
              </div>
              <div>
                <p className="text-white/60 font-ubuntu-light text-sm mb-1">Unique Users</p>
                <p className="text-3xl font-ubuntu font-bold text-white">
                  {analytics.rewards.uniqueUsers}
                </p>
              </div>
              <div>
                <p className="text-white/60 font-ubuntu-light text-sm mb-1">Avg Per User</p>
                <p className="text-3xl font-ubuntu font-bold text-white">
                  {Math.round(analytics.rewards.averagePerUser)}
                </p>
              </div>
            </div>
          </div>

          {/* Transactions Analytics */}
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-white/10 rounded-2xl p-8 backdrop-blur-sm glow card-hover">
            <h2 className="text-3xl font-ubuntu font-black mb-6 text-white">
              Transactions Analytics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-white/60 font-ubuntu-light text-sm mb-1">Total</p>
                <p className="text-3xl font-ubuntu font-bold text-white">
                  {analytics.transactions.total}
                </p>
              </div>
              <div>
                <p className="text-white/60 font-ubuntu-light text-sm mb-1">Pending</p>
                <p className="text-3xl font-ubuntu font-bold text-orange-400">
                  {analytics.transactions.pending}
                </p>
              </div>
              <div>
                <p className="text-white/60 font-ubuntu-light text-sm mb-1">Approved</p>
                <p className="text-3xl font-ubuntu font-bold text-green-400">
                  {analytics.transactions.approved}
                </p>
              </div>
              <div>
                <p className="text-white/60 font-ubuntu-light text-sm mb-1">Rejected</p>
                <p className="text-3xl font-ubuntu font-bold text-red-400">
                  {analytics.transactions.rejected}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

