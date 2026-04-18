import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../config';

const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    targetRole: '',
    bio: '',
    avatar: ''
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const res = await fetch(API_ENDPOINTS.AUTH.ME, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
      }
    } catch (err) {
      toast.error('Không thể tải hồ sơ');
    } finally {
      setLoading(false);
    }
  };

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
      reader.onloadend = () => setUserData({ ...userData, avatar: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
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
        toast.success('Đã cập nhật hồ sơ!');
        setIsEditing(false);
      }
    } catch (err) {
      toast.error('Lỗi khi lưu');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
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
        toast.success('Đổi mật khẩu thành công!');
        setShowPasswordForm(false);
        setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || 'Lỗi đổi mật khẩu');
      }
    } catch (err) {
      toast.error('Lỗi server');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold opacity-50 uppercase tracking-widest">Đang tải...</div>;

  return (
    <div className="max-w-4xl pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-on-surface tracking-tighter mb-2">Hồ sơ cá nhân</h1>
          <p className="text-sm text-on-surface-variant font-medium opacity-70">Quản lý thông tin định danh và cài đặt bảo mật.</p>
        </div>
        {!isEditing && !showPasswordForm && (
           <div className="flex gap-3">
              <button 
                onClick={() => setShowPasswordForm(true)}
                className="bg-surface-container-high text-on-surface px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-outline-variant/20 transition-all border border-outline-variant/10"
              >
                Đổi mật khẩu
              </button>
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-primary text-on-primary px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all"
              >
                Thay đổi thông tin
              </button>
           </div>
        )}
      </header>

      {showPasswordForm ? (
        <div className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] p-10 shadow-xl max-w-md mx-auto animate-in zoom-in-95 duration-300">
           <h2 className="text-xl font-black text-on-surface mb-6 uppercase tracking-widest">Đổi mật khẩu</h2>
           <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Mật khẩu cũ</label>
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
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Mật khẩu mới</label>
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
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Nhập lại mật khẩu mới</label>
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
                   Hủy
                 </button>
                 <button 
                   type="submit" 
                   disabled={saving}
                   className="flex-1 bg-primary text-on-primary py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                 >
                   {saving ? 'Đang xử lý...' : 'Xác nhận'}
                 </button>
              </div>
           </form>
        </div>
      ) : (
        <div className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] p-10 shadow-xl">
          <div className="flex flex-col md:flex-row gap-12 items-start">
             <div className="flex flex-col items-center gap-4 shrink-0">
                <div 
                  onClick={handleAvatarClick}
                  className={`w-40 h-40 rounded-[3rem] overflow-hidden border-2 border-outline-variant/20 relative group transition-all ${isEditing ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}`}
                >
                  <img alt="avatar" className="w-full h-full object-cover" src={userData.avatar || `https://ui-avatars.com/api/?name=${userData.fullName || 'U'}&background=6366f1&size=256`} />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-50">Ảnh đại diện</p>
             </div>

             <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Họ và tên</label>
                 <input 
                   type="text" 
                   disabled={!isEditing}
                   placeholder="Ví dụ: Nguyễn Văn A"
                   value={userData.fullName} 
                   onChange={(e) => setUserData({...userData, fullName: e.target.value})} 
                   className={`w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface outline-none transition-all font-medium ${!isEditing ? 'opacity-70 cursor-not-allowed' : 'focus:ring-2 focus:ring-primary/20 focus:border-primary'}`} 
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Địa chỉ Email</label>
                 <input type="email" value={userData.email} readOnly className="w-full bg-surface-container border border-outline-variant/10 rounded-2xl px-5 py-4 text-on-surface-variant cursor-not-allowed font-medium" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Số điện thoại</label>
                 <input 
                   type="text" 
                   disabled={!isEditing}
                   placeholder="Ví dụ: 0912 345 678"
                   value={userData.phoneNumber} 
                   onChange={(e) => setUserData({...userData, phoneNumber: e.target.value})} 
                   className={`w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface outline-none transition-all font-medium ${!isEditing ? 'opacity-70 cursor-not-allowed' : 'focus:ring-2 focus:ring-primary/20 focus:border-primary'}`} 
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Vị trí mong muốn</label>
                 <input 
                   type="text" 
                   disabled={!isEditing}
                   placeholder="Ví dụ: Frontend Developer"
                   value={userData.targetRole} 
                   onChange={(e) => setUserData({...userData, targetRole: e.target.value})} 
                   className={`w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface outline-none transition-all font-medium ${!isEditing ? 'opacity-70 cursor-not-allowed' : 'focus:ring-2 focus:ring-primary/20 focus:border-primary'}`} 
                 />
               </div>
               <div className="md:col-span-2 space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Giới thiệu ngắn</label>
                 <textarea 
                   disabled={!isEditing}
                   placeholder="Hãy chia sẻ ngắn gọn về kinh nghiệm và định hướng của bạn..."
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
                Hủy
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={saving} 
                className="bg-primary text-on-primary px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
