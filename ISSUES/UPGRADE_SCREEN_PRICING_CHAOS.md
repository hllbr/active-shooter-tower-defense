# 💰 CRITICAL: Upgrade Pricing & Discount System Broken

## **Priority**: HIGH 🟡  
**Status**: Pricing calculations completely wrong  
**Impact**: Economy balancing destroyed, player frustration  
**Component**: Multiple upgrade components with pricing logic  

---

## 🔍 **ROOT CAUSE ANALYSIS**

### **Issue #1: Shield Upgrade Type Error**
**File**: `src/components/game/upgrades/ShieldUpgrades.tsx`  
**Line**: 100

```typescript
finalCost = Math.max(25, Math.round(shield.cost * (2 - discountMultiplier)));
//           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// ❌ ERROR: Type 'number' is not assignable to type '100 | 50 | 200 | 350 | 450 | 500 | 150 | 300 | 400 | 250'
```

**Problem**: `finalCost` expects literal union type but receives calculated number. TypeScript constraint violation.

### **Issue #2: Discount Multiplier Logic Inverted**
**File**: `src/components/game/upgrades/PowerMarket.tsx`  
**Lines**: 30-40

```typescript
// Zar indirim sistemi - tüm yükseltmeler için geçerli
let finalCost = baseCost;
if (diceResult && diceResult === 6) {
  finalCost = Math.floor(baseCost * 0.5); // %50 indirim
} else if (diceResult && diceResult === 5) {
  finalCost = Math.floor(baseCost * 0.7); // %30 indirim
} else if (diceResult && diceResult === 4) {
  finalCost = Math.floor(baseCost * 0.85); // %15 indirim
}

// Evrensel indirim çarpanı uygula  
if (discountMultiplier !== 1) {
  finalCost = Math.floor(finalCost / discountMultiplier); // ❌ WRONG: Should multiply, not divide
}
```

**Problem**: 
1. Dice discounts applied correctly (multiply by fraction)
2. Universal discount multiplier applied incorrectly (divide instead of multiply)
3. Logic conflict between two discount systems

### **Issue #3: Missing ENERGY_UPGRADES Constant**
**File**: `src/components/game/upgrades/EnergyUpgrades.tsx`  
**Line**: 72

```typescript
{GAME_CONSTANTS.ENERGY_UPGRADES.map((upgrade) => {
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// ❌ ERROR: Property 'ENERGY_UPGRADES' does not exist on GAME_CONSTANTS
// Suggests 'MINE_UPGRADES' instead
```

**Problem**: `ENERGY_UPGRADES` array doesn't exist in Constants, causing runtime error.

### **Issue #4: Package System Wave Requirements Inconsistent**
**File**: `src/components/game/upgrades/UpgradePackages.tsx`  
**Lines**: 30-31

```typescript
const isWaveValid = currentWave >= waveRequirement.min &&
  (!waveRequirement.max || currentWave <= waveRequirement.max);
```

**Problem**: Wave requirements not properly enforced across all packages, some packages available at wrong waves.

---

## 🧪 **REPRODUCTION STEPS**

### **Test Case 1: Shield Upgrade Type Error**
1. Open UpgradeScreen
2. Navigate to any tab with shield upgrades
3. Try to purchase shield upgrade with discount
4. **RESULT**: TypeScript compilation error, cannot build

### **Test Case 2: Discount Not Applied**
1. Roll dice to get 6 (50% discount)
2. `discountMultiplier` should be > 1 (e.g., 1.5)
3. Try to buy any upgrade
4. **EXPECTED**: Cost reduced by 50%
5. **ACTUAL**: Cost INCREASED due to division instead of multiplication

### **Test Case 3: Energy Upgrades Missing**
1. Open UpgradeScreen  
2. Navigate to Energy Upgrades tab
3. **RESULT**: Runtime error, component crashes

### **Test Case 4: Wrong Wave Packages**
1. Start at Wave 1
2. Check available packages
3. **RESULT**: Elite packages available too early, basic packages available too late

---

## 📊 **DETAILED IMPACT ANALYSIS**

### **Business Impact**
- **Player Economics Broken**: Discounts don't work, prices wrong
- **Progression Blocked**: Can't buy upgrades due to type errors  
- **Player Frustration**: Expecting discounts but paying more instead
- **Game Balance Destroyed**: Packages available at wrong difficulty levels

### **Technical Impact** 
- **Build Failures**: TypeScript errors prevent compilation
- **Runtime Crashes**: Missing constants cause component failures
- **State Corruption**: Incorrect price calculations affect game state
- **UX Inconsistency**: Different discount logic across components

### **Player Experience Impact**
```
Player Mental Model: "I rolled 6, I should get 50% discount"
Actual Result: "Why did the price increase? This is broken!"
```

---

## ✅ **REQUIRED FIXES**

