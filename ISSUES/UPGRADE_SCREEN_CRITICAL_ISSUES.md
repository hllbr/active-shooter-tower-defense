# 🚨 UpgradeScreen Modularization - Critical Issues

## Priority: CRITICAL ⚠️
**Status**: Needs immediate attention before production
**Component**: `src/components/game/UpgradeScreen/`

---

## 🔥 Issue #1: Store Hook Duplication & Performance Risk
**Severity**: HIGH  
**Type**: Performance & Architecture

### Problem
Multiple components are directly accessing the same store values independently:

**UpgradeScreen.tsx**:
```typescript
const gold = useGameStore((s) => s.gold);
```

**UpgradeTabContent.tsx**:
```typescript
const bulletLevel = useGameStore((s) => s.bulletLevel);
const discountMultiplier = useGameStore((s) => s.discountMultiplier);
```

### Impact
- **Prop drilling eliminated BUT created multiple store subscriptions**
- Each component re-renders independently when store changes
- Performance degradation with frequent store updates
- Potential race conditions between components

### Scenarios That Will Break:
1. Rapid gold changes during purchases → Multiple re-renders
2. Quick tab switches → Unnecessary store calls
3. Large number of upgrade interactions → Performance bottleneck

### Solution Required
- Implement Context provider or
- Use single store subscription in parent component
- Pass values as props to child components

---

## 🔥 Issue #2: Missing Error Boundaries
**Severity**: HIGH  
**Type**: Runtime Safety

### Problem
No error boundaries around sub-components. If any upgrade component fails:

### Scenarios That Will Break:
1. `DiceRoller` import fails → Entire screen crashes
2. Store connection lost → White screen of death
3. Invalid `discountMultiplier` value → Math.round() exception

### Impact
- Complete UpgradeScreen component failure
- No graceful degradation
- Poor user experience

### Solution Required
Add error boundaries around:
- `<DiceSystemSection />`
- `<UpgradeTabContent />`
- Individual upgrade components

---

## 🔥 Issue #3: Tab State Persistence Issue
**Severity**: MEDIUM-HIGH  
**Type**: UX & State Management

### Problem
`activeTab` state is local to UpgradeScreen. When component remounts:

### Scenarios That Will Break:
1. User navigates away and back → Always starts at 'dice' tab
2. Store update triggers remount → Loses current tab
3. Parent component re-renders → Tab selection lost

### Impact
- Poor user experience
- Lost context during gameplay
- Confusion when returning to upgrade screen

### Solution Required
- Store tab state in global store or
- Use localStorage for tab persistence or
- Add tab state to URL parameters

---

## 🔥 Issue #4: Hardcoded Import Paths Risk
**Severity**: MEDIUM  
**Type**: Maintainability

### Problem
All sub-components use relative paths:
```typescript
import { useGameStore } from '../../../models/store';
import { DiceRoller } from '../upgrades/DiceRoller';
```

### Scenarios That Will Break:
1. Folder restructure → All imports break
2. Store location change → Multiple files need updates
3. Upgrade components move → Import path errors

### Impact
- High maintenance cost
- Fragile architecture
- Difficult refactoring

### Solution Required
- Use absolute imports from src
- Create barrel exports for common paths
- Implement path mapping in tsconfig

---

## 🔥 Issue #5: Type Safety Gaps
**Severity**: MEDIUM  
**Type**: Type Safety

### Problem
Several components lack proper type guards:

**DiceSystemSection.tsx**:
```typescript
// discountMultiplier could be undefined/null
const getDiscountMessage = (): string => {
  if (discountMultiplier === 0) { // What if undefined?
```

**UpgradeTabContent.tsx**:
```typescript
// bulletLevel could be undefined
{bulletLevel >= GAME_CONSTANTS.BULLET_TYPES.length && <DefenseUpgrades />}
```

### Impact
- Runtime TypeScript errors
- Undefined behavior
- Potential crashes

### Solution Required
- Add proper type guards
- Use optional chaining
- Define default values for all store selectors 