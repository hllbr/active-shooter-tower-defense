import React, { useState } from 'react';
import { performanceSettings } from '../../utils/settings/PerformanceSettings';
import { PerformanceModeSelector } from './PerformanceModeSelector';
import { getSettings, saveSettings } from '../../utils/settings';
import { updateAllSoundVolumes } from '../../utils/sound';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [showPerformanceSelector, setShowPerformanceSelector] = useState(false);
  const [settings, setSettingsState] = useState(getSettings());

  const currentPerformanceMode = performanceSettings.getMode();

  if (!isOpen) {
    return null;
  }

  const handleVolumeChange = (type: 'sfxVolume' | 'musicVolume', value: number) => {
    const newSettings = { ...settings, [type]: value };
    setSettingsState(newSettings);
    saveSettings(newSettings);
    updateAllSoundVolumes();
  };

  const handleMuteToggle = () => {
    const newSettings = { ...settings, mute: !settings.mute };
    setSettingsState(newSettings);
    saveSettings(newSettings);
    updateAllSoundVolumes();
  };

  const testDiceSound = () => {
    import('../../utils/sound').then(({ playSoundForTest }) => {
      playSoundForTest('dice-roll'); // Cooldown bypass ile test
    });
  };

  return (
    <>
      <div className="settings-panel-overlay">
        <div className="modern-settings-panel">
          {/* Header */}
          <div className="modern-settings-header">
            <h2>⚙️ Oyun Ayarları</h2>
            <button 
              className="modern-close-button"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          {/* Settings Grid */}
          <div className="modern-settings-grid">
            
            {/* Audio Settings Card */}
            <div className="modern-settings-card">
              <div className="card-header">
                <span className="card-icon">🔊</span>
                <h3>Ses Ayarları</h3>
              </div>
              
              <div className="card-content">
                {/* Master Mute with Enhanced Speaker Icon */}
                <div className="setting-row">
                  <label>Ana Ses</label>
                  <div className="mute-control">
                    <button 
                      className={`mute-toggle-button ${settings.mute ? 'muted' : 'active'}`}
                      onClick={handleMuteToggle}
                      title={settings.mute ? 'Sesi Aç' : 'Sesi Kapat'}
                    >
                      <span className="speaker-icon">
                        {settings.mute ? '🔇' : '🔊'}
                      </span>
                      <span className="mute-text">
                        {settings.mute ? 'Sessiz' : 'Sesli'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* SFX Volume */}
                <div className="setting-row">
                  <label>Efekt Sesleri</label>
                  <div className="volume-control">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.sfxVolume}
                      onChange={(e) => handleVolumeChange('sfxVolume', parseFloat(e.target.value))}
                      className="volume-slider"
                      disabled={settings.mute}
                    />
                    <span className="volume-value">{Math.round(settings.sfxVolume * 100)}%</span>
                  </div>
                </div>

                {/* Music Volume */}
                <div className="setting-row">
                  <label>Müzik</label>
                  <div className="volume-control">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.musicVolume}
                      onChange={(e) => handleVolumeChange('musicVolume', parseFloat(e.target.value))}
                      className="volume-slider"
                      disabled={settings.mute}
                    />
                    <span className="volume-value">{Math.round(settings.musicVolume * 100)}%</span>
                  </div>
                </div>

                {/* Test Sound Button */}
                <div className="setting-row">
                  <button 
                    className="test-sound-button"
                    onClick={testDiceSound}
                    disabled={settings.mute}
                  >
                    🎲 Zar Sesini Test Et
                  </button>
                </div>
              </div>
            </div>

            {/* Performance Settings Card */}
            <div className="modern-settings-card">
              <div className="card-header">
                <span className="card-icon">🎯</span>
                <h3>Performans Modu</h3>
              </div>
              
              <div className="card-content">
                <div className="setting-row">
                  <label>Aktif Mod</label>
                  <div className="performance-display">
                    <span className="mode-badge">
                      {performanceSettings.getModeDescription(currentPerformanceMode).icon}
                      {performanceSettings.getModeDescription(currentPerformanceMode).title}
                    </span>
                  </div>
                </div>
                
                <div className="setting-row">
                  <button 
                    className="change-mode-button"
                    onClick={() => setShowPerformanceSelector(true)}
                  >
                    Modu Değiştir
                  </button>
                </div>

                <div className="performance-tips">
                  <h4>💡 Performans İpuçları</h4>
                  <ul>
                    <li>🎯 <strong>Temiz Mod:</strong> En iyi performans için önerilir</li>
                    <li>🔊 <strong>Ses Azaltma:</strong> Ses seviyesini düşürmek CPU kullanımını azaltır</li>
                    <li>👁️ <strong>Animasyon Azaltma:</strong> Animasyonları kapatmak FPS'i artırır</li>
                    <li>📱 <strong>Mobil Cihazlar:</strong> Temiz modu kullanın</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="modern-settings-footer">
            <button 
              className="reset-button"
              onClick={() => {
                if (confirm('Tüm ayarları varsayılana döndürmek istediğinizden emin misiniz?')) {
                  const defaultSettings = { mute: false, sfxVolume: 0.7, musicVolume: 0.5 };
                  setSettingsState(defaultSettings);
                  saveSettings(defaultSettings);
                  performanceSettings.setMode('normal');
                  updateAllSoundVolumes();
                }
              }}
            >
              🔄 Varsayılana Dön
            </button>
            
            <button 
              className="save-button"
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