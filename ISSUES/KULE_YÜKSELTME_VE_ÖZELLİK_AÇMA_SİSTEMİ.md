# ⬆️ KULE YÜKSELTME VE ÖZELLİK AÇMA SİSTEMİ

## 🎯 Amaç
Kulelerin oyun sırasında ve mağaza üzerinden yeni özellikler/yetenekler açılarak katmanlı şekilde geliştirilebilmesini sağlamak. Stratejik derinlik ve uzun süreli oynanış hedeflenir.

---

## ✨ Beklentiler
- Kuleler, oyun sırasında klasik yükseltmelerle (hasar, menzil, hız) geliştirilebilir.
- Mağazadan özel yetenekler, yeni upgrade path'ler ve pasif/aktif özellikler açılabilir.
- Bazı yükseltmeler sadece mağazadan açılabilir (ör. Büyücü Kulesi için "Zincir Büyü").
- Yükseltme ve özellik açma sistemi, kullanıcıya anlamlı seçimler sunmalı.

---

## 🛠️ Yapılacaklar
1. **Yükseltme Katmanları**
   - Klasik yükseltmeler: Hasar, menzil, atış hızı, kritik şansı.
   - Özel yükseltmeler: Splash damage, zincirleme, zırh delici, aura, vb.
   - Aktif/pasif yetenekler: Kule başına 1 aktif, 1-2 pasif yetenek.
2. **Mağaza Entegrasyonu**
   - Mağazada açılan özellikler, ilgili kulede yükseltme olarak görünür.
   - Açılmamış özellikler gri/kapalı gösterilir.
3. **Kullanıcı Akışı**
   - Oyuncu, kuleyi seçip yükseltme panelini açar.
   - Açılmış yükseltmeler ve yetenekler listelenir.
   - Oyuncu, stratejisine göre yükseltme/özellik seçer.
4. **Teknik Gereksinimler**
   - Kule başına upgrade tree yapısı.
   - Özellik açma durumu oyuncu profilinde saklanmalı.
   - UI/UX: Yükseltme paneli, mağaza ile entegre.
   - Yetenek ve yükseltme efektleri için animasyon/ses desteği.

---

## 👤 Kullanıcı Akışı
1. Oyuncu mağazadan yeni bir özellik açar (ör. "Zincir Büyü").
2. Oyun sırasında kuleyi seçip yükseltme panelini açar.
3. Açılmış yükseltmeler ve yetenekler aktif olur.
4. Oyuncu, stratejisine göre yükseltme/özellik seçer ve uygular.

---

## 📝 Notlar
- Yükseltme ve özellik açma sistemi, oyun ilerledikçe yeni seçenekler sunmalı.
- Balans ve testler ile oyuncu seçimleri teşvik edilmeli. 