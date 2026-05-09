import { useEffect, useState } from 'react';
import { uploadSliderImage } from '../services/storage';
import { listSlides, createSlide, updateSlide, deleteSlide, type SliderKind, type SliderItem } from '../services/sliders';
import { Layout } from '../components/Layout';

export const Sliders = () => {
  const [tab, setTab] = useState<SliderKind>('tips');
  const [items, setItems] = useState<SliderItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (kind: SliderKind) => {
    setLoading(true);
    const data = await listSlides(kind);
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(tab); }, [tab]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadSliderImage(file, tab);
      const nextOrder = (items[items.length - 1]?.order ?? -1) + 1;
      await createSlide(tab, {
        title: title || '',
        subtitle: subtitle || '',
        imageUrl: url,
        order: nextOrder,
        active: true,
        createdAt: Date.now(),
      });
      setTitle(''); setSubtitle(''); setFile(null);
      await load(tab);
    } finally {
      setUploading(false);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const a = items[index], b = items[target];
    await Promise.all([
      updateSlide(tab, a.id!, { order: b.order }),
      updateSlide(tab, b.id!, { order: a.order }),
    ]);
    await load(tab);
  };

  const toggleActive = async (id: string, active: boolean) => {
    await updateSlide(tab, id, { active: !active });
    await load(tab);
  };

  const remove = async (id: string) => {
    await deleteSlide(tab, id);
    await load(tab);
  };

  return (
    <Layout>
      <div className="p-8 min-h-screen bg-gradient-to-br from-[#111111] via-[#111111] to-[#0F0F0F] animate-fadeIn">
        <div className="mb-10">
          <h1 className="text-5xl font-ubuntu font-black mb-2 text-white tracking-tight">Sliders</h1>
          <p className="text-white/60 font-ubuntu-light">Manage Tips and Offers sliders</p>
        </div>

        <div className="mb-6 flex gap-3 flex-wrap">
          <button onClick={() => setTab('tips')} className={`px-4 py-2 rounded-xl border ${tab==='tips' ? 'bg-[#E31E24] text-white' : 'text-white/80 border-white/30 hover:bg-white/10'}`}>1. Tips</button>
          <button onClick={() => setTab('promos')} className={`px-4 py-2 rounded-xl border ${tab==='promos' ? 'bg-[#E31E24] text-white' : 'text-white/80 border-white/30 hover:bg-white/10'}`}>2. Promos (Electrician)</button>
          <button onClick={() => setTab('offers')} className={`px-4 py-2 rounded-xl border ${tab==='offers' ? 'bg-[#E31E24] text-white' : 'text-white/80 border-white/30 hover:bg-white/10'}`}>Offers</button>
          <button onClick={() => setTab('deals')} className={`px-4 py-2 rounded-xl border ${tab==='deals' ? 'bg-[#E31E24] text-white' : 'text-white/80 border-white/30 hover:bg-white/10'}`}>Deals</button>
        </div>

        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-white/10 rounded-2xl p-6 backdrop-blur-sm glow mb-8">
          <h2 className="text-2xl font-ubuntu font-black mb-4 text-white">Add slide</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <input type="text" placeholder="Title (optional)" value={title} onChange={e=>setTitle(e.target.value)} className="px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white" />
            <input type="text" placeholder="Subtitle (optional)" value={subtitle} onChange={e=>setSubtitle(e.target.value)} className="px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white" />
            <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] || null)} className="text-white" />
          </div>
          <div className="mt-4">
            <button onClick={handleUpload} disabled={!file || uploading} className="px-5 py-3 bg-[#E31E24] text-white rounded-xl disabled:opacity-50 font-ubuntu-bold">
              {uploading ? 'Uploading...' : 'Upload / Replace'}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#E31E24]/10 to-[#E31E24]/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-ubuntu-bold text-white/90 uppercase">Preview</th>
                <th className="px-4 py-4 text-left text-xs font-ubuntu-bold text-white/90 uppercase">Title</th>
                <th className="px-4 py-4 text-left text-xs font-ubuntu-bold text-white/90 uppercase">Subtitle</th>
                <th className="px-4 py-4 text-left text-xs font-ubuntu-bold text-white/90 uppercase">Active</th>
                <th className="px-4 py-4 text-left text-xs font-ubuntu-bold text-white/90 uppercase">Order</th>
                <th className="px-4 py-4 text-right text-xs font-ubuntu-bold text-white/90 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-white/60">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-white/60">No slides</td></tr>
              ) : items.map((it, i) => (
                <tr key={it.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <img 
                      src={it.imageUrl} 
                      alt="" 
                      className={`object-cover rounded-md border border-white/10 ${
                        tab === 'tips' 
                          ? 'h-[120px] w-[320px]'  // Match mobile app tipSlides height (120px) with proper aspect ratio
                          : 'h-[158px] w-[400px]'  // Match mobile app specialOfferSlides height (158px) with proper aspect ratio
                      }`}
                    />
                  </td>
                  <td className="px-4 py-3 text-white">{it.title || '-'}</td>
                  <td className="px-4 py-3 text-white/70">{it.subtitle || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-ubuntu-bold border ${it.active ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                      {it.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">{it.order}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => move(i, -1)} className="px-3 py-2 rounded-lg border border-white/10 text-white hover:bg-[#E31E24] hover:text-white">Up</button>
                      <button onClick={() => move(i, 1)} className="px-3 py-2 rounded-lg border border-white/10 text-white hover:bg-[#E31E24] hover:text-white">Down</button>
                      <button onClick={() => toggleActive(it.id!, it.active)} className="px-3 py-2 rounded-lg border border-white/10 text-white hover:bg-[#E31E24] hover:text-white">{it.active ? 'Disable' : 'Enable'}</button>
                      <button onClick={() => remove(it.id!)} className="px-3 py-2 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-black">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Sliders;
