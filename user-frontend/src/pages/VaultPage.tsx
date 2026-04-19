import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../config';

interface SavedCV {
  id: string;
  name: string;
  content: string;
  pdfData?: string;
  uploadDate: string;
}

const VaultPage = () => {
  const { t } = useTranslation();
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCV, setSelectedCV] = useState<SavedCV | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchVault();
  }, []);

  const fetchVault = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.AUTH.ME, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedCVs(data.savedCVs || []);
      }
    } catch (err) {
      toast.error(t('notifications.profile_load_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);
        const token = localStorage.getItem('token');
        const res = await fetch(API_ENDPOINTS.AUTH.CV, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        
        const data = await res.json();
        
        if (res.ok) {
          setSavedCVs(data);
          toast.success(t('vault_page.upload_success'));
        } else {
          toast.error(data.message || t('vault_page.upload_error'));
        }
      } catch (err: any) {
        toast.error(t('notifications.error_generic'));
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_ENDPOINTS.AUTH.CV}/${deleteConfirmId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updatedCVs = await res.json();
        setSavedCVs(updatedCVs);
        toast.success(t('vault_page.delete_success'));
      } else {
        toast.error(t('vault_page.delete_error'));
      }
    } catch (err) {
      toast.error(t('notifications.error_generic'));
    } finally {
      setDeleteConfirmId(null);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold opacity-50 uppercase tracking-widest">{t('results.loading')}</div>;

  return (
    <div className="max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight mb-2">{t('vault_page.title')}</h1>
          <p className="text-sm text-on-surface-variant font-medium opacity-70">{t('vault_page.subtitle')}</p>
        </div>
        <button 
          onClick={handleAddClick}
          disabled={uploading}
          className="bg-primary text-on-primary px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
        >
          <span className="material-symbols-outlined">{uploading ? 'sync' : 'cloud_upload'}</span>
          {uploading ? t('setup.analyzing') : t('vault_page.upload_btn')}
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedCVs.length > 0 ? (
          savedCVs.map(cv => (
            <div key={cv.id} className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] p-6 group hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
              </div>
              <h4 className="font-bold text-on-surface mb-1 truncate pr-8">{cv.name}</h4>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60 mb-8">
                {t('vault_page.date_prefix')} {new Date(cv.uploadDate).toLocaleDateString()}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                <button onClick={() => setSelectedCV(cv)} className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 hover:bg-primary-dim shadow-md">
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  {t('vault_page.view_original')}
                </button>
                <button onClick={() => setDeleteConfirmId(cv.id)} className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-error/10 hover:text-error transition-all">
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-24 bg-surface-container-low border border-dashed border-outline-variant/20 rounded-[40px]">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4">cloud_upload</span>
            <p className="text-sm font-bold text-on-surface-variant/40 uppercase tracking-widest">{t('vault_page.empty_state')}</p>
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {selectedCV && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-surface-container-high w-full max-w-5xl h-full rounded-[40px] shadow-2xl border border-outline-variant/15 overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
            <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-highest/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-on-surface tracking-tight truncate max-w-md">{selectedCV.name}</h2>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{t('vault_page.preview_title')}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCV(null)} className="w-12 h-12 rounded-full flex items-center justify-center bg-surface-container-highest text-on-surface-variant hover:text-on-surface hover:rotate-90 transition-all duration-300">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
            <div className="flex-1 bg-slate-900 overflow-hidden relative">
               {selectedCV.pdfData ? (
                 <iframe src={`data:application/pdf;base64,${selectedCV.pdfData}#toolbar=0`} className="w-full h-full border-none" title={selectedCV.name} />
               ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 space-y-4 text-center">
                    <span className="material-symbols-outlined text-6xl opacity-20">error</span>
                    <p className="text-sm font-bold uppercase tracking-[0.3em]">No PDF Data</p>
                 </div>
               )}
            </div>
            <div className="p-6 border-t border-outline-variant/10 bg-surface-container-highest/30 flex justify-end">
                <button onClick={() => setSelectedCV(null)} className="bg-on-surface text-surface px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">{t('vault_page.close_preview')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface-container-high w-full max-w-sm rounded-[32px] shadow-2xl border border-outline-variant/15 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error mx-auto mb-6">
                <span className="material-symbols-outlined text-3xl">delete_forever</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">{t('vault_page.confirm_delete')}</h3>
              <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">{t('vault_page.delete_desc')}</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 bg-surface-container-highest text-on-surface px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-outline-variant/20 transition-all">{t('vault_page.cancel')}</button>
                <button onClick={confirmDelete} className="flex-1 bg-error text-on-error px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-error-dim transition-all shadow-lg shadow-error/20">{t('vault_page.delete_now')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultPage;
