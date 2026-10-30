import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'cyan'
    | 'black-on-cyan'
    | 'outline-dark'
    | 'outline-white'
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  className = '',
  variant = 'cyan',
  size = 'md',
  disabled,
  children,
  ...props
}) => {
  const variantStyles: Record<string, string> = {
    cyan: 'bg-cyan text-[#010B13] hover:bg-[#33ebff] border border-cyan active:translate-y-[1px]',
    primary: 'bg-cyan text-[#010B13] hover:bg-[#33ebff] border border-cyan active:translate-y-[1px]',
    'black-on-cyan': 'bg-[#010B13] text-powder hover:bg-[#111111] border border-[#010B13] active:translate-y-[1px]',
    'outline-dark': 'bg-transparent text-powder border border-powder/30 hover:border-cyan hover:text-cyan active:translate-y-[1px]',
    outline: 'bg-transparent text-powder border border-powder/30 hover:border-cyan hover:text-cyan active:translate-y-[1px]',
    'outline-white': 'bg-transparent text-ink border border-ink/30 hover:bg-black/5 active:translate-y-[1px]',
    secondary: 'bg-steel text-powder border border-powder/20 hover:border-cyan active:translate-y-[1px]',
    ghost: 'bg-transparent text-powder/70 hover:text-powder hover:bg-white/5 active:translate-y-[1px]',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 active:translate-y-[1px]'
  };

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 font-bold uppercase tracking-wider',
    md: 'text-xs px-5 py-2.5 font-bold uppercase tracking-wider',
    lg: 'text-sm px-7 py-3.5 font-bold uppercase tracking-wider'
  };

  const chosenStyle = variantStyles[variant] || variantStyles.cyan;

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-sans transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none select-none cursor-pointer ${chosenStyle} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
