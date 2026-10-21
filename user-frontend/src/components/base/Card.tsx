// File này: Thành phần Thẻ chứa (Card) cơ bản thuộc Design System.
// Vai trò: Tạo khung bao bọc nội dung với hiệu ứng phân lớp sắc thái (Tonal Layering), hiệu ứng kính mờ và bóng khuếch tán.
// Khi nào dùng: Dùng cho mọi khối hiển thị thông tin (thống kê, danh sách, chi tiết).

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'glass' | 'accent' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  hoverable = false,
  className = '',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4 sm:p-5',
    md: 'p-6 sm:p-8',
    lg: 'p-8 sm:p-10',
  }[padding];

  const variantClasses = {
    // Thẻ nâng cao: Bề mặt mềm mại với bóng đổ khuếch tán không viền cứng (No-Line Rule)
    elevated:
      'bg-surface-container-low/90 dark:bg-surface-container-low ambient-shadow border border-outline-variant/10',
    // Thẻ kính mờ: Hiệu ứng làm mờ hậu cảnh (Backdrop blur) phong cách Apple/Linear
    glass:
      'bg-surface/70 dark:bg-surface-container-lowest/70 backdrop-blur-xl border border-outline-variant/15 shadow-sm',
    // Thẻ AI nhấn trái: Vạch chàm hoàng gia ở mép trái biểu thị nội dung do AI phân tích
    accent:
      'bg-surface-container-low/90 dark:bg-surface-container-low accent-ai-card ambient-shadow border-y border-r border-outline-variant/10',
    // Thẻ phẳng: Phân biệt bằng màu nền sắc thái nhẹ
    flat:
      'bg-surface-container-lowest border border-outline-variant/10',
  }[variant];

  const hoverClasses = hoverable
    ? 'hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300'
    : '';

  return (
    <div
      className={`rounded-3xl relative overflow-hidden transition-all duration-200 ${variantClasses} ${paddingClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
