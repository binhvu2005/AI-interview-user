import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

const ContactPage = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error(t('contact_page.toast_fill_fields'));
      return;
    }
    
    setSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setSubmitting(false);
      toast.success(t('contact_page.toast_send_success'));
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="text-center mb-16 relative overflow-hidden p-8 sm:p-12 rounded-[40px] bg-gradient-to-tr from-primary/5 via-secondary/5 to-transparent border border-outline-variant/10">
        <div className="absolute inset-0 mesh-gradient opacity-30"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-3xl">support_agent</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 text-on-surface">
            {t('contact_page.title')}
          </h1>
          <p className="text-on-surface-variant font-medium text-lg max-w-xl mx-auto leading-relaxed">
            {t('contact_page.desc')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
        {/* Support Channels & Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-on-surface">
              {t('contact_page.channels_title')}
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {t('contact_page.channels_desc')}
            </p>

            <div className="space-y-4 pt-4">
               {/* Email */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/15 flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant/60">Email</h4>
                  <a href="mailto:support@obsidianai.com" className="text-sm font-bold text-on-surface hover:text-primary transition-colors">
                    support@obsidianai.com
                  </a>
                </div>
              </div>

              {/* Discord */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/5 border border-purple-500/15 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">forum</span>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant/60">Discord</h4>
                  <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-on-surface hover:text-purple-400 transition-colors">
                    Obsidian Community
                  </a>
                </div>
              </div>

              {/* Office Hours */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/5 border border-green-500/15 flex items-center justify-center text-green-400 flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">schedule</span>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant/60">
                    {t('contact_page.response_time_label')}
                  </h4>
                  <p className="text-sm font-bold text-on-surface">
                    {t('contact_page.response_time_val')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] p-8 shadow-sm text-center">
            <span className="material-symbols-outlined text-secondary text-3xl mb-3">auto_awesome</span>
            <h3 className="font-bold text-on-surface text-sm mb-2">
              {t('contact_page.faq_cta_title')}
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              {t('contact_page.faq_cta_desc')}
            </p>
            <a 
              href="/help" 
              className="inline-block px-4 py-2 bg-secondary text-on-secondary text-xs font-black uppercase tracking-wider rounded-xl hover:bg-secondary/90 transition-colors"
            >
              {t('contact_page.faq_cta_btn')}
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] p-8 sm:p-10 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-on-surface mb-6">
              {t('contact_page.form_title')}
            </h2>

            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider">
                {t('contact_page.form_name_label')}
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('contact_page.form_name_placeholder')}
                className="w-full bg-surface-container border border-outline-variant/20 rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider">
                {t('contact_page.form_email_label')}
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@company.com"
                className="w-full bg-surface-container border border-outline-variant/20 rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label htmlFor="subject" className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider">
                {t('contact_page.form_subject_label')}
              </label>
              <input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder={t('contact_page.form_subject_placeholder')}
                className="w-full bg-surface-container border border-outline-variant/20 rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label htmlFor="message" className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider">
                {t('contact_page.form_message_label')}
              </label>
              <textarea
                id="message"
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={t('contact_page.form_message_placeholder')}
                className="w-full bg-surface-container border border-outline-variant/20 rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/40 transition-colors resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-on-primary py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-primary/95 transition-all shadow-md shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></span>
                  {t('contact_page.btn_sending')}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  {t('contact_page.btn_send')}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
