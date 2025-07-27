import React from 'react';
import { useTheme } from './useTheme';

interface GlassMorphismProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'elevated' | 'subtle' | 'holographic';
  blur?: 'light' | 'medium' | 'heavy';
  border?: boolean;
  glow?: boolean;
}

export const GlassMorphism = ({
  children,
  variant = 'default',
  className = '',
  style = {},
  _holographic = false,
  blur = 10,
  _opacity = 0.1,
  border = true,
  _shadow = true,
  _animated = false
}: GlassMorphismProps) => {
  const { theme, isReducedMotion } = useTheme();

  const getBlurValue = () => {
    switch (blur) {
      case 'light': return '4px';
      case 'medium': return '8px';
      case 'heavy': return '16px';
      default: return '8px';
    }
  };

  const getVariantStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      backdropFilter: `blur(${getBlurValue()})`,
      WebkitBackdropFilter: `blur(${getBlurValue()})`,
      border: border ? '1px solid var(--glass-border)' : 'none',
      borderRadius: '12px',
      transition: isReducedMotion ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    switch (variant) {
      case 'default':
        return {
          ...baseStyles,
          background: 'var(--glass-background)',
          boxShadow: 'var(--glass-shadow)',
        };
      
      case 'elevated':
        return {
          ...baseStyles,
          background: theme === 'dark' 
            ? 'rgba(26, 26, 46, 0.9)' 
            : 'rgba(255, 255, 255, 0.9)',
          boxShadow: theme === 'dark'
            ? '0 12px 40px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(0, 0, 0, 0.3)'
            : '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1)',
        };
      
      case 'subtle':
        return {
          ...baseStyles,
          background: theme === 'dark'
            ? 'rgba(26, 26, 46, 0.4)'
            : 'rgba(255, 255, 255, 0.4)',
          boxShadow: 'none',
        };
      
      case 'holographic':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          boxShadow: glow ? 'var(--neon-glow)' : '0 4px 20px rgba(0, 255, 255, 0.2)',
          position: 'relative',
        };
      
      default:
        return baseStyles;
    }
  };

  const holographicOverlay = variant === 'holographic' ? (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '12px',
        background: 'var(--holographic-gradient)',
        backgroundSize: '200% 200%',
        animation: isReducedMotion ? 'none' : 'holographicShift 3s ease-in-out infinite',
        opacity: 0.1,
        pointerEvents: 'none',
      }}
    />
  ) : null;

  return (
    <div
      className={`glass-morphism ${className}`}
      style={{
        ...getVariantStyles(),
        ...style,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {holographicOverlay}
      {children}
    </div>
  );
};

// Holographic animasyon için CSS
const holographicStyles = `
@keyframes holographicShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.glass-morphism {
  isolation: isolate;
}
`;

// CSS'i sayfaya ekle
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = holographicStyles;
  document.head.appendChild(styleSheet);
} 