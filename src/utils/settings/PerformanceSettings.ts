/**
 * 🎯 Performance Settings Manager
 * Provides user-configurable performance modes for optimal gameplay
 */

export type PerformanceMode = 'clean' | 'normal' | 'enhanced';

export interface PerformanceConfig {
  // Visual settings
  useSimplifiedRenderer: boolean;
  useSimplifiedEnvironment: boolean;
  enablePostProcessing: boolean;
  enableParticleEffects: boolean;
  enableWeatherEffects: boolean;
  enableAnimations: boolean;
  
  // Performance limits
  maxParticles: number;
  effectIntensity: number; // 0-1
  animationQuality: 'low' | 'medium' | 'high';
  
  // Background settings
  useGradientBackground: boolean;
  enableEnvironmentTiles: boolean;
  weatherComplexity: 'minimal' | 'simple' | 'full';
  
  // UI settings
  reduceMotion: boolean;
  simplifyUI: boolean;
  enableGlassEffects: boolean;
}

class PerformanceSettingsManager {
  private currentMode: PerformanceMode = 'normal';
  private config: PerformanceConfig;
  private listeners: Array<(config: PerformanceConfig) => void> = [];

  constructor() {
    // Load saved settings or default to normal
    const saved = localStorage.getItem('performance-mode');
    if (saved && ['clean', 'normal', 'enhanced'].includes(saved)) {
      this.currentMode = saved as PerformanceMode;
    }
    
    this.config = this.generateConfig(this.currentMode);
  }

  /**
   * Generate performance configuration based on mode
   */
  private generateConfig(mode: PerformanceMode): PerformanceConfig {
    const configs: Record<PerformanceMode, PerformanceConfig> = {
      clean: {
        // Clean mode - Maximum performance and clarity
        useSimplifiedRenderer: true,
        useSimplifiedEnvironment: true,
        enablePostProcessing: false,
        enableParticleEffects: false,
        enableWeatherEffects: false,
        enableAnimations: false,
        
        maxParticles: 0,
        effectIntensity: 0,
        animationQuality: 'low',
        
        useGradientBackground: true,
        enableEnvironmentTiles: false,
        weatherComplexity: 'minimal',
        
        reduceMotion: true,
        simplifyUI: true,
        enableGlassEffects: false
      },
      
      normal: {
        // Normal mode - Balanced performance and visuals
        useSimplifiedRenderer: false,
        useSimplifiedEnvironment: true,
        enablePostProcessing: false,
        enableParticleEffects: true,
        enableWeatherEffects: true,
        enableAnimations: true,
        
        maxParticles: 50,
        effectIntensity: 0.5,
        animationQuality: 'medium',
        
        useGradientBackground: true,
        enableEnvironmentTiles: false,
        weatherComplexity: 'simple',
        
        reduceMotion: false,
        simplifyUI: false,
        enableGlassEffects: true
      },
      
      enhanced: {
        // Enhanced mode - Full visual experience
        useSimplifiedRenderer: false,
        useSimplifiedEnvironment: false,
        enablePostProcessing: true,
        enableParticleEffects: true,
        enableWeatherEffects: true,
        enableAnimations: true,
        
        maxParticles: 200,
        effectIntensity: 1.0,
        animationQuality: 'high',
        
        useGradientBackground: false,
        enableEnvironmentTiles: true,
        weatherComplexity: 'full',
        
        reduceMotion: false,
        simplifyUI: false,
        enableGlassEffects: true
      }
    };

    return configs[mode];
  }

  /**
   * Set performance mode
   */
  setMode(mode: PerformanceMode): void {
    this.currentMode = mode;
    this.config = this.generateConfig(mode);
    
    // Save to localStorage
    localStorage.setItem('performance-mode', mode);
    
    // Notify listeners
    this.notifyListeners();
    
    // Apply CSS variables for immediate effect
    this.applyCSSVariables();
  }

  /**
   * Get current performance mode
   */
  getMode(): PerformanceMode {
    return this.currentMode;
  }

  /**
   * Get current configuration
   */
  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  /**
   * Subscribe to performance setting changes
   */
  subscribe(callback: (config: PerformanceConfig) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of config changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.config));
  }

  /**
   * Apply performance settings as CSS variables
   */
  private applyCSSVariables(): void {
    const root = document.documentElement;
    
    // Animation settings
    root.style.setProperty('--animation-duration', 
      this.config.enableAnimations ? '0.3s' : '0s'
    );
    
    root.style.setProperty('--transition-duration', 
      this.config.enableAnimations ? '0.2s' : '0s'
    );
    
    // Effect intensity
    root.style.setProperty('--effect-intensity', 
      this.config.effectIntensity.toString()
    );
    
    // Particle count
    root.style.setProperty('--max-particles', 
      this.config.maxParticles.toString()
    );
    
    // Glass effects
    root.style.setProperty('--glass-opacity', 
      this.config.enableGlassEffects ? '0.1' : '0'
    );
    
    root.style.setProperty('--glass-blur', 
      this.config.enableGlassEffects ? 'blur(10px)' : 'none'
    );
    
    // Motion preferences
    if (this.config.reduceMotion) {
      root.style.setProperty('--motion-preference', 'reduce');
    } else {
      root.style.setProperty('--motion-preference', 'auto');
    }
  }

  /**
   * Get mode descriptions for UI
   */
  getModeDescription(mode: PerformanceMode): {
    title: string;
    description: string;
    icon: string;
    performance: string;
    clarity: string;
  } {
    const descriptions = {
      clean: {
        title: 'Temiz Mod',
        description: 'Maksimum performans ve görsel berraklık. Karmaşık efektler devre dışı.',
        icon: '🎯',
        performance: 'Maksimum',
        clarity: 'Mükemmel'
      },
      normal: {
        title: 'Normal Mod', 
        description: 'Dengeli performans ve görsel efektler. Çoğu oyuncu için ideal.',
        icon: '⚖️',
        performance: 'İyi',
        clarity: 'İyi'
      },
      enhanced: {
        title: 'Gelişmiş Mod',
        description: 'Tam görsel deneyim. Güçlü sistemler için önerilir.',
        icon: '✨',
        performance: 'Orta',
        clarity: 'Orta'
      }
    };

    return descriptions[mode];
  }

  /**
   * Auto-detect optimal performance mode based on device capabilities
   */
  autoDetectOptimalMode(): PerformanceMode {
    // Check device memory (if available)
    const memory = (navigator as { deviceMemory?: number }).deviceMemory;
    
    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 4;
    
    // Check if mobile device
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check viewport size (rough performance indicator)
    const isLargeScreen = window.innerWidth >= 1920 && window.innerHeight >= 1080;
    
    // Auto-detection logic
    if (isMobile || (memory && memory < 4) || cores < 4) {
      return 'clean'; // Low-end devices
    } else if (memory && memory >= 8 && cores >= 8 && isLargeScreen) {
      return 'enhanced'; // High-end devices
    } else {
      return 'normal'; // Mid-range devices
    }
  }

  /**
   * Initialize and apply settings
   */
  initialize(): void {
    this.applyCSSVariables();
    
    // Auto-detect if no saved preference
    if (!localStorage.getItem('performance-mode')) {
      const optimalMode = this.autoDetectOptimalMode();
      this.setMode(optimalMode);
    }
  }
}

// Export singleton instance
export const performanceSettings = new PerformanceSettingsManager();

// Initialize on module load
if (typeof window !== 'undefined') {
  performanceSettings.initialize();
} 