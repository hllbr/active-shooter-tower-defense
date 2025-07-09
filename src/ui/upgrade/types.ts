export type TabType = 'dice' | 'core' | 'packages' | 'advanced' | 'weather';

export interface TabConfig {
  id: TabType;
  name: string;
  color: string;
  priority?: string;
}

export interface DiscountCategory {
  name: string;
  color: string;
  description: string;
}

// Component props - Sadece gerekli olanlar kaldı
export interface TabContentProps {
  activeTab: TabType;
}

export interface DiceSystemSectionProps {
  discountMultiplier: number;
}

// Missing type exports
export interface UpgradeScreenProps {
  onContinue: () => void;
}

export interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export type HeaderProps = Record<string, unknown>;

export interface FooterProps {
  onContinue: () => void;
} 