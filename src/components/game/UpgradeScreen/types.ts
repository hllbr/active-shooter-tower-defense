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

// Component props - Sadece gerekli olanlar kaldı
export interface TabContentProps {
  activeTab: TabType;
}

export interface DiceSystemSectionProps {
  discountMultiplier: number;
} 