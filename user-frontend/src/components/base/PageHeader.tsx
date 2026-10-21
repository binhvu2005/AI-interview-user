// File này: Thành phần Tiêu đề trang (PageHeader) cơ bản thuộc Design System.
// Vai trò: Chuẩn hóa phần đầu của mỗi màn hình với phông Manrope nghệ thuật, mô tả và nút hành động.
// Khi nào dùng: Đặt ở đầu mọi trang người dùng (Dashboard, Preparation, Forum, Settings...).

import React from 'react';

export interface PageHeaderProps {
  tag?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  tag,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-outline-variant/10 ${className}`}
    >
      <div className="space-y-2 max-w-2xl">
        {tag && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-headline font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            {tag}
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-headline text-on-surface tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm sm:text-base text-on-surface-variant font-body leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
