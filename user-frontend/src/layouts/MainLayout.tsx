import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import UserHeader from './UserHeader';
import UserSidebar from './UserSidebar';
import UserFooter from './UserFooter';
import { Toaster } from 'react-hot-toast';

// File này: Layout khung chính (Main Layout) của ứng dụng Obsidian AI.
// Vai trò: Sử dụng 100% token ngữ nghĩa (bg-background, bg-surface, text-on-surface)
//          giúp chuyển đổi mượt mà tuyệt đối giữa Light và Dark theme.
// Khi nào dùng: Bao bọc tất cả các trang người dùng đã đăng nhập.
const MainLayout = () => {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Đóng sidebar di động khi chuyển route
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="bg-background text-on-surface font-body min-h-screen flex flex-col antialiased transition-colors duration-200">
      <Toaster position="top-right" />

      {/* Top Fixed Header */}
      <UserHeader />

      {/* Main Layout Container (Header h-16 = pt-16) */}
      <div className="flex flex-1 pt-16 min-h-[calc(100vh-64px)]">
        
        {/* Desktop Sticky Sidebar (Obsidian AI Cognitive Sanctuary) */}
        <aside className="hidden md:flex flex-col sticky top-16 h-[calc(100vh-64px)] w-64 border-r border-outline-variant bg-surface shrink-0 z-20 transition-colors duration-200">
          <UserSidebar />
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-surface shadow-2xl z-10 border-r border-outline-variant flex flex-col">
              <div className="flex justify-end p-3">
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-2 text-on-surface-variant hover:text-on-surface rounded-xl hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <UserSidebar />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Sidebar Floating Button */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden fixed left-0 top-20 z-30 bg-surface border border-outline-variant text-primary py-2 px-2.5 rounded-r-xl shadow-lg flex items-center gap-1 cursor-pointer"
          aria-label="Open Sidebar Menu"
        >
          <span className="material-symbols-outlined text-[18px]">menu_open</span>
        </button>

        {/* Main Content Canvas */}
        <main className="flex-1 min-w-0 flex flex-col relative overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Minimal Footer */}
      <UserFooter />
    </div>
  );
};

export default MainLayout;
