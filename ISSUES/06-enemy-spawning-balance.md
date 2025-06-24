# 🌊 Düşman Spawning Dengesizliği

## 📝 Problem Açıklaması
Sürekli spawning sistemi dengeli değil. Spawn rate'ler wave'lere göre ayarlanmamış ve oyun zorluk eğrisi tutarsız.

## 🔍 Mevcut Durum
- **Konum**: `src/logic/EnemySpawner.ts` - `startContinuousSpawning` fonksiyonu
- **Problem**: Sabit `ENEMY_SPAWN_RATE` kullanılıyor
- **Etki**: Zorluk artışı linear ve öngörülebilir

## 📊 Spawn Rate Sorunları

### 1. **Wave Bağımsız Spawning**
- Tüm wave'lerde aynı spawn rate
- Erken wave'ler çok kolay
- Sonraki wave'lar aniden çok zor

### 2. **Düşman Çeşitliliği Eksikliği**  
- Spawn pattern'ler tekrarlayıcı
- Mix enemy types yok
- Boss spawning inconsistent

### 3. **Resource Management**
- Spawn timing altın economy'yi etkilemiyor
- Enemy value vs spawn rate dengesiz

## 💡 Önerilen Çözümler

### 1. **Dynamic Spawn Rate System**
```typescript
interface WaveSpawnConfig {
  baseSpawnRate: number;
  spawnRateMultiplier: number;
  maxEnemiesPerWave: number;
  enemyTypes: EnemyType[];
  bossSpawnChance: number;
}

const waveConfigs: WaveSpawnConfig[] = [
  // Wave 1-5: Easy
  { baseSpawnRate: 2000, spawnRateMultiplier: 1.0, ... },
  // Wave 6-10: Medium  
  { baseSpawnRate: 1500, spawnRateMultiplier: 1.2, ... },
  // Wave 11+: Hard
  { baseSpawnRate: 1000, spawnRateMultiplier: 1.5, ... },
];
```

### 2. **Intelligent Enemy Mixing**
- Early wave: 80% basic, 20% medium
- Mid wave: 50% basic, 30% medium, 20% advanced
- Late wave: 20% basic, 40% medium, 40% advanced

### 3. **Adaptive Difficulty**
- Player performance tracking
- Dynamic spawn adjustment
- Rage quit prevention

## 🎯 Hedef Zorluk Eğrisi

```
Zorluk
  ↑
  |     ____----
  |   __/
  | _/
  |/
  +----------→ Wave
   1  5  10 15 20
```

## 🛠️ Implementasyon Detayları

### Wave-based Spawning
```typescript
const getSpawnConfig = (waveNumber: number): WaveSpawnConfig => {
  if (waveNumber <= 5) return easyConfig;
  if (waveNumber <= 10) return mediumConfig;
  if (waveNumber <= 15) return hardConfig;
  return extremeConfig;
};
```

### Spawn Timing
```typescript
const calculateSpawnDelay = (waveNumber: number, enemyCount: number) => {
  const baseDelay = getSpawnConfig(waveNumber).baseSpawnRate;
  const scaling = Math.pow(0.95, waveNumber); // Exponential decrease
  return baseDelay * scaling;
};
```

## 📈 Success Metrics
- [ ] Smooth difficulty progression
- [ ] Wave completion rate %70-80
- [ ] Player engagement retention
- [ ] Balanced risk/reward

## 🏷️ Labels
`gameplay`, `balancing`, `enemy-ai`, `difficulty`

## ⚖️ Priority
**HIGH** - Oyun deneyiminin temel taşı 