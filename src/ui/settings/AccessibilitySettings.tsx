import React, { useState, useEffect } from 'react';
import { accessibilityManager } from '../../utils/accessibility/AccessibilityManager';
import type { Settings } from '../../utils/settings';

interface AccessibilitySettingsProps {
  settings: Settings;
  onSettingsChange: (newSettings: Settings) => void;
}

export const AccessibilitySettings = ({
  settings,
  onSettingsChange
}: AccessibilitySettingsProps) => {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleAccessibilityModeChange = (mode: Settings['accessibilityMode']) => {
    const newSettings = { ...localSettings, accessibilityMode: mode };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
    accessibilityManager.updateSettings(newSettings);
  };

  const handleColorblindTypeChange = (type: Settings['colorblindType']) => {
    const newSettings = { ...localSettings, colorblindType: type };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
    accessibilityManager.updateSettings(newSettings);
  };

  const handleUIScaleChange = (scale: number) => {
    const validatedScale = accessibilityManager.validateUIScale(scale);
    const newSettings = { ...localSettings, uiScale: validatedScale };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
    accessibilityManager.updateSettings(newSettings);
  };

  const handleRecommendedScale = () => {
    const recommendedScale = accessibilityManager.getRecommendedUIScale();
    handleUIScaleChange(recommendedScale);
  };

  const getAccessibilityModeIcon = (mode: string): string => {
    switch (mode) {
      case 'normal': return '👁️';
      case 'colorblind': return '🎨';
      case 'highContrast': return '🔍';
      case 'reducedMotion': return '⏸️';
      default: return '⚙️';
    }
  };

  const getColorblindTypeIcon = (type: string): string => {
    switch (type) {
      case 'deuteranopia': return '🔴🟢';
      case 'protanopia': return '🔴';
      case 'tritanopia': return '🔵🟡';
      case 'achromatopsia': return '⚫⚪';
      default: return '🎨';
    }
  };

  return (
    <div className="modern-settings-grid">
      {/* Accessibility Mode Card */}
      <div className="modern-settings-card">
        <div className="card-header">
          <span className="card-icon">♿</span>
          <h3>Erişilebilirlik Modu</h3>
        </div>
        
        <div className="card-content">
          <div className="setting-row">
            <label>Erişilebilirlik Modu</label>
            <div className="accessibility-mode-selector">
              {(['normal', 'colorblind', 'highContrast', 'reducedMotion'] as const).map((mode) => (
                <button
                  key={mode}
                  className={`accessibility-mode-button ${localSettings.accessibilityMode === mode ? 'active' : ''}`}
                  onClick={() => handleAccessibilityModeChange(mode)}
                  title={accessibilityManager.getAccessibilityModeDescription(mode)}
                >
                  <span className="mode-icon">{getAccessibilityModeIcon(mode)}</span>
                  <span className="mode-text">
                    {mode === 'normal' && 'Normal'}
                    {mode === 'colorblind' && 'Renk Körü'}
                    {mode === 'highContrast' && 'Yüksek Kontrast'}
                    {mode === 'reducedMotion' && 'Azaltılmış Hareket'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Colorblind Type Selector (only show when colorblind mode is active) */}
          {localSettings.accessibilityMode === 'colorblind' && (
            <div className="setting-row">
              <label>Renk Körlüğü Tipi</label>
              <div className="colorblind-type-selector">
                {(['deuteranopia', 'protanopia', 'tritanopia', 'achromatopsia'] as const).map((type) => (
                  <button
                    key={type}
                    className={`colorblind-type-button ${localSettings.colorblindType === type ? 'active' : ''}`}
                    onClick={() => handleColorblindTypeChange(type)}
                    title={accessibilityManager.getColorblindTypeDescription(type)}
                  >
                    <span className="type-icon">{getColorblindTypeIcon(type)}</span>
                    <span className="type-text">
                      {type === 'deuteranopia' && 'Deuteranopia'}
                      {type === 'protanopia' && 'Protanopia'}
                      {type === 'tritanopia' && 'Tritanopia'}
                      {type === 'achromatopsia' && 'Achromatopsia'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* UI Scaling Card */}
      <div className="modern-settings-card">
        <div className="card-header">
          <span className="card-icon">📏</span>
          <h3>UI Ölçeklendirme</h3>
        </div>
        
        <div className="card-content">
          <div className="setting-row">
            <label>UI Boyutu</label>
            <div className="ui-scale-control">
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.1"
                value={localSettings.uiScale}
                onChange={(e) => handleUIScaleChange(parseFloat(e.target.value))}
                className="ui-scale-slider"
              />
              <span className="scale-value">{Math.round(localSettings.uiScale * 100)}%</span>
            </div>
          </div>

          <div className="setting-row">
            <label>Önerilen Boyut</label>
            <button
              className="recommended-scale-button"
              onClick={handleRecommendedScale}
              title="Ekran boyutunuza göre önerilen UI boyutunu ayarlar"
            >
              📱 Önerilen Boyut
            </button>
          </div>

          <div className="scale-presets">
            <button
              className={`scale-preset-button ${localSettings.uiScale === 0.8 ? 'active' : ''}`}
              onClick={() => handleUIScaleChange(0.8)}
            >
              Küçük (80%)
            </button>
            <button
              className={`scale-preset-button ${localSettings.uiScale === 1.0 ? 'active' : ''}`}
              onClick={() => handleUIScaleChange(1.0)}
            >
              Normal (100%)
            </button>
            <button
              className={`scale-preset-button ${localSettings.uiScale === 1.2 ? 'active' : ''}`}
              onClick={() => handleUIScaleChange(1.2)}
            >
              Büyük (120%)
            </button>
            <button
              className={`scale-preset-button ${localSettings.uiScale === 1.5 ? 'active' : ''}`}
              onClick={() => handleUIScaleChange(1.5)}
            >
              Çok Büyük (150%)
            </button>
          </div>
        </div>
      </div>

      {/* Accessibility Preview Card */}
      <div className="modern-settings-card">
        <div className="card-header">
          <span className="card-icon">👀</span>
          <h3>Önizleme</h3>
        </div>
        
        <div className="card-content">
          <div className="accessibility-preview">
            <div className="preview-health-bars">
              <h4>Sağlık Çubukları</h4>
              <div className="health-bar-preview">
                <div className="health-bar good">
                  <div className="health-fill" style={{ width: '100%' }}></div>
                  <span>İyi Sağlık (100%)</span>
                </div>
                <div className="health-bar warning">
                  <div className="health-fill" style={{ width: '50%' }}></div>
                  <span>Uyarı (50%)</span>
                </div>
                <div className="health-bar bad">
                  <div className="health-fill" style={{ width: '20%' }}></div>
                  <span>Kritik (20%)</span>
                </div>
              </div>
            </div>

            <div className="preview-ui-colors">
              <h4>UI Renkleri</h4>
              <div className="color-preview-grid">
                <div className="color-preview primary">Birincil</div>
                <div className="color-preview secondary">İkincil</div>
                <div className="color-preview accent">Vurgu</div>
                <div className="color-preview danger">Tehlike</div>
                <div className="color-preview success">Başarı</div>
                <div className="color-preview warning">Uyarı</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 