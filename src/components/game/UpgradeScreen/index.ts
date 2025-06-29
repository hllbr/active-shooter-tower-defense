// Main UpgradeScreen component
export { UpgradeScreen } from './UpgradeScreen';

// Sub-components
export { UpgradeHeader } from './UpgradeHeader';
export { UpgradeTabNavigation } from './UpgradeTabNavigation';
export { UpgradeTabContent } from './UpgradeTabContent';
export { UpgradeFooter } from './UpgradeFooter';
export { DiceSystemSection } from './DiceSystemSection';
export { DiscountStatusSection } from './DiscountStatusSection';
export { DiscountCategoryCard } from './DiscountCategoryCard';
export { DiceSystemDescription } from './DiceSystemDescription';

// Footer Sub-components  
export { ContinueButton } from './ContinueButton';
export { FooterWrapper } from './FooterWrapper';
export { FooterAnimations } from './FooterAnimations';

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
  headerStyles,
  tabStyles,
  diceSystemStyles,
  discountStyles,
  footerStyles,
  getTabButtonStyle,
  getPriorityBadgeStyle,
  getDiscountStatusStyle,
  getDiscountStatusTitleStyle
} from './styles'; 