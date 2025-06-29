# Type-Safe Upgrade System

Bu dizin, oyunun upgrade sistemini modüler ve type-safe bir yapıda organize eder.

## Modüler Yapı

### Ana Componentler
- **`UpgradeCard.tsx`** - Temel upgrade kart component'i
- **`FireUpgrades.tsx`** - Ateş upgrade'leri için container
- **`EnergyUpgrades.tsx`** - Enerji upgrade'leri için container

### Alt Componentler
- **`DiscountBadge.tsx`** - İndirim badge'i
- **`UpgradeCardHeader.tsx`** - Kart başlığı (ikon, isim, seviye)
- **`UpgradeCardContent.tsx`** - Kart açıklaması ve ek bilgiler
- **`UpgradeCardFooter.tsx`** - Fiyat ve satın alma butonu

### Utility ve Type Dosyaları
- **`types.ts`** - Tüm interface ve type tanımları
- **`utils.ts`** - Type-safe utility fonksiyonları

## Type Güvenliği

### Temel Interface'ler
```typescript
interface UpgradeCardData {
  name: string;
  description: string;
  cost: number;
  currentLevel: number;
  maxLevel: number;
  icon: string;
  color: string;
  additionalInfo?: string;
}

interface BulletTypeData {
  name: string;
  color: string;
  damageMultiplier: number;
  fireRateMultiplier: number;
  speedMultiplier: number;
  freezeDuration?: number;
}
```

### İndirim Sistemi
```typescript
interface DiscountData {
  diceResult: number | null;
  discountMultiplier: number;
}

const DICE_DISCOUNT_RATES: DiscountRates = {
  6: 0.5,  // 50% indirim
  5: 0.7,  // 30% indirim
  4: 0.85  // 15% indirim
} as const;
```

## Type-Safe Utility Fonksiyonlar

### Cost Calculation
```typescript
function calculateFinalCost(
  originalCost: number,
  discountData: DiscountData
): CostCalculation
```

### State Management
```typescript
function calculateUpgradeStates(
  currentLevel: number,
  maxLevel: number,
  finalCost: number,
  gold: number
): UpgradeStates
```

### Validation
```typescript
function validateDiscountData(discountData: DiscountData): DiscountData
```

## Avantajlar

✅ **Type Safety** - Compile-time error detection
✅ **Modülerlik** - Her component tek bir sorumluluğa sahip
✅ **Yeniden Kullanılabilirlik** - Alt componentler başka yerlerde kullanılabilir
✅ **Test Edilebilirlik** - Her parça ayrı ayrı test edilebilir
✅ **Bakım Kolaylığı** - Değişiklik yapmak kolay ve güvenli
✅ **IntelliSense** - IDE desteği tam olarak çalışır

## Kullanım Örneği

```typescript
<UpgradeCard
  name="Ejderha Nefesi"
  description="Güçlü ateş mermi sistemi"
  cost={500}
  currentLevel={1}
  maxLevel={2}
  onUpgrade={() => handleUpgrade()}
  icon="🔥"
  color="#ff4400"
  gold={1000}
  diceResult={6}
  discountMultiplier={1.2}
/>
```

Bu sistem tamamen type-safe olup, hiçbir `any` veya `undefined` kullanmadan tasarlanmıştır. 