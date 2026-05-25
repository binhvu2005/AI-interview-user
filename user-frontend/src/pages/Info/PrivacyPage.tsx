import React from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyPage = () => {
  const { t } = useTranslation();

  const sections = [1, 2, 3, 4, 5];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      {/* Hero Header */}
      <div className="text-center mb-12 relative overflow-hidden p-8 sm:p-12 rounded-[40px] bg-gradient-to-tr from-primary/5 via-secondary/5 to-transparent border border-outline-variant/10">
        <div className="absolute inset-0 mesh-gradient opacity-30"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-3xl">gavel</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 text-on-surface">
            {t('privacy_page.title')}
          </h1>
          <p className="text-on-surface-variant font-medium text-lg max-w-xl mx-auto leading-relaxed">
            {t('privacy_page.desc')}
          </p>
        </div>
      </div>

      {/* Policy Content */}
      <div className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] p-8 sm:p-10 shadow-sm space-y-8">
        <div className="border-b border-outline-variant/10 pb-6">
          <p className="text-xs text-on-surface-variant/60 font-bold uppercase tracking-wider">
            {t('privacy_page.last_updated')}
          </p>
        </div>

        <p className="text-sm text-on-surface-variant leading-relaxed">
          {t('privacy_page.intro')}
        </p>

        <div className="space-y-8 pt-4">
          {sections.map((num) => (
            <section key={num} className="space-y-3">
              <h2 className="text-lg font-black text-on-surface">
                {t(`privacy_page.sections.${num}.title`)}
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {t(`privacy_page.sections.${num}.content`)}
              </p>
            </section>
          ))}
        </div>

        <div className="border-t border-outline-variant/10 pt-8 mt-12 text-center text-xs text-on-surface-variant/50">
          {t('privacy_page.footer_contact')}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
