import React from 'react';
import { useTheme } from './ThemeProvider';

interface ModernButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'glass' | 'holographic';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  style = {},
  type = 'button',
  title,
  icon,
  loading = false,
  fullWidth = false,
}) => {
  const { colors, isReducedMotion } = useTheme();

  const getVariantStyles = (): React.CSSProperties => {
    const isDark = colors.dark.background === '#0F0F23';

    switch (variant) {
      case 'glass':
        return {
          background: 'var(--glass-background)',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: 'var(--glass-shadow)',
          color: isDark ? '#FFFFFF' : '#000000',
        };
      
      case 'holographic':
        return {
          background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
          color: '#00FFFF',
          textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
        };
      
      default: {
        const baseColor = colors[variant as keyof typeof colors] || colors.primary;
        return {
          background: `linear-gradient(135deg, ${baseColor}20, ${baseColor}10)`,
          border: `2px solid ${baseColor}`,
          color: isDark ? '#FFFFFF' : '#000000',
          boxShadow: `0 0 10px ${baseColor}40, inset 0 1px 0 ${baseColor}30`,
          textShadow: `0 0 5px ${baseColor}`,
        };
      }
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'small':
        return {
          padding: '8px 16px',
          fontSize: '14px',
          borderRadius: '8px',
          minHeight: '36px',
        };
      case 'large':
        return {
          padding: '16px 32px',
          fontSize: '18px',
          borderRadius: '16px',
          minHeight: '56px',
        };
      default: // medium
        return {
          padding: '12px 24px',
          fontSize: '16px',
          borderRadius: '12px',
          minHeight: '44px',
        };
    }
  };

  const getHoverStyles = (): React.CSSProperties => {
    if (disabled || loading) return {};
    
    switch (variant) {
      case 'glass':
        return {
          transform: isReducedMotion ? 'none' : 'scale(1.02)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(0, 0, 0, 0.3)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
        };
      
      case 'holographic':
        return {
          transform: isReducedMotion ? 'none' : 'scale(1.05)',
          boxShadow: '0 0 30px rgba(0, 255, 255, 0.4), 0 8px 25px rgba(0, 255, 255, 0.2)',
          borderColor: 'rgba(0, 255, 255, 0.6)',
        };
      
      default: {
        const baseColor = colors[variant as keyof typeof colors] || colors.primary;
        return {
          transform: isReducedMotion ? 'none' : 'scale(1.05) translateY(-2px)',
          boxShadow: `0 0 20px ${baseColor}60, 0 4px 15px ${baseColor}40, inset 0 1px 0 ${baseColor}50`,
          borderColor: `${baseColor}CC`,
        };
      }
    }
  };

  const getDisabledStyles = (): React.CSSProperties => {
    return {
      opacity: 0.5,
      cursor: 'not-allowed',
      filter: 'grayscale(50%)',
      transform: 'none',
    };
  };

  const buttonStyles: React.CSSProperties = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...(disabled || loading ? getDisabledStyles() : {}),
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    transition: isReducedMotion ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: fullWidth ? '100%' : 'auto',
    ...style,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && !isReducedMotion) {
      const hoverStyles = getHoverStyles();
      e.currentTarget.style.transform = hoverStyles.transform as string;
      e.currentTarget.style.boxShadow = hoverStyles.boxShadow as string;
      e.currentTarget.style.borderColor = hoverStyles.borderColor as string;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && !isReducedMotion) {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = getVariantStyles().boxShadow as string;
      e.currentTarget.style.borderColor = getVariantStyles().border as string;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    
    // Haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    onClick?.();
  };

  return (
    <button
      type={type}
      className={`modern-button ${className}`}
      style={buttonStyles}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || loading}
      title={title}
      aria-disabled={disabled || loading}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
        </div>
      )}
      
      {/* Icon */}
      {icon && !loading && (
        <span className="button-icon">
          {icon}
        </span>
      )}
      
      {/* Button content */}
      <span className="button-content" style={{ opacity: loading ? 0.5 : 1 }}>
        {children}
      </span>
    </button>
  );
};

// Modern button CSS
const modernButtonStyles = `
.modern-button {
  isolation: isolate;
}

.modern-button:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.modern-button:focus:not(:focus-visible) {
  outline: none;
}

.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.spinner-ring {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .modern-button {
    border-width: 3px;
    text-shadow: none;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .modern-button {
    transition: none;
  }
  
  .modern-button:hover {
    transform: none;
  }
  
  .spinner-ring {
    animation: none;
  }
}
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = modernButtonStyles;
  document.head.appendChild(styleSheet);
} 