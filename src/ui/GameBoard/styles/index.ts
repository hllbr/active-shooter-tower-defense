import React from 'react';

// Keyframe animasyonları
export const keyframeStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0% { opacity: 0.3; transform: scale(1); }
    100% { opacity: 0.8; transform: scale(1.1); }
  }
  @keyframes mine-light-pulse {
    0% { fill-opacity: 0.4; transform: scale(0.8); }
    50% { fill-opacity: 1; transform: scale(1); }
    100% { fill-opacity: 0.4; transform: scale(0.8); }
  }
  @keyframes frost-overlay {
    0% { opacity: 0; filter: blur(0px); }
    50% { opacity: 0.7; filter: blur(2px); }
    100% { opacity: 0.4; filter: blur(1px); }
  }
  .game-over-card {
    animation: scale-up-center 0.4s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
  }
  @keyframes scale-up-center {
    0% { transform: scale(0.5); }
    100% { transform: scale(1); }
  }
  @keyframes shine {
    0% { left: -50%; }
    100% { left: 100%; }
  }
  
  /* 🎬 SLOT UNLOCK ANIMATIONS */
  @keyframes lock-shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
    20%, 40%, 60%, 80% { transform: translateX(2px); }
  }
  @keyframes lock-break {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.1); }
    100% { opacity: 0; transform: scale(1.3); }
  }
  @keyframes slot-crack {
    0% { stroke-dasharray: 0, 100; opacity: 0; }
    50% { stroke-dasharray: 50, 100; opacity: 1; }
    100% { stroke-dasharray: 100, 100; opacity: 0.7; }
  }
  @keyframes golden-burst {
    0% { 
      opacity: 0; 
      transform: scale(0.1); 
      fill: #FFD700;
    }
    50% { 
      opacity: 1; 
      transform: scale(1.5); 
      fill: #FFA500;
    }
    100% { 
      opacity: 0; 
      transform: scale(2); 
      fill: #FF6B35;
    }
  }
  @keyframes slot-reveal {
    0% { 
      transform: translateY(10px) scale(0.8);
      opacity: 0;
    }
    100% { 
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }
  
  /* 🎆 AŞAMA 2: Parçacık & Dalga Efektleri */
  @keyframes particle-burst-1 {
    0% { 
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    100% { 
      transform: translate(-30px, -30px) scale(0.1);
      opacity: 0;
    }
  }
  @keyframes particle-burst-2 {
    0% { 
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    100% { 
      transform: translate(30px, -30px) scale(0.1);
      opacity: 0;
    }
  }
  @keyframes particle-burst-3 {
    0% { 
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    100% { 
      transform: translate(-30px, 30px) scale(0.1);
      opacity: 0;
    }
  }
  @keyframes particle-burst-4 {
    0% { 
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    100% { 
      transform: translate(30px, 30px) scale(0.1);
      opacity: 0;
    }
  }
  @keyframes particle-burst-5 {
    0% { 
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    100% { 
      transform: translate(0, -40px) scale(0.1);
      opacity: 0;
    }
  }
  @keyframes particle-burst-6 {
    0% { 
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    100% { 
      transform: translate(40px, 0) scale(0.1);
      opacity: 0;
    }
  }
  @keyframes particle-burst-7 {
    0% { 
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    100% { 
      transform: translate(0, 40px) scale(0.1);
      opacity: 0;
    }
  }
  @keyframes particle-burst-8 {
    0% { 
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    100% { 
      transform: translate(-40px, 0) scale(0.1);
      opacity: 0;
    }
  }
  @keyframes radial-wave {
    0% { 
      r: 10;
      stroke-width: 4;
      opacity: 1;
    }
    50% { 
      r: 50;
      stroke-width: 2;
      opacity: 0.6;
    }
    100% { 
      r: 80;
      stroke-width: 0;
      opacity: 0;
    }
  }
  @keyframes screen-shake {
    0%, 100% { transform: translate(0, 0); }
    10% { transform: translate(-1px, -1px); }
    20% { transform: translate(1px, -1px); }
    30% { transform: translate(-1px, 1px); }
    40% { transform: translate(1px, 1px); }
    50% { transform: translate(-1px, -1px); }
    60% { transform: translate(1px, -1px); }
    70% { transform: translate(-1px, 1px); }
    80% { transform: translate(1px, 1px); }
    90% { transform: translate(-1px, -1px); }
  }
  
  /* 🎊 AŞAMA 3: Slot Reveal & Celebration */
  @keyframes slot-emerge {
    0% { 
      transform: translateY(15px) scale(0.7);
      opacity: 0;
      filter: blur(2px);
    }
    30% { 
      transform: translateY(5px) scale(0.9);
      opacity: 0.6;
      filter: blur(1px);
    }
    100% { 
      transform: translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }
  @keyframes ground-crack {
    0% { 
      stroke-dasharray: 0, 200;
      opacity: 0;
    }
    50% { 
      stroke-dasharray: 100, 200;
      opacity: 1;
    }
    100% { 
      stroke-dasharray: 200, 200;
      opacity: 0;
    }
  }
  @keyframes slot-ready-glow {
    0%, 100% { 
      stroke-opacity: 0.3;
      stroke-width: 2;
    }
    50% { 
      stroke-opacity: 0.8;
      stroke-width: 4;
    }
  }
  @keyframes celebration-text {
    0% { 
      transform: translateY(0) scale(0.5);
      opacity: 0;
    }
    20% { 
      transform: translateY(-20px) scale(1.2);
      opacity: 1;
    }
    80% { 
      transform: translateY(-40px) scale(1);
      opacity: 1;
    }
    100% { 
      transform: translateY(-60px) scale(0.8);
      opacity: 0;
    }
  }
  @keyframes coin-animation {
    0% { 
      transform: rotate(0deg) translateY(0);
      opacity: 1;
    }
    50% { 
      transform: rotate(180deg) translateY(-30px);
      opacity: 0.8;
    }
    100% { 
      transform: rotate(360deg) translateY(-60px);
      opacity: 0;
    }
  }
  @keyframes achievement-badge {
    0% { 
      transform: scale(0) rotate(-45deg);
      opacity: 0;
    }
    50% { 
      transform: scale(1.3) rotate(0deg);
      opacity: 1;
    }
    100% { 
      transform: scale(1) rotate(0deg);
      opacity: 0;
    }
  }
`;

// Stil sabitleri
export const containerStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  width: '100vw',
  height: '100vh',
  overflow: 'hidden'
};

export const statCardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  padding: '12px',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  color: '#aaa',
};

export const infoIconStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontSize: 18,
  fontWeight: 'bold',
  color: 'white',
  border: '2px solid rgba(59, 130, 246, 0.5)',
  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  transition: 'all 0.3s ease',
  position: 'relative'
};

export const tooltipStyle: React.CSSProperties = {
  position: 'absolute',
  top: '120%',
  left: 0,
  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95))',
  color: 'white',
  padding: 16,
  borderRadius: 12,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  fontSize: 13,
  lineHeight: 1.4,
  minWidth: 'min(320px, calc(100vw - 64px))',
  maxWidth: 'min(400px, calc(100vw - 32px))',
  zIndex: 1000,
  opacity: 1,
  transform: 'translateX(clamp(-50%, 0px, calc(100vw - 100% - 32px)))',
  transition: 'all 0.2s ease-out',
  wordWrap: 'break-word',
  overflowWrap: 'break-word'
}; 