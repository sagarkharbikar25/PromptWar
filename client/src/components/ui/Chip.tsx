import React from 'react';

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'on-dark'
    | 'on-cyan'
    | 'on-white'
    | 'default'
    | 'accent'
    | 'ok'
    | 'warn'
    | 'danger'
    | 'spark';
  size?: 'sm' | 'md';
}

export const Chip: React.FC<ChipProps> = ({
  className = '',
  variant = 'on-dark',
  size = 'md',
  children,
  ...props
}) => {
  const variantStyles: Record<string, string> = {
    'on-dark': 'bg-[#132230] text-powder border-powder/20',
    default: 'bg-[#132230] text-powder border-powder/20',
    'on-cyan': 'bg-[#00c5dc]/25 text-[#010B13] border-[#010B13]/30',
    accent: 'bg-cyan/15 text-cyan border-cyan/40',
    'on-white': 'bg-white text-ink border-ink/20',
    ok: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warn: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    spark: 'bg-amber-300/15 text-amber-200 border-amber-300/30'
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2.5 py-0.5',
    md: 'text-[11px] px-3 py-1'
  };

  const chosenStyle = variantStyles[variant] || variantStyles['on-dark'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-sans font-semibold uppercase tracking-wider rounded-full border ${chosenStyle} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
