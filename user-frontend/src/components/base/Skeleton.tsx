// File này: Thành phần Khung xương tải trang (Skeleton) cơ bản thuộc Design System.
// Vai trò: Hiển thị giao diện giữ chỗ dạng sóng mờ mềm mại trong lúc chờ dữ liệu API tải về.
// Khi nào dùng: Dùng cho các danh sách, bảng biểu, thẻ thống kê khi đang tải dữ liệu.

import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const variantClasses = {
    text: 'h-4 w-full rounded-md',
    circular: 'rounded-full aspect-square',
    rectangular: 'rounded-2xl w-full',
    card: 'rounded-3xl w-full h-48',
  }[variant];

  return (
    <div
      className={`bg-surface-container-high/60 dark:bg-surface-container-high/40 animate-pulse ${variantClasses} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
};

export default Skeleton;
