import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../../services/api.config';
import { fetchWithAuth } from '../../services/fetchClient';


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

  const fetchVault = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetchWithAuth(API_ENDPOINTS.AUTH.ME, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedCVs(data.savedCVs || []);
      }
    } catch (error) {
      console.error('Fetch vault error:', error);
      toast.error(t('notifications.profile_load_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVault();
  }, []);

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
        const res = await fetchWithAuth(API_ENDPOINTS.AUTH.CV, {
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
      } catch (error) {
        console.error('File upload error:', error);
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
      const res = await fetchWithAuth(`${API_ENDPOINTS.AUTH.CV}/${deleteConfirmId}`, {
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
    } catch (error) {
      console.error('Delete CV error:', error);
      toast.error(t('notifications.error_generic'));
    } finally {
      setDeleteConfirmId(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-20 text-sm font-medium text-on-surface-variant/50 uppercase tracking-widest animate-pulse">{t('results.loading')}</div>;

  return (
    <div className="max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-semibold text-on-surface tracking-tight mb-1.5">{t('vault_page.title')}</h1>
          <p className="text-sm text-on-surface-variant/70 font-medium">{t('vault_page.subtitle')}</p>
        </div>
        <button 
          onClick={handleAddClick}
          disabled={uploading}
          className="bg-white text-black hover:bg-neutral-200 px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">{uploading ? 'sync' : 'cloud_upload'}</span>
          {uploading ? t('setup.analyzing') : t('vault_page.upload_btn')}
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedCVs.length > 0 ? (
          savedCVs.map(cv => (
            <div key={cv.id} className="bg-surface-container-low/50 backdrop-blur-md border border-white/[0.06] rounded-xl p-6 group hover:border-white/[0.12] transition-all duration-300 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/[0.03] transition-colors pointer-events-none"></div>
              
              <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white mb-5 group-hover:scale-105 transition-all duration-300">
                <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
              </div>
              
              <h4 className="font-semibold text-on-surface mb-1 truncate pr-8 text-sm">{cv.name}</h4>
              <p className="text-[11px] text-on-surface-variant/50 uppercase tracking-wider mb-6">
                {t('vault_page.date_prefix')} {new Date(cv.uploadDate).toLocaleDateString()}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                <button 
                  onClick={() => setSelectedCV(cv)} 
                  className="bg-white/[0.04] text-on-surface border border-white/[0.08] hover:bg-white/[0.08] px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  {t('vault_page.view_original')}
                </button>
                <button 
                  onClick={() => setDeleteConfirmId(cv.id)} 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant/60 hover:bg-error/10 hover:text-error transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-surface-container-low/40 border border-dashed border-white/[0.08] rounded-xl">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/20 mb-4">cloud_upload</span>
            <p className="text-xs font-medium text-on-surface-variant/50 uppercase tracking-wider">{t('vault_page.empty_state')}</p>
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {selectedCV && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#09090b] w-full max-w-5xl h-full rounded-xl shadow-2xl border border-white/[0.08] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center bg-[#121214]/50">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-on-surface tracking-tight truncate max-w-md">{selectedCV.name}</h2>
                  <p className="text-[9px] font-semibold text-white/40 uppercase tracking-wider mt-0.5">{t('vault_page.preview_title')}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCV(null)} 
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.04] border border-white/[0.08] text-on-surface-variant/80 hover:text-on-surface hover:rotate-90 transition-all duration-300"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            
            <div className="flex-1 bg-[#030303] overflow-hidden relative">
               {selectedCV.pdfData ? (
                 <iframe src={`data:application/pdf;base64,${selectedCV.pdfData}#toolbar=0`} className="w-full h-full border-none opacity-90" title={selectedCV.name} />
               ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 space-y-4 text-center">
                    <span className="material-symbols-outlined text-5xl opacity-40">error</span>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]">No PDF Data</p>
                 </div>
               )}
            </div>
            
            <div className="p-4 border-t border-white/[0.06] bg-[#121214]/50 flex justify-end">
                <button 
                  onClick={() => setSelectedCV(null)} 
                  className="bg-white text-black hover:bg-neutral-200 px-6 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all"
                >
                  {t('vault_page.close_preview')}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#09090b] w-full max-w-sm rounded-xl shadow-2xl border border-white/[0.08] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error mx-auto mb-4">
                <span className="material-symbols-outlined text-2xl">delete_forever</span>
              </div>
              <h3 className="text-base font-semibold text-on-surface mb-1.5">{t('vault_page.confirm_delete')}</h3>
              <p className="text-xs text-on-surface-variant/75 mb-6 leading-relaxed px-2">{t('vault_page.delete_desc')}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmId(null)} 
                  className="flex-1 bg-white/[0.04] text-on-surface border border-white/[0.08] hover:bg-white/[0.08] px-4 py-2.5 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all"
                >
                  {t('vault_page.cancel')}
                </button>
                <button 
                  onClick={confirmDelete} 
                  className="flex-1 bg-error text-on-error hover:bg-error/90 px-4 py-2.5 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all shadow-md shadow-error/15"
                >
                  {t('vault_page.delete_now')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultPage;
