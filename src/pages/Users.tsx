import { useEffect, useState } from 'react';
import { adminUserService } from '../services/adminService';
import { UserDetailModal } from '../components/UserDetailModal';

export const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await adminUserService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      try {
        const results = await adminUserService.searchUsers(term);
        setUsers(results);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    } else {
      loadUsers();
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <p className="text-white font-ubuntu-light">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-[#111111] via-[#111111] to-[#0F0F0F] animate-fadeIn">
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-5xl font-ubuntu font-black mb-2 text-white tracking-tight">
              Users Management
            </h1>
            <p className="text-white/60 font-ubuntu-light">View and manage all registered users</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="max-w-md relative">
          <input
            type="text"
            placeholder="Search by phone or name..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-5 py-4 pl-12 border border-white/10 rounded-xl bg-black/50 backdrop-blur-sm text-white placeholder-white/40 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 font-ubuntu-light transition-all duration-300 hover:border-white/40"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-xl">🔍</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm glow animate-fadeIn">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#E31E24]/10 to-[#E31E24]/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                  Phone Number
                </th>
                <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                  Name
                </th>
                <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                  Reward Points
                </th>
                <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                  Created At
                </th>
                <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/50 font-ubuntu-light">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="hover:bg-white/5 transition-all duration-200 group"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <td className="px-6 py-4 text-white font-ubuntu-medium group-hover:text-white transition-colors">
                      {user.phoneNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-white font-ubuntu-medium group-hover:text-white transition-colors">
                      {user.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 font-ubuntu-bold">
                        {user.rewardPoints || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60 font-ubuntu-light text-sm group-hover:text-white/80 transition-colors">
                      {user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setIsModalOpen(true);
                        }}
                        className="px-4 py-2 border border-white/30 rounded-xl text-white font-ubuntu-medium text-sm hover:bg-[#E31E24] hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/20"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-white/60 font-ubuntu-light text-sm">
        Total Users: {users.length}
      </div>

      {/* User Detail Modal */}
      {selectedUserId && (
        <UserDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUserId(null);
          }}
          userId={selectedUserId}
        />
      )}
    </div>
  );
};

