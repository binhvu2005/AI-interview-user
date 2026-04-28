import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

const UserSidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { 
      id: 'profile', 
      label: t('nav.profile'), 
      icon: 'account_circle', 
      path: '/profile',
      active: location.pathname === '/profile' 
    },
    { 
      id: 'cv_vault', 
      label: t('setup.vault'), 
      icon: 'inventory_2', 
      path: '/vault', 
      active: location.pathname === '/vault' 
    },
    { 
      id: 'results', 
      label: t('results.title'), 
      icon: 'fact_check', 
      path: '/results', 
      active: location.pathname === '/results' 
    },
    { 
      id: 'settings', 
      label: t('nav.settings'), 
      icon: 'tune', 
      path: '/settings', 
      active: location.pathname === '/settings' 
    },
    { 
      id: 'forum', 
      label: t('forum.title'), 
      icon: 'forum', 
      path: '/forum', 
      active: location.pathname.startsWith('/forum') 
    }
  ];

  return (
    <div className="flex flex-col h-full px-4 py-8">
       <div className="px-4 mb-10">
         <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-40">{t('sidebar.overview')}</h2>
       </div>

       <nav className="space-y-2 flex-1">
          {menuItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => navigate(item.path)} 
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-500 group ${
                item.active 
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                  : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
              }`}
            >
               <span className={`material-symbols-outlined text-[22px] transition-transform duration-500 ${item.active ? 'material-symbols-fill scale-110' : 'group-hover:scale-110'}`}>
                 {item.icon}
               </span>
               <span className="font-bold text-sm tracking-tight">{item.label}</span>
               {item.active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-on-primary"></div>}
            </button>
          ))}
        </nav>
        
        <div className="mt-8 px-2">
           <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-[32px] p-6 relative overflow-hidden group cursor-pointer" onClick={() => navigate('/upgrade')}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 blur-2xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined font-bold">workspace_premium</span>
                </div>
                <h4 className="font-black text-xs uppercase tracking-widest text-on-surface mb-1">{t('nav.upgrade')}</h4>
                <p className="text-[10px] font-bold text-on-surface-variant opacity-60 leading-tight">
                  {t('upgrade_page.tag')}
                </p>
              </div>
           </div>
        </div>
     </div>
  );
};

export default UserSidebar;
