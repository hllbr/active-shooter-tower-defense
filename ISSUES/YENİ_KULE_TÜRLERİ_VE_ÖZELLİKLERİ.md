# 🏰 YENİ KULE TÜRLERİ VE ÖZELLİKLERİ

## 🎯 Amaç
Oyuna stratejik derinlik ve tekrar oynanabilirlik katacak yeni kule türleri ve her birinin kendine özgü özellikleri, yükseltmeleri ve stratejik rollerini tanımlamak.

---

## 🆕 Kule Türleri ve Temel Özellikler

### 1. Topçu Kulesi (Artillery Tower)
- **Rol:** Alan hasarı, kalabalık düşman gruplarına karşı etkili
- **Özellikler:**
  - Yüksek patlama hasarı
  - Yavaş atış hızı
  - Splash damage (çevresel hasar)
- **Yükseltmeler:**
  - Patlama yarıçapı artırma
  - Kritik vuruş şansı
  - Zırh delici mermi
- **Aktif Yetenek:** Hedeflenen alana topçu bombardımanı (cooldown: 30sn)

### 2. Büyücü Kulesi (Mage Tower)
- **Rol:** Alan kontrolü, özel efektler
- **Özellikler:**
  - Zincirleme büyü (birden fazla düşmana sıçrayan hasar)
  - Yavaşlatıcı büyü
  - Enerji hasarı
- **Yükseltmeler:**
  - Zincir sayısı artırma
  - Yavaşlatma süresi uzatma
  - Enerji patlaması
- **Aktif Yetenek:** Tüm düşmanları kısa süreliğine dondurma (cooldown: 40sn)

### 3. Dondurucu Kule (Frost Tower)
- **Rol:** Düşmanları yavaşlatma ve kontrol
- **Özellikler:**
  - Saldırı başına yavaşlatma
  - Buz patlaması
- **Yükseltmeler:**
  - Yavaşlatma oranı artırma
  - Buz patlaması alanı büyütme
- **Aktif Yetenek:** Tüm düşmanları 3 saniye dondur (cooldown: 35sn)

### 4. Keskin Nişancı Kulesi (Sniper Tower)
- **Rol:** Uzun menzilli, tek hedefe yüksek hasar
- **Özellikler:**
  - Çok uzun menzil
  - Kritik vuruş şansı
- **Yükseltmeler:**
  - Kritik hasar artırma
  - Zırh delici mermi
- **Aktif Yetenek:** Tek hedefe anında öldürücü atış (cooldown: 60sn)

### 5. Destek Kulesi (Support Tower)
- **Rol:** Diğer kuleleri güçlendirme, düşmanları zayıflatma
- **Özellikler:**
  - Yakındaki kulelere saldırı hızı/artış bonusu
  - Düşmanlara zayıflatıcı aura
- **Yükseltmeler:**
  - Buff alanı genişletme
  - Buff gücü artırma
- **Aktif Yetenek:** Tüm kulelere 10 saniye boyunca %50 saldırı hızı (cooldown: 45sn)

---

## 🛠️ Teknik Gereksinimler
- Her kule için ayrı prefab/component yapısı
- Kule türü açma durumu (mağaza ile entegre)
- Yükseltme ve yetenek sisteminin genişletilmesi
- Kule başına aktif/pasif yetenek event/handler yapısı
- Kule animasyonları ve efektleri
- Balans ve test için debug modları

---

## 👤 Kullanıcı Akışı
1. Oyuncu mağazadan yeni kule türünü açar.
2. İnşa alanında açılmış kuleler arasından seçim yapar.
3. Kule inşa edilir ve temel özellikleriyle çalışır.
4. Oyun sırasında kule yükseltmeleri ve aktif yetenekler açılır.
5. Oyuncu, stratejisine göre kuleleri yükseltir ve yeteneklerini kullanır.

---

## 📝 Notlar
- Kulelerin dengesi, oyun testleriyle sürekli gözden geçirilecek.
- Her yeni kule, oyunun ilerleyen safhalarında açılabilir olmalı.
- Kule görselleri ve efektleri, her tür için özgün olmalı. 