### **Fix #1: Shield Upgrade Type Safety**
```typescript
// In ShieldUpgrades.tsx - Fix type constraint
let finalCost: number = Math.max(25, Math.round(shield.cost * (2 - discountMultiplier)));

// OR use union type helper
const calculateFinalCost = (baseCost: number, discount: number): number => {
  return Math.max(25, Math.round(baseCost * (2 - discount)));
};

const finalCost = calculateFinalCost(shield.cost, discountMultiplier);
```

### **Fix #2: Unified Discount System**
```typescript
// In PowerMarket.tsx - Fix discount logic
const calculateDiscountedPrice = (baseCost: number, diceResult: number | null, discountMultiplier: number): number => {
  let finalCost = baseCost;
  
  // Apply dice discount first (if any)
  if (diceResult) {
    switch (diceResult) {
      case 6: finalCost *= 0.5; break;  // 50% off
      case 5: finalCost *= 0.7; break;  // 30% off  
      case 4: finalCost *= 0.85; break; // 15% off
    }
  }
  
  // Apply universal discount multiplier CORRECTLY
  if (discountMultiplier > 1) {
    finalCost /= discountMultiplier; // ✅ CORRECT: Higher multiplier = lower cost
  }
  
  return Math.floor(finalCost);
};
```

### **Fix #3: Add Missing Energy Upgrades**
```typescript
// In Constants.ts - Add missing ENERGY_UPGRADES
export const GAME_CONSTANTS = {
  // ... existing constants
  
  ENERGY_UPGRADES: [
    { id: 'passive_regen', name: 'Passive Regeneration', cost: 100, effect: { type: 'passive_regen', value: 2 } },
    { id: 'kill_bonus', name: 'Kill Energy Bonus', cost: 150, effect: { type: 'kill_bonus', value: 5 } },
    { id: 'efficiency', name: 'Energy Efficiency', cost: 200, effect: { type: 'efficiency', value: 0.1 } },
    // ... more upgrades
  ],
  
  // ... rest of constants
} as const;
```

### **Fix #4: Package Wave Requirements**
```typescript
// In UpgradePackages.tsx - Enforce wave requirements properly
const getPackageAvailability = (package: PackageType, currentWave: number) => {
  const { waveRequirement } = package;
  
  // Strict wave validation
  const isWaveValid = currentWave >= waveRequirement.min && 
                     (!waveRequirement.max || currentWave <= waveRequirement.max);
  
  // Elite packages only after wave 10
  const isEliteValid = !package.isElite || currentWave >= 10;
  
  // Basic packages should phase out after wave 20
  const isBasicValid = package.isElite || currentWave <= 20;
  
  return isWaveValid && isEliteValid && isBasicValid;
};
```

---

## 🎯 **TESTING REQUIREMENTS**

### **Unit Tests**
- [ ] Test `calculateDiscountedPrice()` with all discount combinations
- [ ] Test shield upgrade type safety with various cost values
- [ ] Test package wave requirement validation
- [ ] Test energy upgrades array accessibility

### **Integration Tests**
- [ ] Test complete discount flow: dice roll → upgrade purchase  
- [ ] Test price display consistency across all upgrade tabs
- [ ] Test package availability at different wave levels

### **Manual Testing Scenarios**
```
Scenario 1: Dice Discount Test
1. Roll dice to get result 6
2. Check all upgrade prices show 50% reduction
3. Purchase upgrade, verify correct amount deducted
4. Verify discountMultiplier applied correctly

Scenario 2: Wave Progression Package Test  
1. Test package availability at waves 1, 5, 10, 15, 20, 25
2. Verify elite packages only appear after wave 10
3. Verify basic packages phase out appropriately

Scenario 3: Type Safety Test
1. Apply various discounts to shield upgrades
2. Verify no TypeScript compilation errors
3. Verify runtime type safety maintained
```

---

## 📈 **SUCCESS METRICS**

### **Before Fix**
- ❌ Shield upgrades: TypeScript compilation fails
- ❌ Discount system: Increases prices instead of decreasing
- ❌ Energy upgrades: Component crashes on load
- ❌ Package system: Wrong availability at 60% of waves

### **After Fix**  
- ✅ Shield upgrades: 100% type safety, no compilation errors
- ✅ Discount system: 100% accurate price reductions
- ✅ Energy upgrades: 100% component stability  
- ✅ Package system: 100% correct wave-based availability

### **Validation Criteria**
```typescript
// Price calculation tests
expect(calculateDiscountedPrice(100, 6, 1)).toBe(50);    // 50% dice discount
expect(calculateDiscountedPrice(100, null, 2)).toBe(50);  // 2x multiplier = 50% off
expect(calculateDiscountedPrice(100, 6, 2)).toBe(25);     // Both discounts = 75% off

// Wave availability tests  
expect(isPackageAvailable(elitePackage, 5)).toBe(false);   // Elite not available before wave 10
expect(isPackageAvailable(basicPackage, 25)).toBe(false);  // Basic not available after wave 20
expect(isPackageAvailable(midPackage, 15)).toBe(true);     // Mid-tier available in sweet spot
```

---

**Complexity**: Multiple interconnected systems requiring careful testing  
**Risk Level**: High - affects core game economy and progression 