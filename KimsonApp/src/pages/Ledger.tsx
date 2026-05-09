import { useEffect, useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { collection, getDocs, orderBy, query, } from 'firebase/firestore';
import { db } from '../config/firebase';

interface LedgerItem {
  id: string;
  createdAt: any;
  userId: string;
  kind: 'reward' | 'withdrawal';
  title: string;
  description: string;
  amount?: number;
  points?: number;
  status?: string;
}

export const Ledger = () => {
  const [items, setItems] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'all'|'reward'|'withdrawal'>('all');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  const load = async () => {
    setLoading(true);
    const out: LedgerItem[] = [];

    try {
      const rq = query(collection(db, 'rewards'), orderBy('createdAt', 'desc'));
      const rs = await getDocs(rq);
      for (const d of rs.docs) {
        const data: any = d.data();
        out.push({
          id: d.id,
          createdAt: data.createdAt,
          userId: data.userId || '-',
          kind: 'reward',
          title: data.type || 'Reward',
          description: data.description || '',
          points: data.points || 0,
        });
      }
    } catch (e) {
      const rs = await getDocs(collection(db, 'rewards'));
      for (const d of rs.docs) {
        const data: any = d.data();
        out.push({ id: d.id, createdAt: data.createdAt, userId: data.userId || '-', kind: 'reward', title: data.type || 'Reward', description: data.description || '', points: data.points || 0 });
      }
    }

    try {
      const tq = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
      const ts = await getDocs(tq);
      for (const d of ts.docs) {
        const data: any = d.data();
        out.push({
          id: d.id,
          createdAt: data.createdAt,
          userId: data.userId || '-',
          kind: 'withdrawal',
          title: 'Withdrawal',
          description: data.method || 'Withdrawal',
          amount: data.amount || 0,
          status: data.status || 'pending',
        });
      }
    } catch (e) {
      const ts = await getDocs(collection(db, 'transactions'));
      for (const d of ts.docs) {
        const data: any = d.data();
        out.push({ id: d.id, createdAt: data.createdAt, userId: data.userId || '-', kind: 'withdrawal', title: 'Withdrawal', description: data.method || 'Withdrawal', amount: data.amount || 0, status: data.status || 'pending' });
      }
    }

    setItems(out.sort((a,b) => (b.createdAt?.toDate?.()?.getTime?.() || 0) - (a.createdAt?.toDate?.()?.getTime?.() || 0)));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return items.filter(it => {
      if (type !== 'all' && it.kind !== type) return false;
      if (search && !(`${it.userId}`.toLowerCase()).includes(search.toLowerCase())) return false;
      const t = it.createdAt?.toDate?.() as Date | undefined;
      if (from) { const f = new Date(from); if (t && t < f) return false; }
      if (to) { const tt = new Date(to); if (t && t > tt) return false; }
      return true;
    });
  }, [items, type, search, from, to]);

  return (
    <Layout>
      <div className="p-8 min-h-screen bg-gradient-to-br from-black via-black to-gray-900 animate-fadeIn">
        <div className="mb-10">
          <h1 className="text-5xl font-ubuntu font-black mb-2 text-white tracking-tight">Ledger</h1>
          <p className="text-white/60 font-ubuntu-light">Unified view of rewards and withdrawals</p>
        </div>

        <div className="bg-gradient-to-br from-black/90 to-black/70 border border-white/20 rounded-2xl p-6 backdrop-blur-sm glow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-white" />
            <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-white" />
            <select value={type} onChange={e=>setType(e.target.value as any)} className="px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-white">
              <option value="all">All</option>
              <option value="reward">Rewards</option>
              <option value="withdrawal">Withdrawals</option>
            </select>
            <input placeholder="Search by userId" value={search} onChange={e=>setSearch(e.target.value)} className="px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-white" />
            <button onClick={load} className="px-5 py-3 bg-white text-black rounded-xl font-ubuntu-bold">Refresh</button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-black/90 to-black/70 border border-white/20 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-white/10 to-white/5 border-b border-white/20">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-ubuntu-bold text-white/90 uppercase">Date</th>
                <th className="px-4 py-4 text-left text-xs font-ubuntu-bold text-white/90 uppercase">Type</th>
                <th className="px-4 py-4 text-left text-xs font-ubuntu-bold text-white/90 uppercase">User</th>
                <th className="px-4 py-4 text-left text-xs font-ubuntu-bold text-white/90 uppercase">Description</th>
                <th className="px-4 py-4 text-left text-xs font-ubuntu-bold text-white/90 uppercase">Points</th>
                <th className="px-4 py-4 text-left text-xs font-ubuntu-bold text-white/90 uppercase">Amount</th>
                <th className="px-4 py-4 text-left text-xs font-ubuntu-bold text-white/90 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-white/60">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-white/60">No entries</td></tr>
              ) : filtered.map((it) => (
                <tr key={`${it.kind}-${it.id}`} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-white/80">{it.createdAt?.toDate?.()?.toLocaleString?.() || '-'}</td>
                  <td className="px-4 py-3 text-white">{it.kind}</td>
                  <td className="px-4 py-3 text-white/80">{it.userId}</td>
                  <td className="px-4 py-3 text-white/80">{it.title}{it.description ? ` — ${it.description}` : ''}</td>
                  <td className="px-4 py-3 text-white">{it.points ?? '-'}</td>
                  <td className="px-4 py-3 text-white">{it.amount ?? '-'}</td>
                  <td className="px-4 py-3 text-white/80">{it.status ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Ledger;





