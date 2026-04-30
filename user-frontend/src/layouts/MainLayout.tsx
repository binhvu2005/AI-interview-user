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
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  // Close sidebar when route changes
  React.useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="bg-background text-on-surface font-body min-h-screen flex flex-col antialiased">
      <Toaster position="top-right" />

      {/* Fixed Header */}
      <UserHeader />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Mobile Sidebar Trigger (Only on Profile pages) */}
        {showSidebar && (
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-primary text-on-primary py-3 px-1 rounded-r-xl shadow-lg flex flex-col items-center gap-2 border-y border-r border-primary-dim/30 animate-in slide-in-from-left duration-500"
          >
            <span className="material-symbols-outlined text-[18px]">side_navigation</span>
            <span className="[writing-mode:vertical-lr] text-[9px] font-black uppercase tracking-widest rotate-180">Menu</span>
          </button>
        )}

        <div className={`flex-1 flex flex-col lg:flex-row px-4 md:px-6 lg:px-8 mx-auto w-full gap-6 lg:gap-8 max-w-[1600px] pt-20`}>

          {/* Sidebar - Desktop Sticky / Mobile Drawer */}
          {showSidebar && (
            <>
              {/* Desktop Sticky Sidebar */}
              <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-24 self-start mt-4 h-[calc(100vh-104px)] z-10">
                <div className="h-full bg-surface-container-low border border-outline-variant/15 rounded-[32px] shadow-xl overflow-hidden">
                  <UserSidebar />
                </div>
              </aside>

              {/* Mobile Drawer Sidebar */}
              {mobileSidebarOpen && (
                <div className="lg:hidden">
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setMobileSidebarOpen(false)}></div>
                  <aside className="fixed top-0 left-0 w-[280px] h-full bg-surface-container-low z-[60] border-r border-outline-variant/15 shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                    <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-high/30">
                       <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant opacity-70">Quản lý tài khoản</h3>
                       <button onClick={() => setMobileSidebarOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface-variant">
                         <span className="material-symbols-outlined text-sm">close</span>
                       </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <UserSidebar />
                    </div>
                  </aside>
                </div>
              )}
            </>
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
