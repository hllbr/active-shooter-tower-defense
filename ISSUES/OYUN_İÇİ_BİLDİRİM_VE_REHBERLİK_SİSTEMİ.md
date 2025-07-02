# 🔔 OYUN İÇİ BİLDİRİM VE REHBERLİK SİSTEMİ

## 🎯 Amaç
Oyuncunun oyun sırasında önemli olaylardan haberdar olmasını ve yeni mekanikleri kolayca öğrenmesini sağlayacak bildirim ve rehberlik sistemi geliştirmek.

---

## ✨ Beklentiler
- Oyun içi bildirimler: Dalga başı/sonu, kule açma, görev tamamlama, tehlike uyarısı
- Rehberlik (tutorial) sistemi: Yeni başlayanlar ve yeni mekanikler için adım adım rehber
- Bildirimler ve rehberlik, kullanıcıyı rahatsız etmeyecek şekilde tasarlanmalı
- Bildirim geçmişi ve tekrar gösterme seçeneği

---

## 🛠️ Yapılacaklar
1. **Bildirim Sistemi**
   - Oyun içi önemli olaylar için anlık bildirimler
   - Bildirim geçmişi ve tekrar gösterme butonu
   - Kritik uyarılar için görsel/sesli efektler
2. **Rehberlik (Tutorial) Sistemi**
   - Oyun başında temel mekanikler için adım adım rehber
   - Yeni açılan özellikler için dinamik rehberlik
   - Rehberlik paneli ve ilerleme takibi
3. **Kullanıcı Akışı**
   - Oyuncu oyun sırasında bildirimleri ve rehberlik mesajlarını alır
   - Gerekirse bildirim geçmişini veya rehberi tekrar açar
4. **Teknik Gereksinimler**
   - Bildirim ve rehberlik için veri yapıları
   - UI/UX: Bildirim paneli, rehberlik ekranı, tekrar gösterme butonu
   - Sesli/görsel efekt entegrasyonu

---

## 👤 Kullanıcı Akışı
1. Oyuncu oyun sırasında önemli olaylar için bildirim alır
2. Yeni mekanik veya özellik açıldığında rehberlik mesajı görür
3. Bildirim geçmişini veya rehberi tekrar açabilir

---

## 📝 Notlar
- Bildirim ve rehberlik sistemi, oyun testleriyle sürekli iyileştirilecek
- Kullanıcıdan gelen geri bildirimlerle yeni rehberlik içerikleri eklenebilir

## 🚦 İLERLEME
- ✅ Kendi notification (toast) sistemimiz tamamen kaldırıldı.
- ✅ react-toastify ile global bildirim/ödül sistemi entegre edildi.
- ✅ Challenge/görev paneli ve ödül bildirimleri react-toastify ile gösteriliyor.
- ✅ Bildirimler modern, alt-orta konumda ve otomatik kayboluyor.

## ⏳ SIRADAKİ İŞLER
- 🔄 Bildirimlerin oyun içi diğer eventlerle (ör. mağaza işlemleri, yükseltme, hata/uyarı) tam entegrasyonu.
- 🔄 Bildirim stillerinin ve animasyonlarının oyun temasıyla uyumlu hale getirilmesi.
- 🔄 Bildirim geçmişi ve kullanıcıya özel bildirim ayarları (isteğe bağlı).

---
Bu issue, oyun içi bildirim sisteminin modernleştirilmesi ve merkezi yönetimi için kullanılacaktır. Tüm yeni bildirimler ve entegrasyonlar bu başlık altında takip edilecektir. 