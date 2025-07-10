/**
 * 🎯 Simple Animation Component
 * Replaces heavy SVG animations with clean, performant CSS animations
 */

import React from 'react';

interface SimpleAnimationProps {
  type: 'pulse' | 'glow' | 'rotate' | 'bounce' | 'fade' | 'scale';
  duration?: number; // in milliseconds
  delay?: number;
  intensity?: 'low' | 'medium' | 'high';
  color?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const SimpleAnimation: React.FC<SimpleAnimationProps> = ({
  type,
  duration = 1000,
  delay = 0,
  intensity = 'medium',
  color = '#3B82F6',
  children,
  className = '',
  style = {}
}) => {
  // Generate animation CSS based on type and intensity
  const getAnimationStyle = (): React.CSSProperties => {
    const animationDuration = `${duration}ms`;
    const animationDelay = `${delay}ms`;
    
    const intensityMap = {
      low: { scale: 1.05, opacity: 0.7, blur: 2 },
      medium: { scale: 1.1, opacity: 0.8, blur: 4 },
      high: { scale: 1.2, opacity: 0.9, blur: 6 }
    };
    
    const config = intensityMap[intensity];
    
    const animations = {
      pulse: {
        animation: `simple-pulse ${animationDuration} ease-in-out infinite`,
        animationDelay
      },
      glow: {
        animation: `simple-glow ${animationDuration} ease-in-out infinite`,
        animationDelay,
        filter: `drop-shadow(0 0 ${config.blur}px ${color})`
      },
      rotate: {
        animation: `simple-rotate ${animationDuration} linear infinite`,
        animationDelay
      },
      bounce: {
        animation: `simple-bounce ${animationDuration} ease-in-out infinite`,
        animationDelay
      },
      fade: {
        animation: `simple-fade ${animationDuration} ease-in-out infinite`,
        animationDelay
      },
      scale: {
        animation: `simple-scale ${animationDuration} ease-in-out infinite`,
        animationDelay
      }
    };
    
              const style = {
       ...animations[type]
     } as React.CSSProperties;
     
           // Add CSS custom properties
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (style as any)['--animation-scale'] = config.scale.toString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (style as any)['--animation-opacity'] = config.opacity.toString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (style as any)['--glow-color'] = color;
     
     return style;
  };

  return (
    <>
      {/* Inject keyframe styles */}
      <style>{`
        @keyframes simple-pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(var(--animation-scale, 1.1));
            opacity: var(--animation-opacity, 0.8);
          }
        }
        
        @keyframes simple-glow {
          0%, 100% { 
            filter: drop-shadow(0 0 2px var(--glow-color));
          }
          50% { 
            filter: drop-shadow(0 0 8px var(--glow-color));
          }
        }
        
        @keyframes simple-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes simple-bounce {
          0%, 100% { 
            transform: translateY(0);
          }
          50% { 
            transform: translateY(-10px);
          }
        }
        
        @keyframes simple-fade {
          0%, 100% { 
            opacity: 1;
          }
          50% { 
            opacity: var(--animation-opacity, 0.5);
          }
        }
        
        @keyframes simple-scale {
          0%, 100% { 
            transform: scale(1);
          }
          50% { 
            transform: scale(var(--animation-scale, 1.15));
          }
        }
      `}</style>
      
      <div
        className={className}
        style={{
          ...getAnimationStyle(),
          ...style
        }}
      >
        {children}
      </div>
    </>
  );
};

// Preset animation components for common use cases
export const PulseAnimation: React.FC<{
  children: React.ReactNode;
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
}> = ({ children, color = '#3B82F6', intensity = 'medium' }) => (
  <SimpleAnimation type="pulse" color={color} intensity={intensity}>
    {children}
  </SimpleAnimation>
);

export const GlowAnimation: React.FC<{
  children: React.ReactNode;
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
}> = ({ children, color = '#10B981', intensity = 'medium' }) => (
  <SimpleAnimation type="glow" color={color} intensity={intensity}>
    {children}
  </SimpleAnimation>
);

export const RotateAnimation: React.FC<{
  children: React.ReactNode;
  duration?: number;
}> = ({ children, duration = 2000 }) => (
  <SimpleAnimation type="rotate" duration={duration}>
    {children}
  </SimpleAnimation>
);

export const BounceAnimation: React.FC<{
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
}> = ({ children, intensity = 'medium' }) => (
  <SimpleAnimation type="bounce" intensity={intensity}>
    {children}
  </SimpleAnimation>
);

// Loading spinner using simple CSS animation
export const SimpleSpinner: React.FC<{
  size?: number;
  color?: string;
}> = ({ size = 24, color = '#3B82F6' }) => (
  <RotateAnimation duration={1000}>
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid transparent`,
        borderTop: `2px solid ${color}`,
        borderRadius: '50%'
      }}
    />
  </RotateAnimation>
);

// Success checkmark animation
export const SuccessAnimation: React.FC<{
  size?: number;
  color?: string;
}> = ({ size = 24, color = '#10B981' }) => (
  <SimpleAnimation type="scale" duration={600} intensity="high">
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFF',
        fontSize: size * 0.6,
        fontWeight: 'bold'
      }}
    >
      ✓
    </div>
  </SimpleAnimation>
); 