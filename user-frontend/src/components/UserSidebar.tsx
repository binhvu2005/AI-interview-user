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
      label: 'Hồ sơ cá nhân', 
      icon: 'account_circle', 
      path: '/profile',
      active: location.pathname === '/profile' 
    },
    { 
      id: 'cv_vault', 
      label: 'Kho lưu trữ CV', 
      icon: 'inventory_2', 
      path: '/vault', 
      active: location.pathname === '/vault' 
    },
    { 
      id: 'results', 
      label: 'Kết quả phỏng vấn', 
      icon: 'fact_check', 
      path: '/results', 
      active: location.pathname === '/results' 
    },
    { 
      id: 'settings', 
      label: 'Cài đặt hệ thống', 
      icon: 'tune', 
      path: '/settings', 
      active: location.pathname === '/settings' 
    }
  ];

  return (
    <div className="flex flex-col h-full px-4 py-8">
       <div className="px-4 mb-10">
         <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-40">Danh mục chính</h2>
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
       
    </div>
  );
};

export default UserSidebar;
