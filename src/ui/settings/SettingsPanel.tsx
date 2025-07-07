import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings, type Settings } from '../../utils/settings';
import { updateMusicSettings } from '../../utils/sound/musicManager';
import { playSound, updateAllSoundVolumes, testVolumeControls } from '../../utils/sound/soundEffects';
import { toast } from 'react-toastify';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultSettings: Settings = {
  musicVolume: 0.7,
  sfxVolume: 0.7,
  mute: false,
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getSettings());
      setChanged(false);
    }
  }, [isOpen]);

  const handleChange = (key: keyof Settings, value: Settings[keyof Settings]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
    
    // Gerçek zamanlı volume güncellemesi
    updateMusicSettings();
    updateAllSoundVolumes();
    
    setChanged(true);
  };

  const handleClose = () => {
    if (changed) {
      toast('🎵 Ses ayarları kaydedildi', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    onClose();
  };

  // Ses seviyesi ikonları
  const getVolumeIcon = (volume: number, isMuted: boolean) => {
    if (isMuted || volume === 0) return '🔇';
    if (volume < 0.3) return '🔈';
    if (volume < 0.7) return '🔉';
    return '🔊';
  };

  // Ses test fonksiyonu
  const testSound = (type: 'music' | 'sfx') => {
    if (type === 'sfx') {
      playSound('dice-roll');
    } else {
      // Müzik testi için kısa bir ses çalabilir
      playSound('levelupwav');
    }
  };

  // Master mute toggle
  const toggleMute = () => {
    const newMute = !settings.mute;
    handleChange('mute', newMute);
    
    // Ses geri bildirimi
    if (!newMute) {
      setTimeout(() => playSound('levelupwav'), 100);
    }
  };

  // Volume test fonksiyonu
  const testVolumeSystem = () => {
    testVolumeControls();
    toast('🔊 Ses sistemi test ediliyor...', {
      position: "top-right",
      autoClose: 2000,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="settings-panel-overlay" onClick={handleClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2>🎵 Ses Ayarları</h2>
          <button className="close-button" onClick={handleClose}>✕</button>
        </div>

        {/* Master Mute Toggle */}
        <div className="master-mute-section">
          <button 
            className={`master-mute-button ${settings.mute ? 'muted' : 'active'}`}
            onClick={toggleMute}
          >
            <span className="mute-icon">
              {settings.mute ? '🔇' : '🔊'}
            </span>
            <span className="mute-text">
              {settings.mute ? 'Sesler Kapalı' : 'Sesler Açık'}
            </span>
          </button>
        </div>

        {/* Müzik Ses Seviyesi */}
        <div className="volume-control">
          <div className="volume-header">
            <span className="volume-icon">
              {getVolumeIcon(settings.musicVolume, settings.mute)}
            </span>
            <span className="volume-label">Müzik</span>
            <span className="volume-value">
              {settings.mute ? '0' : Math.round(settings.musicVolume * 100)}%
            </span>
          </div>
          <div className="volume-slider-container">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={settings.musicVolume}
              onChange={e => handleChange('musicVolume', parseFloat(e.target.value))}
              className="volume-slider music-slider"
              disabled={settings.mute}
            />
            <button 
              className="test-button"
              onClick={() => testSound('music')}
              disabled={settings.mute}
            >
              🎵 Test
            </button>
          </div>
        </div>

        {/* Efekt Ses Seviyesi */}
        <div className="volume-control">
          <div className="volume-header">
            <span className="volume-icon">
              {getVolumeIcon(settings.sfxVolume, settings.mute)}
            </span>
            <span className="volume-label">Efektler</span>
            <span className="volume-value">
              {settings.mute ? '0' : Math.round(settings.sfxVolume * 100)}%
            </span>
          </div>
          <div className="volume-slider-container">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={settings.sfxVolume}
              onChange={e => handleChange('sfxVolume', parseFloat(e.target.value))}
              className="volume-slider sfx-slider"
              disabled={settings.mute}
            />
            <button 
              className="test-button"
              onClick={() => testSound('sfx')}
              disabled={settings.mute}
            >
              🎮 Test
            </button>
          </div>
        </div>

        {/* Ses Profilleri */}
        <div className="audio-presets">
          <h3>Hızlı Ayarlar</h3>
          <div className="preset-buttons">
            <button 
              className="preset-button"
              onClick={() => {
                handleChange('musicVolume', 0.3);
                handleChange('sfxVolume', 0.9);
              }}
            >
              🎯 Odaklanma
            </button>
            <button 
              className="preset-button"
              onClick={() => {
                handleChange('musicVolume', 0.8);
                handleChange('sfxVolume', 0.7);
              }}
            >
              🎪 Eğlence
            </button>
            <button 
              className="preset-button"
              onClick={() => {
                handleChange('musicVolume', 0.5);
                handleChange('sfxVolume', 0.5);
              }}
            >
              ⚖️ Dengeli
            </button>
          </div>
        </div>

        {/* Ses Sistemi Test Butonu */}
        <div className="audio-test-section">
          <button 
            className="volume-test-button"
            onClick={testVolumeSystem}
          >
            🔧 Ses Sistemi Test Et
          </button>
        </div>

        {/* Ses Sistemi Durumu */}
        <div className="audio-status">
          <div className="status-indicator">
            <span className="status-dot active"></span>
            <span>Ses Sistemi Aktif</span>
          </div>
          {changed && (
            <div className="save-indicator">
              <span className="save-dot"></span>
              <span>Ayarlar kaydedildi</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 