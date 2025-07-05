/**
 * Unified UI Text Constants
 * Standardized UI texts for consistency across the application
 * Issue #51: CRITICAL: Inconsistent UI Language Chaos
 */

export const UI_TEXTS = {
  // Button Texts - Standardized
  BUTTONS: {
    UPGRADE: '⬆️ Yükselt',
    PURCHASE: '💰 Satın Al',
    UNLOCK: '🔓 Aç',
    MAXED: '✅ Tamamlandı',
    LOCKED: '🔒 Kilitli',
    INSUFFICIENT: '❌ Yetersiz Altın',
    INSUFFICIENT_ENERGY: '❌ Yetersiz Enerji',
    CONTINUE: '▶️ Devam Et',
    DICE_ROLL: '🎲 Zar At',
    START_WAVE: '🌊 Dalgayı Başlat',
    PAUSE: '⏸️ Duraklat',
    RESUME: '▶️ Devam Et',
    RESTART: '🔄 Yeniden Başlat',
    BACK: '⬅️ Geri',
    CLOSE: '❌ Kapat',
    CONFIRM: '✅ Onayla',
    CANCEL: '❌ İptal'
  },

  // Status Messages - Standardized
  STATUS: {
    SUCCESS: '✅ Başarılı!',
    ERROR: '❌ Hata!',
    WARNING: '⚠️ Uyarı!',
    INFO: 'ℹ️ Bilgi:',
    LOADING: '⏳ Yükleniyor...',
    COMPLETED: '✅ Tamamlandı',
    IN_PROGRESS: '🔄 Devam Ediyor',
    PAUSED: '⏸️ Duraklatıldı',
    FAILED: '❌ Başarısız',
    READY: '✅ Hazır'
  },

  // Currency Display - Standardized
  CURRENCY: {
    GOLD: 'Altın',
    GOLD_ICON: '💰',
    ENERGY: 'Enerji',
    ENERGY_ICON: '⚡',
    FORMAT: (amount: number) => `${amount.toLocaleString()} 💰`,
    COST_DISPLAY: (cost: number) => `${cost.toLocaleString()} 💰`,
    INSUFFICIENT_FUNDS: 'Yetersiz Altın',
    INSUFFICIENT_ENERGY: 'Yetersiz Enerji'
  },

  // Wave Terminology - Standardized (Turkish)
  WAVE: {
    SINGLE: (n: number) => `Dalga ${n}`,
    RANGE: (min: number, max: number) => `Dalga ${min}-${max}`,
    PLUS: (min: number) => `Dalga ${min}+`,
    CURRENT: (n: number) => `Mevcut Dalga: ${n}`,
    NEXT: (n: number) => `Sonraki Dalga: ${n}`,
    COMPLETED: (n: number) => `${n} Dalga Tamamlandı`,
    PROGRESS: (current: number, total: number) => `Dalga ${current}/${total}`,
    INDICATOR: (n: number) => `🌊 Dalga ${n}`,
    PREP: 'Dalga Hazırlığı',
    START: 'Dalgayı Başlat'
  },

  // Tower Actions - Standardized
  TOWER: {
    BUILD: 'Kule İnşa Et',
    UPGRADE: 'Kule Yükselt',
    SELL: 'Kule Sat',
    REPAIR: 'Kule Onar',
    MOVE: 'Kule Taşı',
    INFO: 'Kule Bilgisi',
    UNLOCK_SLOT: 'Slot Aç',
    SLOT_LOCKED: 'Slot Kilitli',
    SLOT_UNLOCKED: 'Slot Açık',
    MAX_LEVEL: 'Maksimum Seviye',
    LEVEL: (n: number) => `Seviye ${n}`
  },

  // Upgrade Categories - Standardized
  UPGRADES: {
    FIRE: 'Ateş Yükseltmeleri',
    SHIELD: 'Kalkan Yükseltmeleri',
    ENERGY: 'Enerji Yükseltmeleri',
    DEFENSE: 'Savunma Yükseltmeleri',
    ECONOMY: 'Ekonomi Yükseltmeleri',
    ACTIONS: 'Aksiyon Yükseltmeleri',
    PACKAGES: 'Paket Yükseltmeleri',
    ELITE: 'Elit Yükseltmeleri',
    WALL: 'Duvar Yükseltmeleri',
    MINE: 'Mayın Yükseltmeleri'
  },

  // Game States - Standardized
  GAME: {
    PREPARING: 'Hazırlanıyor...',
    ACTIVE: 'Oyun Aktif',
    PAUSED: 'Duraklatıldı',
    GAME_OVER: 'Oyun Bitti',
    VICTORY: 'Zafer!',
    DEFEAT: 'Yenilgi!',
    LOADING: 'Yükleniyor...',
    READY: 'Hazır'
  },

  // Error Messages - Standardized
  ERRORS: {
    INSUFFICIENT_GOLD: 'Yeterli altın yok!',
    INSUFFICIENT_ENERGY: 'Yeterli enerji yok!',
    INVALID_PLACEMENT: 'Geçersiz yerleştirme!',
    SLOT_LOCKED: 'Slot kilitli!',
    MAX_LEVEL_REACHED: 'Maksimum seviye ulaşıldı!',
    NETWORK_ERROR: 'Ağ hatası!',
    SAVE_ERROR: 'Kayıt hatası!',
    LOAD_ERROR: 'Yükleme hatası!',
    GENERIC_ERROR: 'Bir hata oluştu!'
  },

  // Accessibility - Screen Reader Friendly
  ARIA_LABELS: {
    UPGRADE_BUTTON: (name: string, cost: number) => 
      `${name} yükseltmesi. Maliyet: ${cost} altın`,
    MAX_LEVEL: (name: string) => 
      `${name} maksimum seviyeye ulaştı`,
    LOCKED: (requirement: string) => 
      `Kilitli. Gereksinim: ${requirement}`,
    PURCHASE_BUTTON: (name: string, cost: number) => 
      `${name} satın al. Fiyat: ${cost} altın`,
    TOWER_SLOT: (level: number, type: string) => 
      `${type} kulesi, seviye ${level}`,
    DICE_BUTTON: (remaining: number) => 
      `Zar at. Kalan hak: ${remaining}`,
    WAVE_INDICATOR: (current: number, total: number) => 
      `Dalga ${current} / ${total}`,
    GOLD_DISPLAY: (amount: number) => 
      `Mevcut altın: ${amount.toLocaleString()}`,
    ENERGY_DISPLAY: (current: number, max: number) => 
      `Enerji: ${current} / ${max}`
  },

  // Notifications - Standardized
  NOTIFICATIONS: {
    UPGRADE_SUCCESS: (item: string) => `${item} başarıyla yükseltildi!`,
    PURCHASE_SUCCESS: (item: string) => `${item} başarıyla satın alındı!`,
    UNLOCK_SUCCESS: (item: string) => `${item} başarıyla açıldı!`,
    CHALLENGE_COMPLETED: (name: string) => `Görev tamamlandı: ${name}`,
    WAVE_COMPLETED: (wave: number) => `Dalga ${wave} tamamlandı!`,
    LEVEL_UP: (item: string, level: number) => `${item} seviye ${level}'e yükseltildi!`,
    ACHIEVEMENT_UNLOCKED: (name: string) => `Başarım açıldı: ${name}`,
    SAVE_SUCCESS: 'Oyun kaydedildi!',
    LOAD_SUCCESS: 'Oyun yüklendi!'
  }
} as const;

