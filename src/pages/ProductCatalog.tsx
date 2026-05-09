import { useEffect, useState } from 'react';
import { uploadPdf, uploadImage } from '../services/storage';
import { getDocument, setDocument, type AdminDocMeta } from '../services/documents';

export const ProductCatalog = () => {
  const [meta, setMeta] = useState<AdminDocMeta | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingBoth, setUploadingBoth] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getDocument('products');
      setMeta(data);
    } catch (error) {
      console.error('Error loading product catalog:', error);
      setMeta(null); // Set to null on error so page can still render
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleImageUpload = async () => {
    if (!imageFile) return;
    setUploadingImage(true);
    try {
      const imageUrl = await uploadImage(imageFile, 'products');
      const currentTitle = meta?.title || imageFile.name;
      const currentPdfUrl = meta?.url || '';
      await setDocument('products', currentTitle, currentPdfUrl, imageUrl);
      await load();
      setImageFile(null);
      // Reset file input
      const fileInput = document.getElementById('product-catalog-image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error('Error uploading image:', error);
      const errorMessage = error?.message || 'Failed to upload image. Please try again.';
      alert(errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) return;
    setUploadingPdf(true);
    try {
      const pdfUrl = await uploadPdf(pdfFile, 'products');
      const currentImageUrl = meta?.imageUrl || '';
      await setDocument('products', pdfFile.name, pdfUrl, currentImageUrl);
      await load();
      setPdfFile(null);
      // Reset file input
      const fileInput = document.getElementById('product-catalog-pdf') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error('Error uploading PDF:', error);
      const errorMessage = error?.message || 'Failed to upload PDF. Please try again.';
      alert(errorMessage);
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleBothUpload = async () => {
    if (!imageFile || !pdfFile) {
      alert('Please select both image and PDF files');
      return;
    }
    setUploadingBoth(true);
    try {
      // Upload both files in parallel
      const [imageUrl, pdfUrl] = await Promise.all([
        uploadImage(imageFile, 'products'),
        uploadPdf(pdfFile, 'products')
      ]);
      
      // Save both URLs together
      await setDocument('products', pdfFile.name, pdfUrl, imageUrl);
      await load();
      
      // Reset file inputs
      setImageFile(null);
      setPdfFile(null);
      const imageInput = document.getElementById('product-catalog-image') as HTMLInputElement;
      const pdfInput = document.getElementById('product-catalog-pdf') as HTMLInputElement;
      if (imageInput) imageInput.value = '';
      if (pdfInput) pdfInput.value = '';
      
      alert('✅ Both image and PDF uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading both files:', error);
      const errorMessage = error?.message || 'Failed to upload files. Please try again.';
      alert(errorMessage);
    } finally {
      setUploadingBoth(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-[#111111] via-[#111111] to-[#0F0F0F] flex items-center justify-center">
        <p className="text-white font-ubuntu-light">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-[#111111] via-[#111111] to-[#0F0F0F] animate-fadeIn">
      <div className="mb-10">
        <h1 className="text-5xl font-ubuntu font-black mb-2 text-white tracking-tight">
          Product Catalog Management
        </h1>
        <p className="text-white/60 font-ubuntu-light">Upload product catalog image and PDF file (both will be displayed together in the mobile app)</p>
      </div>

      {/* Combined Preview Section */}
      {meta && (meta.imageUrl || meta.url) && (
        <div className="mb-6 bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-white/10 rounded-2xl p-6 backdrop-blur-sm glow">
          <h3 className="text-xl font-ubuntu font-black mb-4 text-white">📱 Mobile App Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meta.imageUrl && (
              <div>
                <p className="text-white/80 font-ubuntu-medium mb-2">Image Preview:</p>
                <img 
                  src={meta.imageUrl} 
                  alt="Product Catalog" 
                  className="w-full h-48 object-contain rounded-xl border border-white/10 bg-black/50"
                />
              </div>
            )}
            {meta.url && (
              <div>
                <p className="text-white/80 font-ubuntu-medium mb-2">PDF Document:</p>
                <div className="flex items-center gap-3 p-4 bg-black/50 rounded-xl border border-white/10">
                  <span className="text-4xl">📄</span>
                  <div className="flex-1">
                    <a 
                      href={meta.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-white underline hover:text-white/80 font-ubuntu-medium block"
                    >
                      {meta.title || 'View PDF'}
                    </a>
                    <p className="text-white/60 text-sm mt-1">
                      {meta.updatedAt?.toDate ? new Date(meta.updatedAt.toDate()).toLocaleString() : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Combined Upload Button */}
      {imageFile && pdfFile && (
        <div className="mb-6 bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-ubuntu font-black mb-2 text-white">Upload Both Files Together</h3>
              <p className="text-white/60 text-sm font-ubuntu-light">
                Ready to upload: {imageFile.name} + {pdfFile.name}
              </p>
            </div>
            <button
              onClick={handleBothUpload}
              disabled={uploadingBoth || uploadingImage || uploadingPdf}
              className="px-6 py-3 bg-green-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-ubuntu-bold hover:bg-green-600 transition-all duration-300 hover:scale-105"
            >
              {uploadingBoth ? 'Uploading Both...' : '🚀 Upload Both Together'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Upload Section */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-white/10 rounded-2xl p-6 backdrop-blur-sm glow">
          <h2 className="text-2xl font-ubuntu font-black mb-4 text-white">Product Catalog Image</h2>
          <div className="space-y-4">
            {meta?.imageUrl && (
              <div className="mb-4">
                <p className="text-white/80 font-ubuntu-medium mb-2">Current Image:</p>
                <div className="relative group">
                  <img 
                    src={meta.imageUrl} 
                    alt="Product Catalog" 
                    className="w-full h-64 object-contain rounded-xl border border-white/10 bg-black/50"
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
              </div>
            )}
            <div className="flex items-center gap-3">
              <input 
                id="product-catalog-image"
                type="file" 
                accept="image/*" 
                onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
                className="text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-white file:text-black file:font-ubuntu-medium file:cursor-pointer hover:file:bg-white/90"
                disabled={uploadingImage || uploadingBoth}
              />
              <button 
                onClick={handleImageUpload} 
                disabled={uploadingImage || uploadingBoth || !imageFile} 
                className="px-5 py-3 bg-[#E31E24] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-ubuntu-bold hover:bg-white/90 transition-all duration-300 hover:scale-105"
              >
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
            {imageFile && (
              <p className="text-white/60 text-sm font-ubuntu-light">
                Selected: {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        </div>

        {/* PDF Upload Section */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-white/10 rounded-2xl p-6 backdrop-blur-sm glow">
          <h2 className="text-2xl font-ubuntu font-black mb-4 text-white">Product Catalog PDF</h2>
          <div className="space-y-4">
            {meta?.url && (
              <div className="mb-4">
                <p className="text-white/80 font-ubuntu-medium mb-2">Current PDF:</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <a 
                    href={meta.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-white underline hover:text-white/80 font-ubuntu-medium flex items-center gap-2"
                  >
                    <span>📄</span>
                    <span>{meta.title || 'View PDF'}</span>
                  </a>
                  <span className="text-white/60 text-sm">
                    {meta.updatedAt?.toDate ? new Date(meta.updatedAt.toDate()).toLocaleString() : ''}
                  </span>
                </div>
              </div>
            )}
            {!meta?.url && (
              <p className="text-white/60 font-ubuntu-light">No PDF uploaded yet</p>
            )}
            <div className="flex items-center gap-3">
              <input 
                id="product-catalog-pdf"
                type="file" 
                accept="application/pdf" 
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)} 
                className="text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-white file:text-black file:font-ubuntu-medium file:cursor-pointer hover:file:bg-white/90"
                disabled={uploadingPdf || uploadingBoth}
              />
              <button 
                onClick={handlePdfUpload} 
                disabled={uploadingPdf || uploadingBoth || !pdfFile} 
                className="px-5 py-3 bg-[#E31E24] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-ubuntu-bold hover:bg-white/90 transition-all duration-300 hover:scale-105"
              >
                {uploadingPdf ? 'Uploading...' : 'Upload PDF'}
              </button>
            </div>
            {pdfFile && (
              <p className="text-white/60 text-sm font-ubuntu-light">
                Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="mt-6 bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-white/10 rounded-2xl p-6 backdrop-blur-sm glow">
        <h3 className="text-xl font-ubuntu font-black mb-4 text-white">Summary & Mobile App Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80 mb-4">
          <div>
            <p className="font-ubuntu-medium mb-1">Image Status:</p>
            <p className="text-white/60">
              {meta?.imageUrl ? '✅ Uploaded' : '❌ Not uploaded'}
            </p>
          </div>
          <div>
            <p className="font-ubuntu-medium mb-1">PDF Status:</p>
            <p className="text-white/60">
              {meta?.url ? '✅ Uploaded' : '❌ Not uploaded'}
            </p>
          </div>
        </div>
        <div className="pt-4 border-t border-white/10">
          <p className="font-ubuntu-medium mb-2 text-white">Mobile App Display:</p>
          <p className="text-white/60 text-sm">
            {meta?.imageUrl && meta?.url 
              ? '✅ Ready - Both image and PDF will be displayed together in the mobile app'
              : meta?.imageUrl || meta?.url
              ? '⚠️ Partial - Upload both image and PDF for complete display'
              : '❌ Not ready - Upload both image and PDF files'}
          </p>
          {meta?.imageUrl && meta?.url && (
            <p className="text-green-400 text-sm mt-2 font-ubuntu-light">
              📱 Firestore Path: settings/documents/products/latest
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;

