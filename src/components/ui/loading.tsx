import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'ring';
  color?: 'primary' | 'secondary' | 'white' | 'blue';
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  className,
  variant = 'spinner',
  color = 'primary'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    blue: 'text-caluu-blue'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const renderSpinner = () => (
    <motion.div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-current',
        sizeClasses[size],
        colorClasses[color]
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn(
            'rounded-full bg-current',
            size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3',
            colorClasses[color]
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <motion.div
      className={cn(
        'rounded-full bg-current',
        sizeClasses[size],
        colorClasses[color]
      )}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );

  const renderRing = () => (
    <div className={cn('relative', sizeClasses[size])}>
      <motion.span
        className={cn('absolute inset-0 rounded-full border-2 border-current border-t-transparent', colorClasses[color])}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <motion.span
        className={cn('absolute inset-2 rounded-full border-2 border-current/40 border-b-transparent')}
        animate={{ rotate: -360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'ring':
        return renderRing();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      {renderLoader()}
      {text && (
        <motion.p
          className={cn(
            'text-center font-medium',
            textSizeClasses[size],
            colorClasses[color]
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

// Full screen loading component
export const FullScreenLoading: React.FC<Omit<LoadingProps, 'className'> & { 
  background?: 'transparent' | 'white' | 'gray' | 'blue';
}> = ({ background = 'white', ...props }) => {
  const backgroundClasses = {
    transparent: 'bg-transparent',
    white: 'bg-white',
    gray: 'bg-gray-50',
    blue: 'bg-blue-50'
  };

  return (
    <div className={cn(
      'fixed inset-0 flex items-center justify-center z-50',
      backgroundClasses[background]
    )}>
      <div className="flex flex-col items-center gap-3">
        <Loading {...props} />
        {props.text && (
          <p className={cn('text-sm font-medium', props.color === 'blue' ? 'text-caluu-blue' : 'text-gray-700')}>{props.text}</p>
        )}
      </div>
    </div>
  );
};

// Inline loading component
export const InlineLoading: React.FC<LoadingProps> = (props) => (
  <Loading {...props} className={cn('inline-flex', props.className)} />
);

// Button loading component
export const ButtonLoading: React.FC<Omit<LoadingProps, 'size' | 'variant'>> = (props) => (
  <Loading 
    {...props} 
    size="sm" 
    variant="spinner" 
    className={cn('mr-2', props.className)} 
  />
);

export default Loading;

