import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  key?: string | number;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "rounded-[2.5rem] p-6 transition-all active:scale-[0.98] cursor-pointer shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}
