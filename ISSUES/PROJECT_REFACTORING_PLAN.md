# 🗂️ PROJE KLASÖR YAPISI REFAKTOR PLANI

## 🎯 Amaç
Proje dosya ve klasör yapısını, SOLID prensiplerine ve modern yazılım mimarisi standartlarına uygun şekilde sadeleştirmek, alt parçalara ayırmak ve sürdürülebilirliği artırmak. Kodlara dokunulmayacak, sadece dosya ve klasörler taşınacaktır.

---

## 1. Mevcut Yapı Özeti
- **src/components/**: UI ve oyun ekranı bileşenleri (GameBoard, TowerSpot, UpgradeScreen, vb.)
- **src/logic/**: Oyun mantığı, sistemler, yöneticiler, testler
- **src/config/**: Oyun konfigürasyonları, ekonomi, başarımlar, dalga kuralları
- **src/models/**: Tipler, store, state
- **src/utils/**: Yardımcı fonksiyonlar, sabitler, ses yönetimi
- **public/sounds/**: Ses dosyaları

### Tespit Edilen Sorunlar
- Bazı klasörler çok büyük ve alt sistemlere bölünebilir.
- Test dosyaları, ana mantıkla iç içe.
- UI ile mantık katmanları net ayrılmamış.
- Yardımcı fonksiyonlar ve sabitler dağınık.
- Oyun sistemleri tek bir mantık klasöründe karışık.

---

## 2. Önerilen Yeni Klasörleme

### A. Ana Klasörler
- **src/ui/** → Tüm saf UI ve görsel bileşenler
- **src/game-systems/** → Oyun içi sistemler (ekonomi, enerji, dalga, düşman, kule, efekt, görev, başarımlar, vb.)
- **src/config/** → Sadece konfigürasyon ve sabitler
- **src/models/** → Tipler, store, state
- **src/utils/** → Genel yardımcılar, formatlayıcılar, ses yöneticisi
- **src/tests/** → Tüm test ve diagnostic dosyaları
- **public/assets/sounds/** → Ses dosyaları

### B. Alt Klasörleme ve Taşıma Detayları

#### 1. `src/components/` → `src/ui/`
- GameBoard, TowerSpot, UpgradeScreen ve diğer UI bileşenleri `src/ui/` altına taşınacak.
- Her ana UI modülü kendi alt klasöründe olacak (örn. `src/ui/GameBoard/`).

#### 2. `src/logic/` → `src/game-systems/`
- Oyun mantığı ve sistemleri, işlevlerine göre alt klasörlere ayrılacak:
  - enemy-system/
  - tower-system/
  - energy-system/
  - economy-system/
  - wave-system/
  - effect-system/
  - achievement-system/
  - mission-system/
  - memory-system/
  - spawn-system/
  - state-optimization/
- Her sistemin kendi yöneticisi, yardımcıları ve tipleri kendi klasöründe olacak.

#### 3. `src/logic/ButtonTestDiagnostic/` ve test dosyaları → `src/tests/`
- Tüm test ve diagnostic dosyaları ayrı bir klasöre taşınacak.

#### 4. `src/utils/` ve `src/config/`
- `src/utils/` sadeleştirilecek, sadece genel yardımcılar ve ses yöneticisi kalacak.
- `src/config/` sadece konfigürasyon ve sabitler için olacak.

#### 5. `public/sounds/` → `public/assets/sounds/`
- Ses dosyaları `assets` altına alınacak.

---

## 3. Taşıma Planı (Adım Adım)

1. **UI Bileşenlerini Taşı**: `src/components/` altındaki tüm UI dosyalarını `src/ui/` altına taşı.
2. **Oyun Sistemlerini Ayır**: `src/logic/` altındaki sistemleri işlevlerine göre `src/game-systems/` altına taşı ve alt klasörlere böl.
3. **Testleri Ayır**: Tüm test ve diagnostic dosyalarını `src/tests/` altına taşı.
4. **Yardımcıları ve Konfigürasyonları Düzenle**: `src/utils/` ve `src/config/` sadeleştir, dosyaları uygun yerlere taşı.
5. **Ses Dosyalarını Taşı**: `public/sounds/` içeriğini `public/assets/sounds/` altına taşı.
6. **Gerekli README ve açıklama dosyalarını ekle**: Her ana klasöre kısa açıklama ekle.

---

## 4. Notlar ve Açıklamalar
- Kodlara kesinlikle dokunulmayacak, sadece dosya ve klasör taşımaları yapılacak.
- Her taşıma işlemi sonrası bu dosya güncellenecek.
- Gerekirse yeni alt klasörler ve README dosyaları ile açıklamalar eklenecek.

---

**Bu plan, proje sürdürülebilirliğini ve okunabilirliğini artırmak için hazırlanmıştır. Her adımda güncellenerek living document olarak tutulacaktır.** 