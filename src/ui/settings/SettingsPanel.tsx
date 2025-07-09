import React, { useState } from 'react';
import { performanceSettings } from '../../utils/settings/PerformanceSettings';
import { PerformanceModeSelector } from './PerformanceModeSelector';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [showPerformanceSelector, setShowPerformanceSelector] = useState(false);

  const currentPerformanceMode = performanceSettings.getMode();

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="settings-panel-overlay">
        <div className="settings-panel">
          <div className="settings-header">
            <h2>🎮 Oyun Ayarları</h2>
            <button 
              className="close-button"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <div className="settings-content">
            {/* Performance Mode Section */}
            <div className="settings-section">
              <h3>🎯 Performans Modu</h3>
              <p className="section-description">
                Bilgisayarınızın performansına göre görsel kalitesini ayarlayın
              </p>
              
              <div className="performance-status">
                <div className="current-mode">
                  <span className="mode-label">Aktif Mod:</span>
                  <span className="mode-value">
                    {performanceSettings.getModeDescription(currentPerformanceMode).title}
                    {performanceSettings.getModeDescription(currentPerformanceMode).icon}
                  </span>
                </div>
                <button 
                  className="change-mode-button"
                  onClick={() => setShowPerformanceSelector(true)}
                >
                  Modu Değiştir
                </button>
              </div>
            </div>

            {/* Performance Tips */}
            <div className="settings-section performance-tips">
              <h3>💡 Performans İpuçları</h3>
              <ul>
                <li>🎯 <strong>Temiz Mod:</strong> En iyi performans için önerilir</li>
                <li>🔊 <strong>Ses Azaltma:</strong> Ses seviyesini düşürmek CPU kullanımını azaltır</li>
                <li>👁️ <strong>Animasyon Azaltma:</strong> Animasyonları kapatmak FPS'i artırır</li>
                <li>📱 <strong>Mobil Cihazlar:</strong> Temiz modu kullanın ve titreşimi kapatın</li>
              </ul>
            </div>
          </div>

          <div className="settings-footer">
            <button 
              className="reset-button"
              onClick={() => {
                if (confirm('Performans ayarlarını varsayılana döndürmek istediğinizden emin misiniz?')) {
                  performanceSettings.setMode('normal');
                }
              }}
            >
              🔄 Varsayılana Dön
            </button>
            
            <button 
              className="close-panel-button"
              onClick={onClose}
            >
              ✓ Tamam
            </button>
          </div>
        </div>
      </div>

      {showPerformanceSelector && (
        <PerformanceModeSelector 
          onClose={() => setShowPerformanceSelector(false)}
        />
      )}
    </>
  );
}; 