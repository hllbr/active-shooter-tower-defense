import React, { useState, useEffect } from 'react';
import { performanceSettings, type PerformanceMode } from '../../utils/settings/PerformanceSettings';
import { ModernButton } from '../theme/ModernButton';
import { GlassMorphism } from '../theme/GlassMorphism';

interface PerformanceModeProps {
  onClose?: () => void;
}

export const PerformanceModeSelector: React.FC<PerformanceModeProps> = ({ onClose }) => {
  const [currentMode, setCurrentMode] = useState<PerformanceMode>(performanceSettings.getMode());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Subscribe to performance settings changes
    const unsubscribe = performanceSettings.subscribe(() => {
      setCurrentMode(performanceSettings.getMode());
    });
    
    return unsubscribe;
  }, []);

  const handleModeChange = (mode: PerformanceMode) => {
    performanceSettings.setMode(mode);
    setCurrentMode(mode);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const modes: PerformanceMode[] = ['clean', 'normal', 'enhanced'];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      <GlassMorphism
        style={{
          maxWidth: '800px',
          width: '90%',
          padding: '30px',
          borderRadius: '20px',
          transform: isVisible ? 'scale(1)' : 'scale(0.9)',
          transition: 'transform 0.3s ease, opacity 0.3s ease',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ 
            color: '#FFFFFF', 
            margin: '0 0 10px 0',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            🎯 Performans Modu Seçimi
          </h2>
          <p style={{ 
            color: '#A0AEC0', 
            margin: 0,
            fontSize: '16px'
          }}>
            Bilgisayarınıza ve tercihlerinize uygun modu seçin
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {modes.map((mode) => {
            const description = performanceSettings.getModeDescription(mode);
            const isSelected = currentMode === mode;
            
            return (
              <div
                key={mode}
                style={{
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.2), rgba(34, 197, 94, 0.1))'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isSelected 
                    ? '2px solid #4ADE80' 
                    : '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                }}
                onClick={() => handleModeChange(mode)}
              >
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                    {description.icon}
                  </div>
                  <h3 style={{ 
                    color: '#FFFFFF', 
                    margin: '0 0 8px 0',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
                    {description.title}
                  </h3>
                  <p style={{ 
                    color: '#A0AEC0', 
                    margin: 0,
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}>
                    {description.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ 
                      color: '#4ADE80', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      marginBottom: '2px'
                    }}>
                      Performans
                    </div>
                    <div style={{ color: '#FFFFFF', fontSize: '14px' }}>
                      {description.performance}
                    </div>
                  </div>
                  <div>
                    <div style={{ 
                      color: '#60A5FA', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      marginBottom: '2px'
                    }}>
                      Berraklık
                    </div>
                    <div style={{ color: '#FFFFFF', fontSize: '14px' }}>
                      {description.clarity}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    background: 'rgba(74, 222, 128, 0.1)',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <span style={{ 
                      color: '#4ADE80', 
                      fontSize: '14px', 
                      fontWeight: 'bold'
                    }}>
                      ✓ Aktif Mod
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h4 style={{ 
            color: '#FFFFFF', 
            margin: '0 0 15px 0',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            💡 Öneriler
          </h4>
          <ul style={{ 
            color: '#A0AEC0', 
            margin: 0, 
            paddingLeft: '20px',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <li><strong>Temiz Mod:</strong> Performans sorunları yaşıyorsanız veya oyuna odaklanmak istiyorsanız</li>
            <li><strong>Normal Mod:</strong> Çoğu bilgisayar için ideal, dengeli deneyim</li>
            <li><strong>Gelişmiş Mod:</strong> Güçlü bilgisayarlar için tam görsel deneyim</li>
          </ul>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: '15px'
        }}>
          <ModernButton
            onClick={() => handleModeChange(performanceSettings.autoDetectOptimalMode())}
            variant="secondary"
            size="medium"
          >
            🔍 Otomatik Tespit
          </ModernButton>
          
          <ModernButton
            onClick={handleClose}
            variant="primary"
            size="medium"
          >
            ✓ Tamam
          </ModernButton>
        </div>
      </GlassMorphism>
    </div>
  );
}; 