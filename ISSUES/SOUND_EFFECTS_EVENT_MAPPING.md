# 🔊 SOUND EFFECTS EVENT MAPPING

## Amaç
Upgrade, zar atma ve kule oluşturma işlemlerinde hangi seslerin çalındığını ve ilgili kod noktalarını dokümante etmek. İleride değişiklik/güncelleme için referans olarak kullanılacaktır.

---

## 🎯 Oyun İçi Ses Olayları ve Kod Noktaları

### 1. Kule Yükseltme, Paket Satın Alma, Duvar/Mayın/Kalkan Yükseltme
- **Çalınan Ses:** `upgrade-purchase`
- **Kod Noktaları:**
  - `src/ui/game/upgrades/UpgradeCard.tsx` → `handleUpgrade`
  - `src/ui/game/upgrades/PackageCard.tsx` → `handlePurchase`
  - `src/ui/game/upgrades/WallUpgrade.tsx` → `handleWallUpgrade`
  - `src/ui/game/upgrades/MineUpgrade.tsx` → `handleMineUpgrade`
  - `src/ui/game/upgrades/ShieldUpgradeCard.tsx` → `handleClick`
- **Kod Satırı:**
  ```ts
  playSound('upgrade-purchase');
  ```

### 2. Zar Atma
- **Çalınan Ses:** `dice-roll`
- **Kod Noktası:**
  - `src/ui/game/upgrades/DiceButton.tsx` → `handleRoll`
- **Kod Satırı:**
  ```ts
  playSound('dice-roll');
  ```

### 3. Kule Oluşturma
- **Çalınan Ses:** `tower-create-sound`
- **Kod Noktası:**
  - `src/ui/TowerSpot/hooks/useTowerSpotLogic.ts` → `handleBuildTower`
- **Kod Satırı:**
  ```ts
  playSound('tower-create-sound');
  ```

---

## Notlar
- Arka plan oyun müziği ve diğer sesler devre dışı bırakılmıştır.
- Sadece yukarıdaki aksiyonlara özel efektler aktif.
- İleride yeni ses efektleri veya event eklenirse bu dosya güncellenecektir.

---

**Bu dosya, ses olaylarının merkezi takibi ve ileride yapılacak güncellemeler için referans olarak kullanılacaktır.** 