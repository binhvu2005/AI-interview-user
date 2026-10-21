// File này: Thành phần Ô nhập liệu (Input) cơ bản thuộc Design System.
// Vai trò: Xử lý nhập văn bản với hiệu ứng viền mờ (Ghost Border 10%) và phát sáng êm dịu khi tập trung gõ (Focus inner glow).
// Khi nào dùng: Dùng cho mọi biểu mẫu, tìm kiếm, nhập dữ liệu trong ứng dụng.

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: string;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightElement, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-headline text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
          >
            {label}
          </label>
        )}

        <div className="relative group flex items-center">
          {leftIcon && (
            <span className="material-symbols-outlined absolute left-4 text-on-surface-variant/50 text-[20px] pointer-events-none group-focus-within:text-primary transition-colors">
              {leftIcon}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-surface-container-lowest text-on-surface text-sm rounded-xl py-3.5 transition-all duration-200 outline-none placeholder:text-on-surface-variant/40 border ${
              leftIcon ? 'pl-11' : 'pl-4'
            } ${rightElement ? 'pr-11' : 'pr-4'} ${
              error
                ? 'border-error/60 focus:border-error focus:ring-2 focus:ring-error/20 bg-error/5'
                : 'border-outline-variant/15 focus:border-primary/50 focus:ring-2 focus:ring-primary/15 focus:bg-primary/5'
            } ${className}`}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3.5 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-error font-medium flex items-center gap-1 mt-1 animate-in fade-in duration-150">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-on-surface-variant/70 mt-1">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
