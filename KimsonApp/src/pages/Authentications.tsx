import { useEffect, useState } from 'react';
import { adminWireAuthService } from '../services/adminService';
import { StatsCard } from '../components/StatsCard';

export const Authentications = () => {
  const [authentications, setAuthentications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [auths, statistics] = await Promise.all([
        adminWireAuthService.getAllAuthentications(),
        adminWireAuthService.getStatistics()
      ]);
      setAuthentications(auths);
      setStats(statistics);
    } catch (error) {
      console.error('Error loading authentications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <p className="text-white font-ubuntu-light">Loading authentications...</p>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-black via-black to-gray-900 animate-fadeIn">
      <div className="mb-10">
        <h1 className="text-5xl font-ubuntu font-black mb-2 text-white tracking-tight">
          Wire Authentications
        </h1>
        <p className="text-white/60 font-ubuntu-light">View all wire authentication records</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total" value={stats.total} subtitle="All time" color="blue" />
          <StatsCard title="Today" value={stats.today} subtitle="Last 24 hours" color="green" />
          <StatsCard title="This Week" value={stats.thisWeek} subtitle="Last 7 days" color="purple" />
          <StatsCard title="This Month" value={stats.thisMonth} subtitle="Last 30 days" color="orange" />
        </div>
      )}

      {/* Authentications Table */}
      <div className="bg-gradient-to-br from-black/90 to-black/70 border border-white/20 rounded-2xl overflow-hidden backdrop-blur-sm glow animate-fadeIn">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-white/10 to-white/5 border-b border-white/20">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                  User ID
                </th>
                <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                  Wire Code
                </th>
                <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                  Authenticated At
                </th>
                <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {authentications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-white/50 font-ubuntu-light">
                    No authentications found
                  </td>
                </tr>
              ) : (
                authentications.map((auth) => (
                  <tr key={auth.id} className="hover:bg-white/5 transition-all duration-200 group">
                    <td className="px-6 py-4 text-white font-ubuntu-medium text-sm group-hover:text-white transition-colors">
                      {auth.userId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-white font-ubuntu-bold group-hover:text-white transition-colors">
                      {auth.wireCode || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-white/60 font-ubuntu-light text-sm group-hover:text-white/80 transition-colors">
                      {auth.authenticatedAt?.toDate?.()?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 font-ubuntu-bold text-xs">
                        ✓ Verified
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





