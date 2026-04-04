'use client';

import { type ButtonHTMLAttributes } from 'react';

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function BigButton({
  active = false,
  size = 'md',
  className = '',
  children,
  ...props
}: BigButtonProps) {
  const base = size === 'sm' ? 'kid-button-sm' : 'kid-button';
  const sizeClass = size === 'lg' ? 'min-w-[64px] min-h-[64px] text-2xl' : '';
  return (
    <button
      className={`${base} ${active ? 'active' : ''} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
