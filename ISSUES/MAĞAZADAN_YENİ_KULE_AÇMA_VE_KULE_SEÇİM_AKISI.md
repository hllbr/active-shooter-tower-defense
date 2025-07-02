# 🏪 MAĞAZADAN YENİ KULE AÇMA & KULE SEÇİM AKIŞI

## 🎯 Amaç
Oyuncunun mağazadan yeni kule türlerini (ör. Topçu, Büyücü, Dondurucu, Keskin Nişancı, Destek) açabilmesi ve inşa alanına tıkladığında açılmış kuleler arasından seçim yapabilmesi. Bu akışın kullanıcı dostu, akıcı ve görsel olarak çekici olması.

---

## ✨ Beklentiler
- Oyun başında sadece temel kuleler açık olacak.
- Mağazada yeni kule türleri (ör. Topçu, Büyücü) açılabilir olacak.
- Mağazadan açılan kuleler, inşa alanında seçim ekranında görünür olacak.
- İnşa alanına tıklandığında, açılmış kuleler için bir seçim paneli açılacak.
- Seçilen kule, ilgili alana inşa edilecek ve animasyon/ses efektleriyle desteklenecek.
- Kule açma ve seçim akışı, mobil ve masaüstü için optimize edilecek.

---

## 🛠️ Yapılacaklar
1. **Mağaza Arayüzü**
   - Yeni kule türleri için mağaza kartları oluştur.
   - Kule açma maliyetleri ve gereksinimleri belirle.
   - Açılan kuleler için "Açıldı" etiketi göster.
2. **Kule Açma Mekaniği**
   - Oyuncu mağazadan kuleyi açınca, ilgili kule türü "açılmış" olarak işaretlenir.
   - Açılan kuleler, inşa panelinde görünür.
3. **Kule Seçim Paneli**
   - İnşa alanına tıklanınca, açılmış kulelerin listelendiği bir panel açılır.
   - Her kule için ikon, kısa açıklama ve istatistikler gösterilir.
   - Seçilen kule, ilgili alana inşa edilir.
4. **Animasyon & Ses Efektleri**
   - Kule açma, seçim ve inşa işlemleri için animasyon ve ses efektleri ekle.
5. **Kullanıcı Akışı ve UX**
   - Panel açılış/kapanış animasyonları.
   - Hatalı seçimlerde uyarı mesajları.
   - Mobil ve masaüstü için responsive tasarım.
6. **Test ve Geri Bildirim**
   - Kullanıcı testleriyle akışın sorunsuz çalıştığını doğrula.
   - Gerekirse UX iyileştirmeleri yap.

---

## 👤 Kullanıcı Akışı
1. Oyuncu mağazaya girer.
2. Yeni kule türlerinden birini açar (ör. Büyücü Kulesi).
3. Oyun alanında bir inşa alanına tıklar.
4. Açılmış kuleler için seçim paneli açılır.
5. Oyuncu istediği kuleyi seçer ve inşa eder.
6. Kule inşa animasyonu ve ses efekti oynar.

---

## 🧑‍💻 Teknik Gereksinimler
- Kule açma durumu, oyuncu profilinde saklanmalı (localStorage, backend veya state).
- Mağaza ve inşa paneli için yeni UI componentleri.
- Kule açma ve seçim işlemleri için event/handler yapısı.
- Animasyon ve ses efektleri için asset ve fonksiyonlar.
- Responsive ve erişilebilir tasarım.

---

## 📝 Örnekler & Referanslar
- Clash Royale: Kart açma ve seçim akışı
- Bloons TD 6: Kule açma ve inşa paneli
- Kingdom Rush: Kule yükseltme ve seçim sistemi

---

## 🚩 Notlar
- Bu akış, yeni kulelerin oyuna eklenmesiyle birlikte uygulanacak.
- Gerekirse, kullanıcıdan geri bildirim alınarak UX iyileştirilecek. 