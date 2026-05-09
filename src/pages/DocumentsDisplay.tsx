import { useEffect, useState } from 'react';
import { getDocument, type AdminDocMeta } from '../services/documents';

export const DocumentsDisplay = () => {
  const [priceList, setPriceList] = useState<AdminDocMeta | null>(null);
  const [products, setProducts] = useState<AdminDocMeta | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [priceData, productsData] = await Promise.all([
        getDocument('pricelist'),
        getDocument('products')
      ]);
      setPriceList(priceData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-[#111111] via-[#111111] to-[#0F0F0F] flex items-center justify-center">
        <p className="text-white font-ubuntu-light">Loading...</p>
      </div>
    );
  }

  const DocumentCard = ({ 
    title, 
    meta
  }: { 
    title: string; 
    meta: AdminDocMeta | null; 
  }) => {
    const hasData = meta && (meta.imageUrl || meta.url);
    
    return (
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-white/10 rounded-2xl p-6 backdrop-blur-sm glow hover:border-white/40 transition-all duration-300">
        <h3 className="text-2xl font-ubuntu font-black mb-4 text-white">{title}</h3>
        
        {hasData ? (
          <div className="space-y-4">
            {/* Image Display */}
            {meta?.imageUrl ? (
              <div className="relative group">
                <img 
                  src={meta.imageUrl} 
                  alt={title}
                  className="w-full h-64 object-contain rounded-xl border border-white/10 bg-black/50 group-hover:border-white/40 transition-all"
                />
                <a 
                  href={meta.imageUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                >
                  <span className="text-white font-ubuntu-bold">View Full Size</span>
                </a>
              </div>
            ) : (
              <div className="w-full h-64 flex items-center justify-center rounded-xl border border-white/10 bg-black/50">
                <p className="text-white/40 font-ubuntu-light">No image uploaded</p>
              </div>
            )}

            {/* PDF Link */}
            {meta?.url ? (
              <div className="flex items-center gap-3 p-4 bg-black/50 rounded-xl border border-white/10 hover:border-white/40 transition-all">
                <span className="text-4xl">📄</span>
                <div className="flex-1">
                  <a 
                    href={meta.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-white underline hover:text-white/80 font-ubuntu-medium block mb-1"
                  >
                    {meta.title || 'Download PDF'}
                  </a>
                  <p className="text-white/60 text-sm">
                    {meta.updatedAt?.toDate 
                      ? new Date(meta.updatedAt.toDate()).toLocaleString() 
                      : 'Recently updated'}
                  </p>
                </div>
                <a
                  href={meta.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#E31E24] text-white rounded-lg font-ubuntu-bold hover:bg-white/90 transition-all"
                >
                  Open
                </a>
              </div>
            ) : (
              <div className="p-4 bg-black/50 rounded-xl border border-white/10">
                <p className="text-white/40 font-ubuntu-light text-center">No PDF uploaded</p>
              </div>
            )}

            {/* Status Badge */}
            <div className="flex items-center gap-2 pt-2">
              {meta?.imageUrl && meta?.url ? (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-ubuntu-medium border border-green-500/30">
                  ✅ Complete
                </span>
              ) : meta?.imageUrl || meta?.url ? (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-ubuntu-medium border border-yellow-500/30">
                  ⚠️ Partial
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-ubuntu-medium border border-red-500/30">
                  ❌ Not Ready
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 rounded-xl border border-white/10 bg-black/50">
            <p className="text-white/40 font-ubuntu-light">No data available</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-[#111111] via-[#111111] to-[#0F0F0F] animate-fadeIn">
      <div className="mb-10">
        <h1 className="text-5xl font-ubuntu font-black mb-2 text-white tracking-tight">
          Documents Display
        </h1>
        <p className="text-white/60 font-ubuntu-light">View products and price list with images and PDF links</p>
      </div>

      {/* Three Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Products */}
        <DocumentCard 
          title="Product Catalog" 
          meta={products}
        />

        {/* Column 2: Price List */}
        <DocumentCard 
          title="Price List" 
          meta={priceList}
        />

        {/* Column 3: Empty or Future Use */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-white/10 rounded-2xl p-6 backdrop-blur-sm opacity-50">
          <h3 className="text-2xl font-ubuntu font-black mb-4 text-white/60">Reserved</h3>
          <div className="flex items-center justify-center h-64 rounded-xl border border-white/10 bg-black/50">
            <p className="text-white/30 font-ubuntu-light text-center">
              Available for<br />future content
            </p>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={load}
          disabled={loading}
          className="px-6 py-3 bg-[#E31E24] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-ubuntu-bold hover:bg-white/90 transition-all duration-300 hover:scale-105"
        >
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>
    </div>
  );
};

export default DocumentsDisplay;

