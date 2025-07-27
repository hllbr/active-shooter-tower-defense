import React, { useState, useCallback, useEffect } from 'react';
import { performanceSettings } from '../../utils/settings/PerformanceSettings';
import { PerformanceModeSelector } from './PerformanceModeSelector';
import { getSettings, saveSettings } from '../../utils/settings';
import { enhancedAudioManager } from '../../utils/sound/EnhancedAudioManager';
import { HelpfulTipsPanel } from './HelpfulTipsPanel';
import { AccessibilitySettings } from './AccessibilitySettings';
import { AnalyticsSettings } from './AnalyticsSettings';
import { accessibilityManager } from '../../utils/accessibility/AccessibilityManager';
import './SettingsPanel.css';
import { useGameStore } from '../../models/store';
import type { Settings } from '../../utils/settings';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'audio' | 'performance' | 'accessibility' | 'analytics' | 'tips';

export const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const setPaused = useGameStore(state => state.setPaused);
  const [showPerformanceSelector, setShowPerformanceSelector] = useState(false);
  const [settings, setSettingsState] = useState<Settings>(getSettings());
  const [activeTab, setActiveTab] = useState<SettingsTab>('audio');

  const currentPerformanceMode = performanceSettings.getMode();

  React.useEffect(() => {
    if (isOpen) setPaused(true);
    return () => setPaused(false);
  }, [isOpen, setPaused]);

  // Initialize accessibility manager
  useEffect(() => {
    accessibilityManager.initialize(settings);
  }, [settings]);

  const handleVolumeChange = useCallback((type: 'sfxVolume' | 'musicVolume', value: number) => {
    const newSettings = { ...settings, [type]: value };
    setSettingsState(newSettings);
    
    // Use enhanced audio manager for smooth transitions
    if (type === 'sfxVolume') {
      enhancedAudioManager.updateSFXVolume(value);
    } else {
      enhancedAudioManager.updateMusicVolume(value);
    }
  }, [settings]);

  const handleMuteToggle = useCallback(() => {
    const newMuteState = !settings.mute;
    const newSettings = { ...settings, mute: newMuteState };
    setSettingsState(newSettings);
    
    // Use enhanced audio manager for immediate mute toggle
    enhancedAudioManager.toggleMute();
  }, [settings]);

  const handleHealthBarToggle = useCallback(() => {
    const newHealthBarState = !settings.healthBarAlwaysVisible;
    const newSettings = { ...settings, healthBarAlwaysVisible: newHealthBarState };
    setSettingsState(newSettings);
    saveSettings(newSettings);
  }, [settings]);

  const handleSettingsChange = useCallback((newSettings: Settings) => {
    setSettingsState(newSettings);
    saveSettings(newSettings);
  }, []);

  const testDiceSound = useCallback(() => {
    import('../../utils/sound').then(({ playSoundForTest }) => {
      playSoundForTest('dice-roll'); // Cooldown bypass ile test
    });
  }, []);

  if (!isOpen) {
    return null;
  }

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

          {/* Tab Navigation */}
          <div className="settings-tab-navigation">
            <button
              className={`settings-tab-button ${activeTab === 'audio' ? 'active' : ''}`}
              onClick={() => setActiveTab('audio')}
            >
              🔊 Ses
            </button>
            <button
              className={`settings-tab-button ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveTab('performance')}
            >
              ⚡ Performans
            </button>
                              <button
                    className={`settings-tab-button ${activeTab === 'accessibility' ? 'active' : ''}`}
                    onClick={() => setActiveTab('accessibility')}
                  >
                    ♿ Erişilebilirlik
                  </button>
                  <button
                    className={`settings-tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                  >
                    📊 Analitik
                  </button>
                  <button
                    className={`settings-tab-button ${activeTab === 'tips' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tips')}
                  >
                    💡 İpuçları
                  </button>
          </div>

          {/* Tab Content */}
          <div className="settings-tab-content">
            {activeTab === 'audio' && (
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
                      <label>Ses Testi</label>
                      <button
                        className="test-sound-button"
                        onClick={testDiceSound}
                        disabled={settings.mute}
                      >
                        🎲 Zar Sesi Test Et
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="modern-settings-grid">
                {/* Performance Settings Card */}
                <div className="modern-settings-card">
                  <div className="card-header">
                    <span className="card-icon">⚡</span>
                    <h3>Performans Ayarları</h3>
                  </div>
                  
                  <div className="card-content">
                    <div className="setting-row">
                      <label>Performans Modu</label>
                      <div className="performance-display">
                        <div className="performance-info">
                          <div className="performance-label">Mevcut Mod</div>
                          <div className="performance-value">
                            {currentPerformanceMode}
                            <span className={`performance-indicator ${currentPerformanceMode === 'high' ? 'good' : currentPerformanceMode === 'medium' ? 'warning' : 'poor'}`}></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="setting-row">
                      <label>Mod Değiştir</label>
                      <button
                        className="change-mode-button"
                        onClick={() => setShowPerformanceSelector(true)}
                      >
                        🔄 Performans Modu Seç
                      </button>
                    </div>

                    {/* Health Bar Visibility */}
                    <div className="setting-row">
                      <label>Sağlık Çubukları</label>
                      <div className="mute-control">
                        <button 
                          className={`mute-toggle-button ${settings.healthBarAlwaysVisible ? 'active' : 'muted'}`}
                          onClick={handleHealthBarToggle}
                          title={settings.healthBarAlwaysVisible ? 'Hover Moduna Geç' : 'Her Zaman Görünür Moduna Geç'}
                        >
                          <span className="speaker-icon">
                            {settings.healthBarAlwaysVisible ? '👁️' : '👁️‍🗨️'}
                          </span>
                          <span className="mute-text">
                            {settings.healthBarAlwaysVisible ? 'Her Zaman' : 'Hover'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'accessibility' && (
              <AccessibilitySettings 
                settings={settings}
                onSettingsChange={handleSettingsChange}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsSettings onClose={onClose} />
            )}

            {activeTab === 'tips' && (
              <div className="tips-tab-content">
                <HelpfulTipsPanel />
              </div>
            )}
          </div>

          {/* Settings Footer */}
          <div className="settings-footer">
            <button
              className="reset-button"
              onClick={() => {
                const defaultSettings = getSettings();
                setSettingsState(defaultSettings);
                accessibilityManager.updateSettings(defaultSettings);
                saveSettings(defaultSettings);
              }}
            >
              🔄 Varsayılana Sıfırla
            </button>
            <button
              className="save-button"
              onClick={() => {
                saveSettings(settings);
                onClose();
              }}
            >
              💾 Kaydet ve Kapat
            </button>
          </div>
        </div>
      </div>

      {/* Performance Mode Selector Modal */}
      {showPerformanceSelector && (
        <PerformanceModeSelector
          isVisible={showPerformanceSelector}
          onClose={() => setShowPerformanceSelector(false)}
        />
      )}
    </>
  );
}; 