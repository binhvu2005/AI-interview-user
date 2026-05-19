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

  if (loading) return <div className="p-20 text-center font-bold opacity-50 uppercase tracking-widest">{t('results.loading')}</div>;

  return (
    <div className="max-w-4xl pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-on-surface tracking-tighter mb-2">{t('profile_page.title')}</h1>
          <p className="text-sm text-on-surface-variant font-medium opacity-70">{t('profile_page.subtitle')}</p>
        </div>
        {!isEditing && !showPasswordForm && (
           <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button 
                onClick={() => setShowPasswordForm(true)}
                className="bg-surface-container-high text-on-surface px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-outline-variant/20 transition-all border border-outline-variant/10 w-full sm:w-auto"
              >
                {t('profile_page.change_pwd')}
              </button>
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-primary text-on-primary px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all w-full sm:w-auto"
              >
                {t('profile_page.save_changes')}
              </button>
           </div>
        )}
      </header>

      {showPasswordForm ? (
        <div className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] p-10 shadow-xl max-w-md mx-auto animate-in zoom-in-95 duration-300">
           <h2 className="text-xl font-black text-on-surface mb-6 uppercase tracking-widest">{t('profile_page.pwd_modal.title')}</h2>
           <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">{t('profile_page.pwd_modal.old_pwd')}</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={pwdForm.oldPassword}
                  onChange={e => setPwdForm({...pwdForm, oldPassword: e.target.value})}
                  className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">{t('profile_page.pwd_modal.new_pwd')}</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={pwdForm.newPassword}
                  onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})}
                  className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">{t('profile_page.pwd_modal.confirm_pwd')}</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={pwdForm.confirmPassword}
                  onChange={e => setPwdForm({...pwdForm, confirmPassword: e.target.value})}
                  className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                />
              </div>
              <div className="flex gap-4 pt-4">
                 <button 
                   type="button" 
                   onClick={() => setShowPasswordForm(false)}
                   className="flex-1 bg-surface-container-highest text-on-surface-variant py-4 rounded-2xl font-bold text-xs uppercase tracking-widest"
                 >
                   {t('profile_page.pwd_modal.cancel')}
                 </button>
                 <button 
                   type="submit" 
                   disabled={saving}
                   className="flex-1 bg-primary text-on-primary py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                 >
                   {saving ? t('setup.analyzing') : t('profile_page.pwd_modal.submit')}
                 </button>
              </div>
           </form>
        </div>
      ) : (
        <div className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] p-6 md:p-10 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
             <div className="flex flex-col items-center gap-4 shrink-0">
                <div 
                  onClick={handleAvatarClick}
                  className={`relative w-40 h-40 rounded-[3rem] flex items-center justify-center transition-all ${
                    userData.isVip 
                      ? 'ring-4 ring-amber-400 ring-offset-4 ring-offset-background shadow-[0_0_30px_rgba(245,158,11,0.4)] border-none' 
                      : 'border-2 border-outline-variant/20'
                  } ${isEditing ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}`}
                >
                  {userData.isVip && (
                    <span className="absolute inset-0 rounded-[3rem] bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 opacity-90 blur-[2px] animate-pulse pointer-events-none"></span>
                  )}
                  <div className={`relative w-full h-full rounded-[3rem] overflow-hidden ${userData.isVip ? 'p-[3px] bg-background' : ''}`}>
                    <img alt="avatar" className="w-full h-full object-cover rounded-[3rem]" src={userData.avatar || `https://ui-avatars.com/api/?name=${userData.fullName || 'U'}&background=6366f1&size=256`} />
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                      </div>
                    )}
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-50">{t('profile_page.avatar_lbl')}</p>
                {userData.isVip && (
                  <div className="mt-2 flex items-center justify-center gap-1.5 badge-vip-animated px-5 py-2.5 rounded-2xl shadow-lg shadow-yellow-500/20 border-none">
                    <span className="material-symbols-outlined text-[18px] material-symbols-fill">workspace_premium</span>
                    <span className="text-xs font-black uppercase tracking-widest">VIP Member</span>
                  </div>
                )}
             </div>

             <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">{t('profile_page.fullname')}</label>
                 <input 
                   type="text" 
                   disabled={!isEditing}
                   placeholder={t('profile_page.fullname')}
                   value={userData.fullName} 
                   onChange={(e) => setUserData({...userData, fullName: e.target.value})} 
                   className={`w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface outline-none transition-all font-medium ${!isEditing ? 'opacity-70 cursor-not-allowed' : 'focus:ring-2 focus:ring-primary/20 focus:border-primary'}`} 
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">{t('profile_page.email')}</label>
                 <input type="email" value={userData.email} readOnly className="w-full bg-surface-container border border-outline-variant/10 rounded-2xl px-5 py-4 text-on-surface-variant cursor-not-allowed font-medium" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">{t('profile_page.phone')}</label>
                 <input 
                   type="text" 
                   disabled={!isEditing}
                   placeholder={t('profile_page.phone_placeholder')}
                   value={userData.phoneNumber} 
                   onChange={(e) => setUserData({...userData, phoneNumber: e.target.value})} 
                   className={`w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface outline-none transition-all font-medium ${!isEditing ? 'opacity-70 cursor-not-allowed' : 'focus:ring-2 focus:ring-primary/20 focus:border-primary'}`} 
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">{t('profile_page.role')}</label>
                 <input 
                   type="text" 
                   disabled={!isEditing}
                   placeholder={t('profile_page.role_placeholder')}
                   value={userData.targetRole} 
                   onChange={(e) => setUserData({...userData, targetRole: e.target.value})} 
                   className={`w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface outline-none transition-all font-medium ${!isEditing ? 'opacity-70 cursor-not-allowed' : 'focus:ring-2 focus:ring-primary/20 focus:border-primary'}`} 
                 />
               </div>
               <div className="md:col-span-2 space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">{t('profile_page.bio')}</label>
                 <textarea 
                   disabled={!isEditing}
                   placeholder={t('profile_page.bio_placeholder')}
                   value={userData.bio} 
                   onChange={(e) => setUserData({...userData, bio: e.target.value})} 
                   rows={3} 
                   className={`w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface outline-none transition-all resize-none font-medium ${!isEditing ? 'opacity-70 cursor-not-allowed' : 'focus:ring-2 focus:ring-primary/20 focus:border-primary'}`} 
                 ></textarea>
               </div>
             </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-4 mt-10">
              <button 
                type="button" 
                onClick={() => { setIsEditing(false); fetchProfile(); }}
                className="bg-surface-container-highest text-on-surface-variant px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-outline-variant/20 transition-all"
              >
                {t('profile_page.pwd_modal.cancel')}
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={saving} 
                className="bg-primary text-on-primary px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {saving ? t('settings.save') + '...' : t('profile_page.save_changes')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Contribution Heatmap */}
      {!showPasswordForm && (
        <div className="mt-8 bg-surface-container-low border border-outline-variant/15 rounded-[32px] p-6 md:p-10 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">calendar_month</span>
              <h3 className="text-xl font-black text-on-surface uppercase tracking-widest">Hoạt động luyện tập</h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant opacity-60">
              <span>Ít</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-surface-container-highest"></div>
                <div className="w-3 h-3 rounded-sm bg-primary/30"></div>
                <div className="w-3 h-3 rounded-sm bg-primary/60"></div>
                <div className="w-3 h-3 rounded-sm bg-primary"></div>
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
            .react-calendar-heatmap .color-empty { fill: rgba(255, 255, 255, 0.05); }
            .react-calendar-heatmap .color-scale-1 { fill: rgba(99, 102, 241, 0.3); }
            .react-calendar-heatmap .color-scale-2 { fill: rgba(99, 102, 241, 0.6); }
            .react-calendar-heatmap .color-scale-3 { fill: rgba(99, 102, 241, 1); }
            .react-calendar-heatmap rect {
               rx: 2;
               ry: 2;
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
