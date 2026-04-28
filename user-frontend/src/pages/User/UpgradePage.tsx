import React from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const UpgradePage = () => {
  const { t } = useTranslation();

  const handleUpgrade = () => {
    toast.success('Redirecting to secure payment...');
    // Simulate payment redirect
  };

  const vipFeatures = [
    t('upgrade_page.feature_unlimited'),
    t('upgrade_page.feature_advanced_ai'),
    t('upgrade_page.feature_cv_export'),
    t('upgrade_page.feature_priority'),
    t('upgrade_page.feature_no_ads'),
    t('upgrade_page.feature_custom_roles'),
    t('upgrade_page.feature_voice')
  ];

  const freeFeatures = [
    t('upgrade_page.feature_unlimited').replace('Unlimited', '3 Free'),
    'Standard AI Model',
    'Standard CV View',
    'Community Support'
  ];

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
        <div className="bg-surface-container-low border border-outline-variant/10 rounded-[40px] p-10 flex flex-col group hover:border-on-surface/10 transition-all duration-500">
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
              Advanced Analytics
            </div>
          </div>

          <button disabled className="w-full py-4 rounded-2xl bg-surface-container-highest text-on-surface-variant font-black text-xs uppercase tracking-widest border border-outline-variant/20 opacity-60">
            {t('upgrade_page.current_plan')}
          </button>
        </div>

        {/* VIP Plan */}
        <div className="relative bg-surface-container-lowest border-2 border-primary/30 rounded-[40px] p-10 flex flex-col shadow-2xl shadow-primary/10 overflow-hidden transform hover:-translate-y-2 transition-all duration-500 group">
          {/* Popular Badge */}
          <div className="absolute top-6 right-6 bg-primary text-on-primary text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
            {t('upgrade_page.popular_badge')}
          </div>
          
          {/* Animated Background Element */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-x"></div>
          
          <div className="mb-8">
            <h3 className="text-xl font-bold text-primary mb-2">{t('upgrade_page.plan_vip_name')}</h3>
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
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[16px] font-bold">check</span>
                </div>
                {f}
              </div>
            ))}
          </div>

          <button 
            onClick={handleUpgrade}
            className="w-full py-5 rounded-2xl bg-primary text-on-primary font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden"
          >
            <span className="relative z-10">{t('upgrade_page.upgrade_btn')}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>
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
