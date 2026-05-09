import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { uploadPdf } from '../services/storage';
import { getDocument, setDocument, type AdminDocMeta } from '../services/documents';

export const Documents = () => {
  const [priceMeta, setPriceMeta] = useState<AdminDocMeta | null>(null);
  const [productsMeta, setProductsMeta] = useState<AdminDocMeta | null>(null);
  const [priceFile, setPriceFile] = useState<File | null>(null);
  const [productsFile, setProductsFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([getDocument('pricelist'), getDocument('products')]);
    setPriceMeta(p); setProductsMeta(c);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (kind: 'pricelist'|'products') => {
    const file = kind === 'pricelist' ? priceFile : productsFile;
    if (!file) return;
    setSaving(true);
    try {
      const url = await uploadPdf(file, kind);
      await setDocument(kind, file.name, url);
      await load();
      if (kind === 'pricelist') setPriceFile(null); else setProductsFile(null);
    } finally {
      setSaving(false);
    }
  };

  const Card = ({ title, meta, kind }: { title: string; meta: AdminDocMeta | null; kind: 'pricelist'|'products' }) => (
    <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-white/10 rounded-2xl p-6 backdrop-blur-sm glow">
      <h2 className="text-2xl font-ubuntu font-black mb-4 text-white">{title}</h2>
      <div className="space-y-4">
        <div className="text-white/80">
          {meta ? (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-ubuntu-medium">Current:</span>
              <a href={meta.url} target="_blank" rel="noreferrer" className="text-white underline">{meta.title || 'View PDF'}</a>
              <span className="text-white/60 text-sm">
                {meta.updatedAt?.toDate ? new Date(meta.updatedAt.toDate()).toLocaleString() : ''}
              </span>
            </div>
          ) : (
            <span className="text-white/60">No file uploaded yet</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input type="file" accept="application/pdf" onChange={(e)=> (kind==='pricelist' ? setPriceFile(e.target.files?.[0] || null) : setProductsFile(e.target.files?.[0] || null))} className="text-white" />
          <button onClick={() => handleUpload(kind)} disabled={saving || !(kind==='pricelist' ? priceFile : productsFile)} className="px-5 py-3 bg-[#E31E24] text-white rounded-xl disabled:opacity-50 font-ubuntu-bold">
            {saving ? 'Uploading...' : 'Upload / Replace'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="p-8 min-h-screen bg-gradient-to-br from-[#111111] via-[#111111] to-[#0F0F0F] animate-fadeIn space-y-8">
        <div>
          <h1 className="text-5xl font-ubuntu font-black mb-2 text-white tracking-tight">Documents</h1>
          <p className="text-white/60 font-ubuntu-light">Upload or replace official PDFs</p>
        </div>
        {loading ? (
          <div className="text-white/70">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Price List PDF" meta={priceMeta} kind="pricelist" />
            <Card title="Products Catalog PDF" meta={productsMeta} kind="products" />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Documents;
