import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// File này: Footer chân trang của ứng dụng Obsidian AI.
// Vai trò: Hiển thị liên kết pháp lý và bản quyền tối giản sang trọng theo chuẩn Obsidian AI,
//          sử dụng 100% token ngữ nghĩa tự động chuyển đổi giữa Light Mode và Dark Mode.
// Khi nào dùng: Nằm ở dưới cùng của mọi trang trong ứng dụng.
const UserFooter = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <footer className="w-full border-t border-outline-variant bg-surface text-on-surface-variant font-manrope text-xs py-8 px-6 sm:px-12 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-[11px] font-semibold tracking-widest uppercase">
          <button
            onClick={() => navigate('/privacy')}
            className="hover:text-on-surface transition-colors duration-200 cursor-pointer"
          >
            {t('footer.privacy')}
          </button>
          <button
            onClick={() => navigate('/terms')}
            className="hover:text-on-surface transition-colors duration-200 cursor-pointer"
          >
            {t('footer.terms')}
          </button>
          <button
            onClick={() => navigate('/help')}
            className="hover:text-on-surface transition-colors duration-200 cursor-pointer"
          >
            {t('footer.api')}
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="hover:text-on-surface transition-colors duration-200 cursor-pointer"
          >
            {t('footer.contact')}
          </button>
        </div>

        {/* System Status & Copyright */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {t('footer.all_systems')}
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant/60 uppercase tracking-widest">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default UserFooter;
