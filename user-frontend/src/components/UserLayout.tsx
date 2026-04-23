import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import UserHeader from './UserHeader';
import UserSidebar from './UserSidebar';
import UserFooter from './UserFooter';
import { Toaster } from 'react-hot-toast';

// Routes where the sidebar should appear (profile-related pages)
const SIDEBAR_ROUTES = ['/profile', '/vault', '/results', '/settings'];

const UserLayout = () => {
  const location = useLocation();
  const showSidebar = SIDEBAR_ROUTES.some(route => location.pathname.startsWith(route));

  return (
    <div className="bg-background text-on-surface font-body min-h-screen flex flex-col antialiased">
      <Toaster position="top-right" />

      {/* Fixed Header */}
      <UserHeader />

      {/* Content Area below header */}
      <div className="flex flex-1 pt-20">

        {/* Inner layout: sidebar + main, constrained width */}
        <div className={`flex flex-1 px-6 lg:px-8 mx-auto w-full gap-8 max-w-[1600px]`}>

          {/* Sticky Sidebar — only on profile pages */}
          {showSidebar && (
            <aside className="w-72 flex-shrink-0 sticky top-24 self-start mt-4 h-[calc(100vh-104px)]">
              <div className="h-full bg-surface-container-low border border-outline-variant/15 rounded-[32px] shadow-xl overflow-hidden">
                <UserSidebar />
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className={`flex-1 py-0 min-w-0 ${!showSidebar ? '' : ''}`}>
            <Outlet />
          </main>
        </div>
      </div>

      {/* Full-width Footer */}
      <UserFooter />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--color-primary), 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(var(--color-primary), 0.2); }
      `}</style>
    </div>
  );
};

export default UserLayout;
