# 🔊 Ses Sistemi - Cooldown Özelliği

## Sorun
Oyunda sesler çok sık tekrar ediyordu ve birbirine giriyordu. Bu durum oyun deneyimini bozuyordu.

## Çözüm
Ses cooldown sistemi eklendi. Her ses için belirli cooldown süreleri tanımlandı ve sesler bu süre geçmeden tekrar çalınmıyor.

## Cooldown Süreleri

### Çok Sık Çalınan UI Sesleri (Kısa Cooldown)
- `click`: 50ms
- `hover`: 100ms  
- `error`: 200ms

### Orta Sıklıkta Çalınan Sesler (Orta Cooldown)
- `coin-collect`: 150ms
- `gold-drop`: 200ms
- `lock-break`: 300ms
- `dice-roll`: 400ms
- `pickup-common`: 250ms
- `pickup-rare`: 300ms
- `notification`: 500ms
- `countdown-beep`: 800ms

### Loot Sesleri (Kısa Cooldown - Hızlı Toplamalar İçin)
- `loot-common`: 100ms
- `loot-rare`: 150ms
- `loot-epic`: 200ms
- `loot-legendary`: 250ms

### Oyun Aksiyonu Sesleri (Orta Cooldown)
- `explosion-large`: 200ms
- `explosion-small`: 150ms
- `tower-attack-*`: 80-300ms
- `freeze-effect`: 400ms
- `slow-effect`: 400ms
- `shield-activate`: 500ms
- `shield-break`: 600ms
- `energy-recharge`: 300ms

### Kule Sesleri (Uzun Cooldown)
- `tower-create-sound`: 400ms
- `tower-levelup-sound`: 500ms
- `tower-destroy`: 600ms
- `tower-repair`: 400ms

### Boss Sesleri (Uzun Cooldown)
- `boss-bombing`: 800ms
- `boss-charge`: 1000ms
- `boss-defeat`: 2000ms
- `boss-entrance`: 3000ms
- `boss-ground-slam`: 600ms
- `boss-missile`: 400ms
- `boss-phase-transition`: 2000ms
- `boss-reality-tear`: 1500ms
- `boss-spawn-minions`: 800ms

### Özel Sesler (Çok Uzun Cooldown)
- `gameover`: 3000ms
- `levelupwav`: 2000ms
- `victory-fanfare`: 3000ms
- `wave-complete`: 2000ms
- `defeat-heavy`: 1500ms

### Ambient Sesler (Uzun Cooldown)
- `ambient-battle`: 5000ms
- `ambient-wind`: 8000ms

### Varsayılan Cooldown
- Tanımlanmamış sesler: 200ms

## Debug Fonksiyonları

### Konsol Komutları
```javascript
// Aktif cooldown'ları göster
window.debugSoundCooldowns();

// Ses kategorilerini göster
window.debugSoundCategories();

// Tüm cooldown'ları sıfırla
window.resetSoundCooldowns();
```

## Özellikler

### Otomatik Cooldown Kontrolü
- Her ses çalınmadan önce cooldown kontrolü yapılır
- Cooldown süresi dolmamışsa ses çalınmaz
- Debug modunda engellenen sesler konsola loglanır

### Ses Başarı Takibi
- Ses başarıyla çalındığında cooldown kaydedilir
- Ses çalınamazsa cooldown kaydedilmez
- Debug modunda başarılı/başarısız ses çalma durumları loglanır

### Temizleme
- `clearSoundCache()` çağrıldığında tüm cooldown'lar temizlenir
- Oyun sıfırlandığında cooldown'lar sıfırlanır

## Kullanım

Ses çalma fonksiyonları eskisi gibi çalışır:

```typescript
import { playSound, playDiceRollSound } from '../utils/sound';

// Normal ses çalma
playSound('coin-collect');

// Contextual ses çalma
playDiceRollSound();
```

Cooldown sistemi otomatik olarak devreye girer ve ses spam'ini önler.

## Debug Modu

`GAME_CONSTANTS.DEBUG_MODE` açıkken:
- Engellenen sesler konsola loglanır
- Başarılı ses çalma durumları loglanır
- Başarısız ses çalma durumları loglanır

Bu sayede ses sisteminin nasıl çalıştığını takip edebilirsiniz. 