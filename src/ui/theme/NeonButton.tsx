import React from 'react';
import { useTheme } from './ThemeProvider';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  style = {},
  type = 'button',
  title
}) => {
  const { colors, isReducedMotion } = useTheme();

  const getVariantStyles = (): React.CSSProperties => {
    const baseColor = colors[variant];
    const isDark = colors.dark.background === '#0F0F23';

    return {
      background: `linear-gradient(135deg, ${baseColor}20, ${baseColor}10)`,
      border: `2px solid ${baseColor}`,
      color: isDark ? '#FFFFFF' : '#000000',
      boxShadow: `0 0 10px ${baseColor}40, inset 0 1px 0 ${baseColor}30`,
      textShadow: `0 0 5px ${baseColor}`,
    };
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'small':
        return {
          padding: '8px 16px',
          fontSize: '14px',
          borderRadius: '8px',
        };
      case 'large':
        return {
          padding: '16px 32px',
          fontSize: '18px',
          borderRadius: '16px',
        };
      default: // medium
        return {
          padding: '12px 24px',
          fontSize: '16px',
          borderRadius: '12px',
        };
    }
  };

  const getHoverStyles = (): React.CSSProperties => {
    if (disabled) return {};
    
    const baseColor = colors[variant];
    return {
      transform: isReducedMotion ? 'none' : 'scale(1.05) translateY(-2px)',
      boxShadow: `0 0 20px ${baseColor}60, 0 4px 15px ${baseColor}40, inset 0 1px 0 ${baseColor}50`,
      borderColor: `${baseColor}CC`,
    };
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
    ...(disabled ? getDisabledStyles() : {}),
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    transition: isReducedMotion ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    outline: 'none',
    ...style,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isReducedMotion) {
      e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
      e.currentTarget.style.boxShadow = getHoverStyles().boxShadow as string;
      e.currentTarget.style.borderColor = getHoverStyles().borderColor as string;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isReducedMotion) {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = getVariantStyles().boxShadow as string;
      e.currentTarget.style.borderColor = getVariantStyles().border as string;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
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
      className={`neon-button ${className}`}
      style={buttonStyles}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      title={title}
      aria-disabled={disabled}
    >
      {/* Neon glow effect */}
      {!disabled && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: getSizeStyles().borderRadius as string,
            background: `radial-gradient(circle at center, ${colors[variant]}20, transparent 70%)`,
            opacity: 0,
            transition: isReducedMotion ? 'none' : 'opacity 0.3s ease',
            pointerEvents: 'none',
          }}
          className="neon-glow"
        />
      )}
      
      {/* Button content */}
      <span style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </span>
    </button>
  );
};

// Neon glow hover effect CSS
const neonButtonStyles = `
.neon-button:hover .neon-glow {
  opacity: 1;
}

.neon-button:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.neon-button:focus:not(:focus-visible) {
  outline: none;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .neon-button {
    border-width: 3px;
    text-shadow: none;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .neon-button {
    transition: none;
  }
  
  .neon-button:hover {
    transform: none;
  }
}
`;

// CSS'i sayfaya ekle
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = neonButtonStyles;
  document.head.appendChild(styleSheet);
} 