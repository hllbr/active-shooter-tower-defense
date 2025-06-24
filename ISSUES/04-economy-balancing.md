# 💰 Economy Tower Gelir Oranları Dengeleme

## 📝 Problem Açıklaması
Economy kuleler yeterince altın üretmiyor. Bu durum oyuncuların economy build yapmak yerine sadece attack tower'lara odaklanmasına sebep oluyor.

## 🔍 Mevcut Durum
- **Konum**: `src/config/economy.ts` - `extractorIncome`
- **Problem**: Düşük gelir oranları
- **Etki**: Economy stratejisi viable değil

## 📊 Analiz
- Economy tower maliyeti vs geliri dengesiz
- ROI (Return on Investment) çok düşük
- Late game'de economy tower'lar anlamsız hale geliyor

## 💡 Önerilen Çözümler

### 1. **Seviye Bazlı Gelir Artışı**
```typescript
// Mevcut
const baseIncome = 10;

// Önerilen
const incomeByLevel = [
  10,  // Level 1
  15,  // Level 2  
  25,  // Level 3
  40,  // Level 4
  65,  // Level 5
  100, // Level 6+
];
```

### 2. **Compound Interest Sistemi**
- Multiple economy tower bonus
- Adjacency bonus (yan yana economy tower'lar)
- Synergy effects

### 3. **Risk/Reward Mekanizması**
- Economy tower'lar düşmanlar tarafından hedeflenebilir
- Koruma maliyeti vs gelir dengesi
- Insurance sistemi

## 🎯 Hedef Metrikler
- [ ] Economy tower ROI 10-15 wave içinde break-even
- [ ] Late game viable economy builds
- [ ] %30-40 economy/%60-70 attack optimal dağılım

## 🛠️ Implementasyon Adımları
1. [ ] Mevcut income rates analizi
2. [ ] Yeni income curve tasarımı  
3. [ ] Playtesting ve balancing
4. [ ] Community feedback toplama

## 🏷️ Labels
`economy`, `balancing`, `gameplay`, `strategy`

## ⚖️ Priority
**HIGH** - Oyun stratejisi çeşitliliği için kritik 