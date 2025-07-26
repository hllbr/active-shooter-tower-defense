import { validatePackagePurchase } from '../../../security/SecurityEnhancements';


export interface PackageDefinition {
  id: string;
  name: string;
  description: string;
  cost: number;
  waveRequirement: { min: number; max?: number };
  icon: string;
  color: string;
  onPurchase: (addEnergy: (amount: number) => void, addAction?: (amount: number) => void) => void;
  benefits: string[];
  isElite?: boolean;
  purchaseLimit?: number;
}

// Secure package purchase wrapper
export const securePackagePurchase = (
  packageId: string,
  cost: number,
  maxAllowed: number,
  onPurchase: () => void
): boolean => {
  // Validate package purchase
  const validation = validatePackagePurchase(packageId, cost, maxAllowed);
  if (!validation.valid) {
    return false;
  }
  
  // Execute purchase
  onPurchase();
  return true;
};

export const PACKAGE_DEFINITIONS: PackageDefinition[] = [
  {
    id: 'starter_warrior',
    name: 'Başlangıç Savaşçısı',
    description: 'Oyuna güçlü başlamak için temel kombo paketi. Hızla güçlen ve ilk wave\'leri kolayca geç.',
    cost: 120,
    waveRequirement: { min: 1, max: 15 },
    icon: '🏃‍♂️',
    color: '#22c55e',
    onPurchase: (addEnergy, addAction) => {
      addEnergy(30);
      addAction?.(2);
    },
    benefits: [
      '+30 Bonus Enerji (Anında)',
      '+2 Bonus Aksiyon (Bu Wave)',
      'Erken oyun avantajı'
    ],
    isElite: false,
    purchaseLimit: 3
  },
  {
    id: 'economic_power',
    name: 'Ekonomik Güç Paketi',
    description: 'Ekonomini hızla büyütmek için ideal paket. Altın üretimini artır ve gelişim hızını maksimuma çıkar.',
    cost: 200,
    waveRequirement: { min: 5, max: 25 },
    icon: '💰',
    color: '#eab308',
    onPurchase: (addEnergy) => {
      addEnergy(25);
    },
    benefits: [
      '+100 Bonus Altın (Anında)',
      '+25 Bonus Enerji',
      'Ekonomik büyüme ivmesi'
    ],
    isElite: false,
    purchaseLimit: 2
  },
  {
    id: 'war_master',
    name: 'Savaş Ustası Kombosu',
    description: 'Orta seviye savaşlar için optimize edilmiş güçlü yükseltme paketi. Hem saldırı hem savunma.',
    cost: 350,
    waveRequirement: { min: 15, max: 50 },
    icon: '⚔️',
    color: '#ef4444',
    onPurchase: (addEnergy, addAction) => {
      addEnergy(50);
      addAction?.(3);
    },
    benefits: [
      '+50 Bonus Enerji',
      '+3 Bonus Aksiyon',
      'Orta-game güç artışı',
      'Dengeli savaş bonusu'
    ],
    isElite: false,
    purchaseLimit: 2
  },
  {
    id: 'tower_master',
    name: 'Tower Master Paketi',
    description: 'Daha fazla kule yerleştir ve güçlendir. Tower limit artışı ve bonus enerji ile.',
    cost: 500,
    waveRequirement: { min: 20, max: 60 },
    icon: '🏗️',
    color: '#8b5cf6',
    onPurchase: (addEnergy) => {
      addEnergy(40);
    },
    benefits: [
      '+1 Tower Slot (Kalıcı)',
      '+40 Bonus Enerji',
      'İnşaat hızı artışı'
    ],
    isElite: false,
    purchaseLimit: 3
  },
  {
    id: 'elite_commander',
    name: 'Elite Komutan Paketi',
    description: 'İleri seviye savaşçılar için özel tasarlanmış elite bonus paketi. Büyük güç artışları.',
    cost: 750,
    waveRequirement: { min: 40, max: 80 },
    icon: '🎖️',
    color: '#dc2626',
    onPurchase: (addEnergy, addAction) => {
      addEnergy(80);
      addAction?.(5);
    },
    benefits: [
      '+80 Bonus Enerji',
      '+5 Bonus Aksiyon',
      'Elite savaş bonusları',
      'Özel komutan yetkileri'
    ],
    isElite: true,
    purchaseLimit: 2
  },
  {
    id: 'tech_revolution',
    name: 'Teknoloji Devrimi',
    description: 'En son teknoloji ile güçlenmiş sistem. Tüm yükseltmelerde büyük sıçrama.',
    cost: 1000,
    waveRequirement: { min: 50, max: 85 },
    icon: '🚀',
    color: '#06b6d4',
    onPurchase: (addEnergy, addAction) => {
      addEnergy(100);
      addAction?.(6);
    },
    benefits: [
      '+100 Massive Enerji Artışı',
      '+6 Premium Aksiyon',
      'Teknoloji bonusları',
      'Gelişmiş sistem erişimi'
    ],
    isElite: true,
    purchaseLimit: 1
  },
  {
    id: 'legendary_master',
    name: 'Legendary Master Paketi',
    description: 'Son seviye savaşçılar için efsanevi güç paketi. Maksimum bonuslar ve özel yetenekler.',
    cost: 1500,
    waveRequirement: { min: 70 },
    icon: '👑',
    color: '#ffd700',
    onPurchase: (addEnergy, addAction) => {
      addEnergy(150);
      addAction?.(8);
    },
    benefits: [
      '+150 Legendary Enerji',
      '+8 Master Aksiyon',
      'Efsanevi savaş gücü',
      'Özel master yetenekleri',
      'Ultimate power boost'
    ],
    isElite: true,
    purchaseLimit: 2
  },
  {
    id: 'godlike_warrior',
    name: 'Godlike Warrior Ultimate',
    description: 'Tanrısal güç seviyesi. Sadece en elite savaşçılar için. Oyunun en güçlü paketi.',
    cost: 2500,
    waveRequirement: { min: 90 },
    icon: '⚡',
    color: '#9333ea',
    onPurchase: (addEnergy, addAction) => {
      addEnergy(250);
      addAction?.(12);
    },
    benefits: [
      '+250 Godlike Enerji',
      '+12 Divine Aksiyon',
      'Tanrısal güç seviyesi',
      'Ultimate war machine',
      'Legendary status unlock'
    ],
    isElite: true,
    purchaseLimit: 1
  },
  {
    id: 'quick_growth',
    name: 'Hızlı Büyüme Paketi',
    description: 'Erken wave\'lerde hızla güçlenmek isteyenler için özel paket. Sınırlı süre!',
    cost: 80,
    waveRequirement: { min: 1, max: 10 },
    icon: '⚡',
    color: '#f97316',
    onPurchase: (addEnergy, addAction) => {
      addEnergy(40);
      addAction?.(3);
    },
    benefits: [
      '+40 Hızlı Enerji',
      '+3 Hızlı Aksiyon',
      'Erken büyüme bonusu'
    ],
    isElite: false,
    purchaseLimit: 1
  }
]; 