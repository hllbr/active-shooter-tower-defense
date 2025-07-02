import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings, type Settings,      } from '../../utils/settings';
import { updateMusicSettings } from '../../utils/sound/musicManager';
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
    updateMusicSettings();
    setChanged(true);
  };

  const handleClose = () => {
    if (changed) {
      toast('Ayarlar kaydedildi', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="settings-panel-overlay" onClick={handleClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <h2>Ayarlar</h2>
        <label>
          Müzik Ses Seviyesi
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={settings.musicVolume}
            onChange={e => handleChange('musicVolume', parseFloat(e.target.value))}
          />
        </label>
        <label>
          Efekt Ses Seviyesi
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={settings.sfxVolume}
            onChange={e => handleChange('sfxVolume', parseFloat(e.target.value))}
          />
        </label>
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={settings.mute}
            onChange={e => handleChange('mute', e.target.checked)}
          />
          Tüm Sesleri Kapat
        </label>
        <button onClick={handleClose}>Kapat</button>
      </div>
    </div>
  );
}; 