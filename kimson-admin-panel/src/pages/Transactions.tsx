import { useEffect, useState } from 'react';
import { adminTransactionService, adminUserService } from '../services/adminService';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const Transactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    transactionId: string;
    status: 'approved' | 'rejected';
  }>({ isOpen: false, transactionId: '', status: 'approved' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allTransactions, pendingTransactions] = await Promise.all([
        adminTransactionService.getAllTransactions(),
        adminTransactionService.getPendingWithdrawals()
      ]);
      setTransactions(allTransactions);
      setPending(pendingTransactions);

      const userIds = [...new Set([...allTransactions.map((t) => t.userId), ...pendingTransactions.map((t) => t.userId)].filter(Boolean))];
      const names: Record<string, string> = {};
      await Promise.all(
        userIds.map(async (uid) => {
          const user = await adminUserService.getUserById(uid);
          names[uid] = user?.name || user?.phoneNumber || uid;
        })
      );
      setUserNames(names);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (transactionId: string, status: 'approved' | 'rejected') => {
    try {
      await adminTransactionService.updateTransactionStatus(transactionId, status);
      loadData(); // Reload data
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const openConfirmDialog = (transactionId: string, status: 'approved' | 'rejected') => {
    setConfirmDialog({ isOpen: true, transactionId, status });
  };

  const handleConfirmUpdate = () => {
    handleUpdateStatus(confirmDialog.transactionId, confirmDialog.status);
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <p className="text-white font-ubuntu-light">Loading transactions...</p>
      </div>
    );
  }

  const displayTransactions = activeTab === 'pending' ? pending : transactions;

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-[#111111] via-[#111111] to-[#0F0F0F] animate-fadeIn">
      <div className="mb-10">
        <h1 className="text-5xl font-ubuntu font-black mb-2 text-white tracking-tight">
          Transactions
        </h1>
        <p className="text-white/60 font-ubuntu-light">Manage user withdrawal requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 font-ubuntu-bold transition-all duration-300 relative ${
            activeTab === 'all'
              ? 'text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          All Transactions ({transactions.length})
          {activeTab === 'all' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white animate-slideIn" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 font-ubuntu-bold transition-all duration-300 relative ${
            activeTab === 'pending'
              ? 'text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Pending ({pending.length})
          {activeTab === 'pending' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white animate-slideIn" />
          )}
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm glow animate-fadeIn">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#E31E24]/10 to-[#E31E24]/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                  User ID
                </th>
                <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                  Username
                </th>
                <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                  Amount
                </th>
                <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                  Requested At
                </th>
                <th className="px-6 py-5 text-left text-xs font-ubuntu-bold text-white/90 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/50 font-ubuntu-light">
                    No transactions found
                  </td>
                </tr>
              ) : (
                displayTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-white/5 transition-all duration-200 group">
                    <td className="px-6 py-4 text-white font-ubuntu-medium text-sm group-hover:text-white transition-colors">
                      {transaction.userId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-white font-ubuntu-medium text-sm group-hover:text-white transition-colors">
                      {userNames[transaction.userId] ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-white font-ubuntu-bold text-lg">
                      ₹{transaction.amount || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-ubuntu-bold border ${
                        transaction.status === 'approved'
                          ? 'bg-green-500/10 border-green-500/30 text-green-400'
                          : transaction.status === 'rejected'
                          ? 'bg-red-500/10 border-red-500/30 text-red-400'
                          : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                      }`}>
                        {transaction.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60 font-ubuntu-light text-sm group-hover:text-white/80 transition-colors">
                      {transaction.requestedAt?.toDate?.()?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {transaction.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openConfirmDialog(transaction.id, 'approved')}
                            className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-xs font-ubuntu-bold hover:bg-green-500/20 transition-all duration-300 hover:scale-105"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openConfirmDialog(transaction.id, 'rejected')}
                            className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-ubuntu-bold hover:bg-red-500/20 transition-all duration-300 hover:scale-105"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, transactionId: '', status: 'approved' })}
        onConfirm={handleConfirmUpdate}
        title={`${confirmDialog.status === 'approved' ? 'Approve' : 'Reject'} Transaction`}
        message={`Are you sure you want to ${confirmDialog.status} this transaction? This action cannot be undone.`}
        confirmText={confirmDialog.status === 'approved' ? 'Approve' : 'Reject'}
        variant={confirmDialog.status === 'rejected' ? 'danger' : 'default'}
      />
    </div>
  );
};

