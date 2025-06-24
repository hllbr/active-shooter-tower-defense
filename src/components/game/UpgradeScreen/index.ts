// Main UpgradeScreen component
export { UpgradeScreen } from './UpgradeScreen';

// Sub-components
export { UpgradeHeader } from './UpgradeHeader';
export { UpgradeTabNavigation } from './UpgradeTabNavigation';
export { UpgradeTabContent } from './UpgradeTabContent';
export { UpgradeFooter } from './UpgradeFooter';
export { DiceSystemSection } from './DiceSystemSection';

// Types
export type {
  TabType,
  TabConfig,
  DiscountCategory,
  UpgradeScreenProps,
  TabNavigationProps,
  TabContentProps,
  HeaderProps,
  FooterProps,
  DiceSystemSectionProps
} from './types';

// Styles
export {
  upgradeScreenStyles,
  getTabButtonStyle,
  getPriorityBadgeStyle,
  getDiscountStatusStyle,
  getDiscountStatusTitleStyle
} from './styles'; 