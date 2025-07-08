import React, { useState } from 'react';
import { useGameStore } from '../../models/store';
import { performanceSettings } from '../../utils/settings/PerformanceSettings';
import { PerformanceModeSelector } from './PerformanceModeSelector';
import './SettingsPanel.css';

export const SettingsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPerformanceSelector, setShowPerformanceSelector] = useState(false);
  const { settings, updateSettings } = useGameStore();

  const currentPerformanceMode = performanceSettings.getMode();

  if (!isOpen) {
    return (
      <button
        className="settings-trigger"
        onClick={() => setIsOpen(true)}
        title="Ayarlar"
      >
        ⚙️
      </button>
    );
  }

  return (
    <>
      <div className="settings-overlay">
        <div className="settings-panel">
          <div className="settings-header">
            <h2>🎮 Oyun Ayarları</h2>
            <button 
              className="close-button"
              onClick={() => setIsOpen(false)}
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

            {/* Audio Settings */}
            <div className="settings-section">
              <h3>🔊 Ses Ayarları</h3>
              
              <label className="setting-item">
                <span>Müzik Seviyesi</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.musicVolume * 100}
                  onChange={(e) => updateSettings({
                    musicVolume: parseInt(e.target.value) / 100
                  })}
                />
                <span className="value">{Math.round(settings.musicVolume * 100)}%</span>
              </label>

              <label className="setting-item">
                <span>Efekt Ses Seviyesi</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.sfxVolume * 100}
                  onChange={(e) => updateSettings({
                    sfxVolume: parseInt(e.target.value) / 100
                  })}
                />
                <span className="value">{Math.round(settings.sfxVolume * 100)}%</span>
              </label>

              <label className="setting-checkbox">
                <input
                  type="checkbox"
                  checked={settings.muteSounds}
                  onChange={(e) => updateSettings({
                    muteSounds: e.target.checked
                  })}
                />
                <span>Tüm sesleri kapat</span>
              </label>
            </div>

            {/* Visual Settings */}
            <div className="settings-section">
              <h3>👁️ Görsel Ayarlar</h3>
              
              <label className="setting-checkbox">
                <input
                  type="checkbox"
                  checked={settings.reduceMotion}
                  onChange={(e) => updateSettings({
                    reduceMotion: e.target.checked
                  })}
                />
                <span>Animasyonları azalt (Performans için)</span>
              </label>

              <label className="setting-checkbox">
                <input
                  type="checkbox"
                  checked={settings.showDebugInfo}
                  onChange={(e) => updateSettings({
                    showDebugInfo: e.target.checked
                  })}
                />
                <span>Debug bilgilerini göster</span>
              </label>

              <label className="setting-checkbox">
                <input
                  type="checkbox"
                  checked={settings.enableHapticFeedback}
                  onChange={(e) => updateSettings({
                    enableHapticFeedback: e.target.checked
                  })}
                />
                <span>Titreşim geri bildirimi (Mobil)</span>
              </label>
            </div>

            {/* Game Settings */}
            <div className="settings-section">
              <h3>🎲 Oyun Ayarları</h3>
              
              <label className="setting-checkbox">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => updateSettings({
                    autoSave: e.target.checked
                  })}
                />
                <span>Otomatik kayıt</span>
              </label>

              <label className="setting-checkbox">
                <input
                  type="checkbox"
                  checked={settings.confirmResets}
                  onChange={(e) => updateSettings({
                    confirmResets: e.target.checked
                  })}
                />
                <span>Oyun sıfırlama onayı iste</span>
              </label>
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
                if (confirm('Tüm ayarları varsayılana döndürmek istediğinizden emin misiniz?')) {
                  // Reset to defaults
                  updateSettings({
                    musicVolume: 0.7,
                    sfxVolume: 0.8,
                    muteSounds: false,
                    reduceMotion: false,
                    showDebugInfo: false,
                    enableHapticFeedback: true,
                    autoSave: true,
                    confirmResets: true
                  });
                  performanceSettings.setMode('normal');
                }
              }}
            >
              🔄 Varsayılana Dön
            </button>
            
            <button 
              className="close-panel-button"
              onClick={() => setIsOpen(false)}
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