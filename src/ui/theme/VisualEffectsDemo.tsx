import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';
import { GlassMorphism } from './GlassMorphism';
// import { NeonButton } from './NeonButton';
import { ModernButton } from './ModernButton';
import { CinematicCameraManager } from '../../game-systems/cinematic/CinematicCameraManager';
import { PostProcessingManager } from '../../game-systems/post-processing/PostProcessingManager';

export const VisualEffectsDemo: React.FC = () => {
  const { theme, setTheme, accessibilityMode, setAccessibilityMode } = useTheme();
  const [activeFilter, setActiveFilter] = useState('normal');
  const [isDemoVisible, setIsDemoVisible] = useState(false);

  const cinematicManager = CinematicCameraManager.getInstance();
  const postProcessingManager = PostProcessingManager.getInstance();

  const handleFilterChange = (filterName: string) => {
    setActiveFilter(filterName);
    postProcessingManager.applyGameStateFilter(filterName, 1000);
  };

  const handleCinematicEffect = (effectType: string) => {
    switch (effectType) {
      case 'shake':
        cinematicManager.triggerShake(20, 2000);
        break;
      case 'zoom':
        cinematicManager.triggerZoom(1.5, 2000, { x: 960, y: 540 });
        break;
      case 'slow_motion':
        cinematicManager.triggerSlowMotion(3000, 0.3);
        break;
      case 'boss_entrance':
        cinematicManager.triggerBossEntrance({ x: 960, y: 540 });
        break;
      case 'victory':
        cinematicManager.triggerVictoryCinematic();
        break;
      case 'defeat':
        cinematicManager.triggerDefeatCinematic();
        break;
      case 'reset':
        cinematicManager.resetCamera();
        break;
    }
  };

  const filters = [
    { name: 'normal', label: 'Normal' },
    { name: 'under_attack', label: 'Under Attack' },
    { name: 'low_health', label: 'Low Health' },
    { name: 'victory', label: 'Victory' },
    { name: 'defeat', label: 'Defeat' },
    { name: 'boss_fight', label: 'Boss Fight' },
    { name: 'night_mode', label: 'Night Mode' },
    { name: 'retro_mode', label: 'Retro Mode' },
  ];

  const cinematicEffects = [
    { name: 'shake', label: 'Camera Shake' },
    { name: 'zoom', label: 'Zoom Effect' },
    { name: 'slow_motion', label: 'Slow Motion' },
    { name: 'boss_entrance', label: 'Boss Entrance' },
    { name: 'victory', label: 'Victory Cinematic' },
    { name: 'defeat', label: 'Defeat Cinematic' },
    { name: 'reset', label: 'Reset Camera' },
  ];

  if (!isDemoVisible) {
    return (
      <ModernButton
        onClick={() => setIsDemoVisible(true)}
        variant="holographic"
        size="large"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
        }}
      >
        🎨 Visual Effects Demo
      </ModernButton>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        zIndex: 10000,
        padding: '20px',
        overflow: 'auto',
      }}
    >
      <GlassMorphism
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#ffffff', margin: 0 }}>🎨 Visual Effects Demo</h1>
          <ModernButton
            onClick={() => setIsDemoVisible(false)}
            variant="danger"
            size="small"
          >
            ✕ Close
          </ModernButton>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Theme Controls */}
          <GlassMorphism variant="subtle" style={{ padding: '20px' }}>
            <h3 style={{ color: '#ffffff', marginBottom: '15px' }}>🎨 Theme Controls</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <ModernButton
                onClick={() => setTheme('dark')}
                variant={theme === 'dark' ? 'primary' : 'glass'}
                size="small"
              >
                Dark Theme
              </ModernButton>
              <ModernButton
                onClick={() => setTheme('light')}
                variant={theme === 'light' ? 'primary' : 'glass'}
                size="small"
              >
                Light Theme
              </ModernButton>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <ModernButton
                onClick={() => setAccessibilityMode('normal')}
                variant={accessibilityMode === 'normal' ? 'primary' : 'glass'}
                size="small"
              >
                Normal
              </ModernButton>
              <ModernButton
                onClick={() => setAccessibilityMode('highContrast')}
                variant={accessibilityMode === 'highContrast' ? 'primary' : 'glass'}
                size="small"
              >
                High Contrast
              </ModernButton>
              <ModernButton
                onClick={() => setAccessibilityMode('reducedMotion')}
                variant={accessibilityMode === 'reducedMotion' ? 'primary' : 'glass'}
                size="small"
              >
                Reduced Motion
              </ModernButton>
            </div>
          </GlassMorphism>

          {/* Post-Processing Filters */}
          <GlassMorphism variant="subtle" style={{ padding: '20px' }}>
            <h3 style={{ color: '#ffffff', marginBottom: '15px' }}>🎭 Post-Processing Filters</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {filters.map((filter) => (
                <ModernButton
                  key={filter.name}
                  onClick={() => handleFilterChange(filter.name)}
                  variant={activeFilter === filter.name ? 'primary' : 'glass'}
                  size="small"
                >
                  {filter.label}
                </ModernButton>
              ))}
            </div>
          </GlassMorphism>

          {/* Cinematic Effects */}
          <GlassMorphism variant="subtle" style={{ padding: '20px' }}>
            <h3 style={{ color: '#ffffff', marginBottom: '15px' }}>🎬 Cinematic Effects</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {cinematicEffects.map((effect) => (
                <ModernButton
                  key={effect.name}
                  onClick={() => handleCinematicEffect(effect.name)}
                  variant="secondary"
                  size="small"
                >
                  {effect.label}
                </ModernButton>
              ))}
            </div>
          </GlassMorphism>

          {/* Button Variants */}
          <GlassMorphism variant="subtle" style={{ padding: '20px' }}>
            <h3 style={{ color: '#ffffff', marginBottom: '15px' }}>🔘 Button Variants</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <ModernButton variant="primary" size="small">
                Primary Button
              </ModernButton>
              <ModernButton variant="secondary" size="small">
                Secondary Button
              </ModernButton>
              <ModernButton variant="danger" size="small">
                Danger Button
              </ModernButton>
              <ModernButton variant="success" size="small">
                Success Button
              </ModernButton>
              <ModernButton variant="glass" size="small">
                Glass Button
              </ModernButton>
              <ModernButton variant="holographic" size="small">
                Holographic Button
              </ModernButton>
            </div>
          </GlassMorphism>
        </div>

        {/* Current State Display */}
        <GlassMorphism variant="subtle" style={{ padding: '20px', marginTop: '20px' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '15px' }}>📊 Current State</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', color: '#ffffff' }}>
            <div>
              <strong>Theme:</strong> {theme}
            </div>
            <div>
              <strong>Accessibility:</strong> {accessibilityMode}
            </div>
            <div>
              <strong>Active Filter:</strong> {activeFilter}
            </div>
          </div>
        </GlassMorphism>
      </GlassMorphism>
    </div>
  );
}; 