// File này: Thành phần Huy hiệu trạng thái (Badge) cơ bản thuộc Design System.
// Vai trò: Hiển thị nhãn dán, trạng thái gói VIP, độ khó, hoặc điểm số với màu sắc trực quan.
// Khi nào dùng: Dùng trong danh sách câu hỏi, trạng thái người dùng, thẻ phân loại.

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'vip' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  icon?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  dot = false,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1 rounded-md font-semibold',
    md: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg font-bold',
  }[size];

  const variantClasses = {
    primary: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border border-secondary/20',
    vip: 'bg-gradient-to-r from-amber-500/15 to-yellow-500/20 text-amber-500 dark:text-yellow-400 border border-amber-500/30 shadow-xs font-black tracking-wide',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    error: 'bg-error/10 text-error border border-error/20',
    neutral: 'bg-surface-container-high text-on-surface-variant border border-outline-variant/15',
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-headline uppercase tracking-wider select-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {icon && (
        <span className="material-symbols-outlined text-[14px] leading-none">{icon}</span>
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
