import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import UserHeader from './UserHeader';
import UserSidebar from './UserSidebar';
import UserFooter from './UserFooter';
import { Toaster } from 'react-hot-toast';

// Routes where the sidebar should appear (profile-related pages)
const SIDEBAR_ROUTES = ['/profile', '/vault', '/results', '/settings'];

const MainLayout = () => {
  const location = useLocation();
  const showSidebar = SIDEBAR_ROUTES.some(route => location.pathname.startsWith(route));

  return (
    <div className="bg-background text-on-surface font-body min-h-screen flex flex-col antialiased">
      <Toaster position="top-right" />

      {/* Fixed Header */}
      <UserHeader />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className={`flex-1 flex px-6 lg:px-8 mx-auto w-full gap-8 max-w-[1600px] pt-20`}>

          {/* Sticky Sidebar */}
          {showSidebar && (
            <aside className="w-72 flex-shrink-0 sticky top-24 self-start mt-4 h-[calc(100vh-104px)]">
              <div className="h-full bg-surface-container-low border border-outline-variant/15 rounded-[32px] shadow-xl overflow-hidden">
                <UserSidebar />
              </div>
            </aside>
          )}

          {/* Page Content */}
          <main className="flex-1 flex flex-col min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      <UserFooter />
    </div>
  );
};

export default MainLayout;
