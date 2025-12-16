import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className={clsx('flex items-center justify-center gap-2', className)}>
      <Loader2 className={clsx('animate-spin text-blue-500', sizeClasses[size])} />
      {text && (
        <span className="text-sm text-gray-600">{text}</span>
      )}
    </div>
  );
};