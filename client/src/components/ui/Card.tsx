import React, { useRef } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  spotlight?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  spotlight = true,
  children,
  onPointerMove,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!spotlight || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mx', `${x}px`);
    cardRef.current.style.setProperty('--my', `${y}px`);
    onPointerMove?.(e);
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={cn(
        spotlight ? 'spotlight-card' : 'bg-surface border border-line rounded-brand',
        'p-5 transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

