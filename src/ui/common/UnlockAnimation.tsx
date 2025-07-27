import React, { useState, useEffect } from 'react';

interface UnlockAnimationProps {
  isVisible: boolean;
  type: 'upgrade' | 'reward' | 'achievement' | 'mission';
  title: string;
  description?: string;
  icon?: string;
  onComplete?: () => void;
  duration?: number;
}

export const UnlockAnimation = ({ 
  isVisible, 
  type, 
  title, 
  description, 
  icon, 
  onComplete, 
  duration = 3000 
}: UnlockAnimationProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible && !isAnimating) {
      setIsAnimating(true);
      setShowContent(true);

      // Play unlock sound
      import('../../utils/sound').then(({ playSound }) => {
        playSound('unlock');
      });

      // Hide content after animation
      const contentTimer = setTimeout(() => {
        setShowContent(false);
      }, duration - 500);

      // Complete animation
      const completeTimer = setTimeout(() => {
        setIsAnimating(false);
        onComplete?.();
      }, duration);

      return () => {
        clearTimeout(contentTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isVisible, isAnimating, duration, onComplete]);

  if (!isVisible || !isAnimating) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'upgrade':
        return {
          color: '#4ade80',
          bgColor: 'rgba(74, 222, 128, 0.1)',
          borderColor: '#4ade80',
          icon: icon || '⬆️',
          title: 'Upgrade Unlocked!'
        };
      case 'reward':
        return {
          color: '#fbbf24',
          bgColor: 'rgba(251, 191, 36, 0.1)',
          borderColor: '#fbbf24',
          icon: icon || '🎁',
          title: 'Reward Earned!'
        };
      case 'achievement':
        return {
          color: '#8b5cf6',
          bgColor: 'rgba(139, 92, 246, 0.1)',
          borderColor: '#8b5cf6',
          icon: icon || '🏆',
          title: 'Achievement Unlocked!'
        };
      case 'mission':
        return {
          color: '#3b82f6',
          bgColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: '#3b82f6',
          icon: icon || '🎯',
          title: 'Mission Completed!'
        };
      default:
        return {
          color: '#4ade80',
          bgColor: 'rgba(74, 222, 128, 0.1)',
          borderColor: '#4ade80',
          icon: icon || '✨',
          title: 'Unlocked!'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <>
      {/* Background overlay */}
      <div style={overlayStyle} />
      
      {/* Main animation container */}
      <div style={containerStyle}>
        {/* Glow effect */}
        <div style={{
          ...glowStyle,
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
          boxShadow: `0 0 40px ${config.color}40`
        }} />
        
        {/* Content */}
        {showContent && (
          <div style={contentStyle}>
            {/* Icon with animation */}
            <div style={{
              ...iconStyle,
              color: config.color,
              animation: 'unlockIconBounce 0.6s ease-out'
            }}>
              {config.icon}
            </div>
            
            {/* Title */}
            <h3 style={{
              ...titleStyle,
              color: config.color
            }}>
              {config.title}
            </h3>
            
            {/* Item name */}
            <h4 style={itemTitleStyle}>
              {title}
            </h4>
            
            {/* Description */}
            {description && (
              <p style={descriptionStyle}>
                {description}
              </p>
            )}
            
            {/* Progress bar */}
            <div style={progressBarStyle}>
              <div 
                style={{
                  ...progressFillStyle,
                  backgroundColor: config.color,
                  animation: 'unlockProgress 2s ease-out'
                }}
              />
            </div>
          </div>
        )}
        
        {/* Particle effects */}
        <ParticleEffects type={type} />
      </div>
    </>
  );
};

// Particle effects component
const ParticleEffects = ({ type }: { type: string }) => {
  const particles = Array.from({ length: 12 }, (_, i) => i);
  
  return (
    <>
      {particles.map((i) => (
        <div
          key={i}
          style={{
            ...particleStyle,
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1.5s',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
        />
      ))}
    </>
  );
};

// Styles
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  zIndex: 1500,
  animation: 'fadeIn 0.3s ease-out'
};

const containerStyle: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 1501,
  animation: 'unlockSlideIn 0.4s ease-out'
};

const glowStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-20px',
  left: '-20px',
  right: '-20px',
  bottom: '-20px',
  borderRadius: '20px',
  border: '2px solid',
  animation: 'unlockGlow 2s ease-in-out infinite alternate'
};

const contentStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  padding: '32px',
  textAlign: 'center',
  minWidth: '300px',
  maxWidth: '400px',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
};

const iconStyle: React.CSSProperties = {
  fontSize: '48px',
  marginBottom: '16px',
  display: 'block'
};

const titleStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
};

const itemTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0 0 12px 0',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
};

const descriptionStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#cbd5e0',
  margin: '0 0 20px 0',
  lineHeight: '1.5'
};

const progressBarStyle: React.CSSProperties = {
  height: '4px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '2px',
  overflow: 'hidden'
};

const progressFillStyle: React.CSSProperties = {
  height: '100%',
  width: '0%'
};

const particleStyle: React.CSSProperties = {
  position: 'absolute',
  width: '4px',
  height: '4px',
  backgroundColor: '#ffffff',
  borderRadius: '50%',
  animation: 'unlockParticle 1.5s ease-out forwards',
  pointerEvents: 'none'
};

// Add keyframe animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes unlockSlideIn {
    from { 
      opacity: 0; 
      transform: translate(-50%, -50%) scale(0.8);
    }
    to { 
      opacity: 1; 
      transform: translate(-50%, -50%) scale(1);
    }
  }
  
  @keyframes unlockGlow {
    0% { 
      box-shadow: 0 0 20px rgba(74, 222, 128, 0.3);
      transform: scale(1);
    }
    100% { 
      box-shadow: 0 0 40px rgba(74, 222, 128, 0.6);
      transform: scale(1.02);
    }
  }
  
  @keyframes unlockIconBounce {
    0% { 
      transform: scale(0) rotate(-180deg);
      opacity: 0;
    }
    50% { 
      transform: scale(1.2) rotate(0deg);
      opacity: 1;
    }
    100% { 
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }
  
  @keyframes unlockProgress {
    0% { width: 0%; }
    100% { width: 100%; }
  }
  
  @keyframes unlockParticle {
    0% { 
      opacity: 1;
      transform: scale(1) translate(0, 0);
    }
    100% { 
      opacity: 0;
      transform: scale(0) translate(var(--tx, 50px), var(--ty, -50px));
    }
  }
`;
document.head.appendChild(style); 