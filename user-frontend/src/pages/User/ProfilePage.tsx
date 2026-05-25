import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../../services/api.config';
import { fetchWithAuth } from '../../services/fetchClient';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';


const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    targetRole: '',
    bio: '',
    avatar: '',
    isVip: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [pwdForm, setPwdForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [heatmapData, setHeatmapData] = useState<{ date: string, count: number }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const res = await fetchWithAuth(API_ENDPOINTS.AUTH.ME, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      toast.error(t('notifications.profile_load_error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchHeatmap = async () => {
    try {
      const res = await fetchWithAuth(API_ENDPOINTS.INTERVIEWS.GET_HEATMAP);
      if (res.ok) {
        const data = await res.json();
        setHeatmapData(data);
      }
    } catch (error) {
      console.error('Fetch heatmap error:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchHeatmap();
  }, []);

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Tối đa 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setUserData({ ...userData, avatar: base64 });
        // Optional: Update localStorage immediately for instant feedback across header
        localStorage.setItem('userAvatar', base64);
        window.dispatchEvent(new Event('userUpdate'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!userData.fullName || userData.fullName.trim().length < 2) {
      toast.error(t('profile_page.name_too_short'));
      return;
    }

    if (userData.phoneNumber && userData.phoneNumber.trim()) {
      const phoneRegex = /^[0-9+]{9,12}$/;
      if (!phoneRegex.test(userData.phoneNumber.trim())) {
        toast.error(t('profile_page.invalid_phone'));
        return;
      }
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetchWithAuth(API_ENDPOINTS.AUTH.PROFILE, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const updated = await res.json();
        setUserData(updated);
        localStorage.setItem('userName', updated.fullName);
        if (updated.avatar) localStorage.setItem('userAvatar', updated.avatar);
        window.dispatchEvent(new Event('userUpdate'));
        toast.success(t('notifications.profile_save_success'));
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Profile save error:', error);
      toast.error(t('notifications.profile_save_error'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdForm.newPassword || pwdForm.newPassword.length < 6) {
      toast.error(t('profile_page.pwd_too_short'));
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error(t('notifications.pwd_mismatch'));
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetchWithAuth(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: pwdForm.oldPassword,
          newPassword: pwdForm.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(t('notifications.pwd_success'));
        setShowPasswordForm(false);
        setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || t('notifications.pwd_error'));
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(t('notifications.error_generic'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-20 text-sm font-medium text-on-surface-variant/50 uppercase tracking-widest animate-pulse">{t('results.loading')}</div>;

  return (
    <div className="max-w-4xl pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-on-surface tracking-tight mb-1.5">{t('profile_page.title')}</h1>
          <p className="text-sm text-on-surface-variant/70 font-medium">{t('profile_page.subtitle')}</p>
        </div>
        {!isEditing && !showPasswordForm && (
           <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button 
                onClick={() => setShowPasswordForm(true)}
                className="btn-secondary px-4 py-2.5 text-xs hover:-translate-y-0.5 w-full sm:w-auto"
              >
                {t('profile_page.change_pwd')}
              </button>
              <button 
                onClick={() => setIsEditing(true)}
                className="btn-primary px-4 py-2.5 text-xs hover:-translate-y-0.5 w-full sm:w-auto shadow-sm"
              >
                {t('profile_page.save_changes')}
              </button>
           </div>
        )}
      </header>

      {showPasswordForm ? (
        <div className="bg-surface border border-outline-variant/60 rounded-xl p-8 shadow-xl max-w-md mx-auto animate-in zoom-in-95 duration-300">
           <h2 className="text-base font-semibold text-on-surface mb-6 uppercase tracking-wider">{t('profile_page.pwd_modal.title')}</h2>
           <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant/70 ml-1">{t('profile_page.pwd_modal.old_pwd')}</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={pwdForm.oldPassword}
                  onChange={e => setPwdForm({...pwdForm, oldPassword: e.target.value})}
                  className="form-input w-full px-4 py-2.5 text-sm" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant/70 ml-1">{t('profile_page.pwd_modal.new_pwd')}</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={pwdForm.newPassword}
                  onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})}
                  className="form-input w-full px-4 py-2.5 text-sm" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant/70 ml-1">{t('profile_page.pwd_modal.confirm_pwd')}</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={pwdForm.confirmPassword}
                  onChange={e => setPwdForm({...pwdForm, confirmPassword: e.target.value})}
                  className="form-input w-full px-4 py-2.5 text-sm" 
                />
              </div>
              <div className="flex gap-3 pt-3">
                 <button 
                   type="button" 
                   onClick={() => setShowPasswordForm(false)}
                   className="flex-1 btn-secondary py-2 text-xs"
                 >
                   {t('profile_page.pwd_modal.cancel')}
                 </button>
                 <button 
                   type="submit" 
                   disabled={saving}
                   className="flex-1 btn-primary py-2 text-xs disabled:opacity-50"
                 >
                   {saving ? t('setup.analyzing') : t('profile_page.pwd_modal.submit')}
                 </button>
              </div>
           </form>
        </div>
      ) : (
        <div className="bg-surface border border-outline-variant/60 rounded-xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-start">
             <div className="flex flex-col items-center gap-3 shrink-0">
                <div 
                  onClick={handleAvatarClick}
                  className={`relative w-36 h-36 rounded-2xl flex items-center justify-center transition-all ${
                    userData.isVip 
                      ? 'ring-2 ring-amber-500/50 ring-offset-2 ring-offset-background shadow-md' 
                      : 'border border-outline-variant/60'
                  } ${isEditing ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : 'cursor-default'}`}
                >
                  <div className="relative w-full h-full rounded-2xl overflow-hidden bg-surface-container-low">
                    <img alt="avatar" className="w-full h-full object-cover rounded-2xl" src={userData.avatar || `https://ui-avatars.com/api/?name=${userData.fullName || 'U'}&background=6366f1&size=256`} />
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity hover:opacity-100 opacity-80">
                        <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                      </div>
                    )}
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/60">{t('profile_page.avatar_lbl')}</p>
                {userData.isVip && (
                  <div className="mt-2.5 flex items-center justify-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px] material-symbols-fill">workspace_premium</span>
                    <span>VIP Member</span>
                  </div>
                )}
             </div>

             <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 w-full">
               <div className="space-y-1.5">
                 <label className="text-xs font-semibold tracking-wide text-on-surface-variant/60 ml-1">{t('profile_page.fullname')}</label>
                 <input 
                   type="text" 
                   disabled={!isEditing}
                   placeholder={t('profile_page.fullname')}
                   value={userData.fullName} 
                   onChange={(e) => setUserData({...userData, fullName: e.target.value})} 
                   className={`form-input w-full px-4 py-2.5 text-sm font-medium ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`} 
                 />
               </div>
               <div className="space-y-1.5">
                 <label className="text-xs font-semibold tracking-wide text-on-surface-variant/60 ml-1">{t('profile_page.email')}</label>
                 <input type="email" value={userData.email} readOnly className="form-input w-full px-4 py-2.5 text-sm text-on-surface-variant/60 cursor-not-allowed font-medium opacity-60 bg-surface-container-low/50" />
               </div>
               <div className="space-y-1.5">
                 <label className="text-xs font-semibold tracking-wide text-on-surface-variant/60 ml-1">{t('profile_page.phone')}</label>
                 <input 
                   type="text" 
                   disabled={!isEditing}
                   placeholder={t('profile_page.phone_placeholder')}
                   value={userData.phoneNumber} 
                   onChange={(e) => setUserData({...userData, phoneNumber: e.target.value})} 
                   className={`form-input w-full px-4 py-2.5 text-sm font-medium ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`} 
                 />
               </div>
               <div className="space-y-1.5">
                 <label className="text-xs font-semibold tracking-wide text-on-surface-variant/60 ml-1">{t('profile_page.role')}</label>
                 <input 
                   type="text" 
                   disabled={!isEditing}
                   placeholder={t('profile_page.role_placeholder')}
                   value={userData.targetRole} 
                   onChange={(e) => setUserData({...userData, targetRole: e.target.value})} 
                   className={`form-input w-full px-4 py-2.5 text-sm font-medium ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`} 
                 />
               </div>
               <div className="md:col-span-2 space-y-1.5">
                 <label className="text-xs font-semibold tracking-wide text-on-surface-variant/60 ml-1">{t('profile_page.bio')}</label>
                 <textarea 
                   disabled={!isEditing}
                   placeholder={t('profile_page.bio_placeholder')}
                   value={userData.bio} 
                   onChange={(e) => setUserData({...userData, bio: e.target.value})} 
                   rows={3} 
                   className={`form-input w-full px-4 py-2.5 text-sm resize-none font-medium ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`} 
                 ></textarea>
               </div>
             </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-outline-variant/50">
              <button 
                type="button" 
                onClick={() => { setIsEditing(false); fetchProfile(); }}
                className="btn-secondary px-5 py-2 text-xs"
              >
                {t('profile_page.pwd_modal.cancel')}
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={saving} 
                className="btn-primary px-6 py-2 text-xs disabled:opacity-50 shadow-sm"
              >
                {saving ? t('settings.save') + '...' : t('profile_page.save_changes')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Contribution Heatmap */}
      {!showPasswordForm && (
        <div className="mt-8 bg-surface border border-outline-variant/60 rounded-xl p-6 md:p-8 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant/80 text-xl">calendar_month</span>
              <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wider">Hoạt động luyện tập</h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-semibold text-on-surface-variant/60">
              <span>Ít</span>
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-surface-container border border-outline-variant/60"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#6366f1]/20"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#6366f1]/60"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#6366f1]"></div>
              </div>
              <span>Nhiều</span>
            </div>
          </div>
          
          <div className="heatmap-container">
            <CalendarHeatmap
              startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
              endDate={new Date()}
              values={heatmapData}
              classForValue={(value: any) => {
                if (!value || value.count === 0) return 'color-empty';
                if (value.count < 3) return 'color-scale-1';
                if (value.count < 5) return 'color-scale-2';
                return 'color-scale-3';
              }}
              tooltipDataAttrs={(value: any) => {
                return {
                  'data-tip': value && value.date ? `${value.date}: ${value.count} lượt` : 'Không có hoạt động',
                } as any;
              }}
            />
          </div>
          
          <style>{`
            .heatmap-container {
              width: 100%;
              padding: 10px 0;
            }
            .react-calendar-heatmap .color-empty { fill: rgba(255, 255, 255, 0.03); }
            .react-calendar-heatmap .color-scale-1 { fill: rgba(99, 102, 241, 0.25); }
            .react-calendar-heatmap .color-scale-2 { fill: rgba(99, 102, 241, 0.6); }
            .react-calendar-heatmap .color-scale-3 { fill: rgba(99, 102, 241, 1); }
            .react-calendar-heatmap rect {
              rx: 1.5;
              ry: 1.5;
              transition: all 0.2s;
            }
            .react-calendar-heatmap rect:hover {
              stroke: rgba(255, 255, 255, 0.2);
              stroke-width: 1px;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
