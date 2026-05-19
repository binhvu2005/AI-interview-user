import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../../services/api.config';
import { fetchWithAuth } from '../../services/fetchClient';

const UpgradePage = () => {
  const { t, i18n } = useTranslation();
  const [isVip, setIsVip] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const isVi = i18n.language === 'vi';

  const checkVipStatus = async () => {
    try {
      const res = await fetchWithAuth(API_ENDPOINTS.AUTH.ME);
      if (res.ok) {
        const data = await res.json();
        setIsVip(data.isVip || false);
      }
    } catch (error) {
      console.error('Error checking VIP status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkVipStatus();
  }, []);

  const handleUpgradeToggle = async (targetVipStatus: boolean) => {
    setProcessing(true);
    try {
      const res = await fetchWithAuth(API_ENDPOINTS.AUTH.UPGRADE_VIP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVip: targetVipStatus })
      });

      if (res.ok) {
        setIsVip(targetVipStatus);
        
        // Notify other components (like Header/Sidebar) of the VIP status change
        localStorage.setItem('userVip', targetVipStatus ? 'true' : 'false');
        window.dispatchEvent(new Event('userUpdate'));

        if (targetVipStatus) {
          toast.success(isVi ? 'Chúc mừng! Tài khoản của bạn đã được nâng cấp lên VIP thành công! 🌟' : 'Congratulations! Your account has been upgraded to VIP! 🌟');
        } else {
          toast.success(isVi ? 'Tài khoản của bạn đã được chuyển về gói thường.' : 'Your account has been downgraded to Standard.');
        }
      } else {
        toast.error(isVi ? 'Thao tác thất bại. Vui lòng thử lại.' : 'Action failed. Please try again.');
      }
    } catch (error) {
      toast.error(isVi ? 'Đã xảy ra lỗi kết nối.' : 'A connection error occurred.');
    } finally {
      setProcessing(false);
    }
  };

  const vipFeatures = [
    isVi ? 'Phỏng vấn AI không giới hạn' : 'Unlimited AI Interviews',
    isVi ? 'Mô hình AI cao cấp (GPT-4o)' : 'Advanced AI Model (GPT-4o)',
    isVi ? 'Báo cáo Độ khớp chuyên sâu' : 'Deep Match Analysis',
    isVi ? 'Tương tác giọng nói thời gian thực' : 'Real-time Voice-to-Voice Interaction',
    isVi ? 'Hỗ trợ 24/7 chuyên nghiệp' : '24/7 Professional Support',
    isVi ? 'Phân tích chuyên sâu (Advanced Analytics)' : 'Advanced Analytics'
  ];

  const freeFeatures = [
    isVi ? 'Phỏng vấn AI giới hạn (3 lượt/tháng)' : 'Limited AI Interviews (3/month)',
    isVi ? 'Mô hình AI Tiêu chuẩn' : 'Standard AI Model',
    isVi ? 'Báo cáo Độ khớp cơ bản' : 'Basic Match Report',
    isVi ? 'Hỗ trợ cộng đồng' : 'Community Support'
  ];

  if (loading) {
    return (
      <div className="p-20 text-center font-bold opacity-50 uppercase tracking-widest animate-pulse">
        {t('results.loading')}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center mb-16 relative">
        <div className="mesh-gradient opacity-30"></div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase mb-6 border border-primary/20">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          {t('upgrade_page.tag')}
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-on-surface tracking-tighter mb-6 leading-none">
          {t('upgrade_page.title')} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            {t('upgrade_page.title_highlight')}
          </span>
        </h1>
        <p className="text-on-surface-variant text-lg max-w-2xl mx-auto opacity-80 leading-relaxed font-medium">
          {t('upgrade_page.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
        {/* Free Plan */}
        <div className={`bg-surface-container-low border rounded-[40px] p-10 flex flex-col group transition-all duration-500 ${!isVip ? 'border-primary/20 shadow-lg' : 'border-outline-variant/10'}`}>
          <div className="mb-8">
            <h3 className="text-xl font-bold text-on-surface mb-2">{t('upgrade_page.plan_free_name')}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-black text-on-surface">{t('upgrade_page.plan_free_price')}</span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed opacity-70">
              {t('upgrade_page.plan_free_desc')}
            </p>
          </div>

          <div className="space-y-4 mb-10 flex-1">
            {freeFeatures.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-on-surface-variant font-medium">
                <span className="material-symbols-outlined text-on-surface-variant/40 text-[20px]">check_circle</span>
                {f}
              </div>
            ))}
            <div className="flex items-center gap-3 text-sm text-on-surface-variant/40 font-medium italic">
              <span className="material-symbols-outlined text-[20px]">block</span>
              {isVi ? 'Phân tích chuyên sâu (Advanced Analytics)' : 'Advanced Analytics'}
            </div>
          </div>

          {isVip ? (
            <button 
              onClick={() => handleUpgradeToggle(false)}
              disabled={processing}
              className="w-full py-4 rounded-2xl bg-surface-container-highest text-on-surface hover:bg-red-500/10 hover:text-red-500 font-black text-xs uppercase tracking-widest border border-outline-variant/20 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {processing ? t('setup.analyzing') : (isVi ? 'Hạ cấp xuống gói Thường' : 'Downgrade to Standard')}
            </button>
          ) : (
            <button disabled className="w-full py-4 rounded-2xl bg-surface-container-highest text-on-surface-variant font-black text-xs uppercase tracking-widest border border-outline-variant/20 opacity-60">
              {t('upgrade_page.current_plan')}
            </button>
          )}
        </div>

        {/* VIP Plan */}
        <div className={`relative border-2 rounded-[40px] p-10 flex flex-col shadow-2xl transition-all duration-500 group overflow-hidden ${isVip ? 'border-yellow-500/40 bg-surface-container-lowest shadow-yellow-500/5' : 'border-primary/30 bg-surface-container-lowest shadow-primary/10 hover:-translate-y-2'}`}>
          {/* VIP status Badge */}
          <div className={`absolute top-6 right-6 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse ${isVip ? 'bg-yellow-500/20 text-yellow-500' : 'bg-primary text-on-primary'}`}>
            {isVip ? (isVi ? 'Đang hoạt động' : 'Active') : t('upgrade_page.popular_badge')}
          </div>
          
          {/* Animated Background Element */}
          <div className={`absolute top-0 left-0 w-full h-1 bg-[length:200%_auto] animate-gradient-x ${isVip ? 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500' : 'bg-gradient-to-r from-primary via-secondary to-primary'}`}></div>
          
          <div className="mb-8">
            <h3 className={`text-xl font-bold mb-2 ${isVip ? 'text-yellow-500' : 'text-primary'}`}>{t('upgrade_page.plan_vip_name')}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-5xl font-black text-on-surface">{t('upgrade_page.plan_vip_price')}</span>
              <span className="text-sm font-bold text-on-surface-variant">{t('upgrade_page.plan_vip_period')}</span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
              {t('upgrade_page.plan_vip_desc')}
            </p>
          </div>

          <div className="space-y-4 mb-10 flex-1">
            {vipFeatures.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-on-surface font-semibold group-hover:translate-x-1 transition-transform" style={{ transitionDelay: `${i * 50}ms` }}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isVip ? 'bg-yellow-500/10' : 'bg-primary/10'}`}>
                  <span className={`material-symbols-outlined text-[16px] font-bold ${isVip ? 'text-yellow-500' : 'text-primary'}`}>check</span>
                </div>
                {f}
              </div>
            ))}
          </div>

          {isVip ? (
            <button 
              disabled 
              className="w-full py-5 rounded-2xl bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 opacity-80"
            >
              <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
              {t('upgrade_page.current_plan')}
            </button>
          ) : (
            <button 
              onClick={() => handleUpgradeToggle(true)}
              disabled={processing}
              className="w-full py-5 rounded-2xl bg-primary text-on-primary font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden"
            >
              <span className="relative z-10">{processing ? t('setup.analyzing') : t('upgrade_page.upgrade_btn')}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          )}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-24 text-center">
        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] mb-10 opacity-40">Secure Payment Powered By</p>
        <div className="flex justify-center items-center gap-12 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <span className="font-bold text-xl tracking-tighter">STRIPE</span>
          <span className="font-bold text-xl tracking-tighter">PAYPAL</span>
          <span className="font-bold text-xl tracking-tighter">VISA</span>
          <span className="font-bold text-xl tracking-tighter">MASTERCARD</span>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;
