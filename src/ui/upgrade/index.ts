/**
 * Upgrade System Index
 * Exports all upgrade-related components and utilities
 */

// Main components
export { UpgradeScreen } from './UpgradeScreen';
export { UpgradeTabNavigation } from './UpgradeTabNavigation';
export { UpgradeTabContent } from './UpgradeTabContent';
export { ContinueButton } from './ContinueButton';

// Header components
export { UpgradeHeader } from './Header/UpgradeHeader';

// Footer components
export { UpgradeFooter } from './Footer/UpgradeFooter';
export { FooterWrapper } from './Footer/FooterWrapper';
export { FooterAnimations } from './Footer/FooterAnimations';

// Dice System components
export { DiceSystemSection } from './DiceSystem/DiceSystemSection';
export { DiceSystemDescription } from './DiceSystem/DiceSystemDescription';

// Discount components
export { DiscountStatusSection } from './Discount/DiscountStatusSection';
export { DiscountCategoryCard } from './Discount/DiscountCategoryCard';

// Types
export type { TabType, TabConfig, DiscountCategory, UpgradeScreenProps, TabNavigationProps, TabContentProps, HeaderProps, FooterProps, DiceSystemSectionProps } from './types';

// Styles - direct imports to avoid circular dependencies
export { upgradeScreenStyles } from './styles';
export { headerStyles } from './Header/headerStyles';
export { tabStyles } from './tabStyles';
export { diceSystemStyles } from './DiceSystem/diceSystemStyles';
export { discountStyles } from './Discount/discountStyles';
export { footerStyles } from './Footer/footerStyles'; 