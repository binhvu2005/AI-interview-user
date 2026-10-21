// File này: Thành phần Nút bấm (Button) cơ bản thuộc Design System.
// Vai trò: Cung cấp nút bấm chuẩn hóa với các biến thể (primary gradient, secondary glass, outline, ghost, danger).
// Khi nào dùng: Dùng cho mọi thao tác bấm tương tác trong toàn bộ hệ thống.

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  // Định nghĩa kích thước đệm (padding) và cỡ chữ chuẩn
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3.5 text-base rounded-2xl gap-2.5',
  }[size];

  // Định nghĩa phong cách màu sắc chuẩn theo Luminous Sanctuary
  const variantClasses = {
    // Nút chính: Dải màu chuyển chàm hoàng gia (#6366f1) có hiệu ứng tỏa sáng khi rê chuột
    primary:
      'bg-gradient-to-r from-primary-dim to-primary text-white font-headline font-bold shadow-md hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]',
    // Nút phụ: Bề mặt kính mờ (glassmorphism) kèm viền mờ 10%
    secondary:
      'bg-surface-container-high/80 hover:bg-surface-container-highest text-on-surface font-headline font-semibold border border-outline-variant/15 hover:scale-[1.01] active:scale-[0.98]',
    // Nút viền: Tối giản, thanh lịch
    outline:
      'bg-transparent hover:bg-primary/5 text-on-surface hover:text-primary font-headline font-semibold border border-outline-variant/30 hover:border-primary/40',
    // Nút trong suốt: Dùng cho thanh điều hướng hoặc icon-only
    ghost:
      'bg-transparent hover:bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface font-headline font-medium',
    // Nút nguy hiểm: Dùng cho thao tác xóa hoặc hủy
    danger:
      'bg-error/10 hover:bg-error/20 text-error font-headline font-bold border border-error/20 hover:scale-[1.02] active:scale-[0.98]',
  }[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 select-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {/* Vòng quay đang tải khi đang xử lý dữ liệu */}
      {loading ? (
        <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="material-symbols-outlined text-[18px] leading-none">{icon}</span>
          )}
          <span>{children}</span>
          {icon && iconPosition === 'right' && (
            <span className="material-symbols-outlined text-[18px] leading-none">{icon}</span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;