// Helper Functions for Unified Text Display
export const formatCurrency = (amount: number): string => {
  return UI_TEXTS.CURRENCY.FORMAT(amount);
};

export const formatWave = (wave: number): string => {
  return UI_TEXTS.WAVE.SINGLE(wave);
};

export const formatWaveRange = (min: number, max?: number): string => {
  return max ? UI_TEXTS.WAVE.RANGE(min, max) : UI_TEXTS.WAVE.PLUS(min);
};

export const getUnifiedButtonText = (
  isMaxed: boolean,
  canAfford: boolean,
  isLocked: boolean,
  type: 'upgrade' | 'purchase' | 'unlock' | 'package' = 'upgrade'
): string => {
  if (isMaxed) return UI_TEXTS.BUTTONS.MAXED;
  if (isLocked) return UI_TEXTS.BUTTONS.LOCKED;
  if (!canAfford) return UI_TEXTS.BUTTONS.INSUFFICIENT;
  
  switch (type) {
    case 'upgrade':
      return UI_TEXTS.BUTTONS.UPGRADE;
    case 'purchase':
      return UI_TEXTS.BUTTONS.PURCHASE;
    case 'unlock':
      return UI_TEXTS.BUTTONS.UNLOCK;
    case 'package':
      return UI_TEXTS.BUTTONS.PURCHASE;
    default:
      return UI_TEXTS.BUTTONS.PURCHASE;
  }
};

export const getAffordabilityColor = (cost: number, gold: number): string => {
  if (gold >= cost) return '#4ade80'; // Green - can afford
  if (gold >= cost * 0.8) return '#fbbf24'; // Yellow - almost can afford
  return '#ef4444'; // Red - cannot afford
};

// Type definitions for better TypeScript support
export type UITextKey = keyof typeof UI_TEXTS;
export type ButtonTextKey = keyof typeof UI_TEXTS.BUTTONS;
export type StatusTextKey = keyof typeof UI_TEXTS.STATUS;
export type CurrencyTextKey = keyof typeof UI_TEXTS.CURRENCY;
export type WaveTextKey = keyof typeof UI_TEXTS.WAVE; 