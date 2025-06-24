# 🎮 Tower Targeting Algoritması İyileştirmesi

## 📝 Problem Açıklaması
Kuleler sadece en yakın düşmanı hedefliyor. Bu durum strateji eksikliği yaratıyor ve oyun deneyimini basitleştiriyor.

## 🔍 Mevcut Durum
- **Konum**: `src/logic/TowerManager.ts` - `getNearestEnemy` fonksiyonu
- **Algoritma**: Basit mesafe hesabı
- **Sonuç**: Verimsiz hedefleme

## 🎯 Önerilen Targeting Sistemleri

### 1. **Priority Based Targeting**
- [ ] **Sağlık Bazlı**: Düşük canli düşmanları öncelikle hedefle
- [ ] **Hız Bazlı**: Hızlı düşmanları öncelikle hedefle
- [ ] **Değer Bazlı**: Yüksek altın veren düşmanları hedefle
- [ ] **Tip Bazlı**: Belirli düşman tiplerini hedefle

### 2. **Kullanıcı Kontrollü Targeting**
- [ ] Kule başına targeting modu seçimi
- [ ] Hotkey ile targeting değiştirme
- [ ] Manual target selection

### 3. **Akıllı Targeting**
- [ ] Threat assessment algorithm
- [ ] Predictive targeting (düşman yolu tahmini)
- [ ] Group targeting (AOE optimizasyonu)

## 🛠️ Teknik Implementasyon

```typescript
enum TargetingMode {
  NEAREST = 'nearest',
  LOWEST_HP = 'lowest_hp',
  FASTEST = 'fastest',
  HIGHEST_VALUE = 'highest_value',
  STRONGEST = 'strongest'
}

interface TargetingOptions {
  mode: TargetingMode;
  range: number;
  priority: EnemyType[];
}
```

## 📊 Expected Benefits
- Daha stratejik oyun deneyimi
- Farklı tower build'leri
- Replay value artışı
- Player engagement iyileşmesi

## 🏷️ Labels
`enhancement`, `gameplay`, `strategy`, `ai`

## ⚖️ Priority
**MEDIUM** - Oyun deneyimini önemli ölçüde iyileştirecek 