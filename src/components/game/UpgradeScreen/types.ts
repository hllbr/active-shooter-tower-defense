export type TabType = 'dice' | 'core' | 'packages' | 'advanced';

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

// UpgradeScreen props - Bu component herhangi bir prop almıyor, store kullanıyor
export type UpgradeScreenProps = Record<string, never>;

export interface TabNavigationProps {
  tabs: TabConfig[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export interface TabContentProps {
  activeTab: TabType;
}

export interface HeaderProps {
  gold: number;
}

export interface FooterProps {
  onContinue: () => void;
}

export interface DiceSystemSectionProps {
  discountMultiplier: number;
} 