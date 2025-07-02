# 🗺️ LEVEL DESIGN VE UZUN SÜRELİ OYUN SÜRESİ

## 🎯 Amaç
Oyunun tekrar oynanabilirliğini ve uzun süreli oynanışını artıracak, stratejik seçenekler sunan zengin harita tasarımları ve oyun modları geliştirmek.

---

## ✨ Beklentiler
- Farklı harita düzenleri (yol ayrımları, engeller, bonus alanlar)
- Sonsuz mod (infinite mode) ve challenge modları
- Dalga yapısında çeşitlilik (mini-boss, özel dalgalar)
- Harita üzerinde interaktif objeler (ör. tuzaklar, güçlendirme noktaları)
- Oyun süresini uzatacak ve oyuncuyu tekrar oynamaya teşvik edecek sistemler

---

## 🛠️ Yapılacaklar
1. **Harita Çeşitliliği**
   - Farklı zorluk seviyelerinde haritalar tasarla
   - Yol ayrımları, engeller ve alternatif rotalar ekle
   - Bonus alanlar ve riskli bölgeler oluştur
2. **Oyun Modları**
   - Sonsuz mod: Artan zorlukla dalgalar sonsuza kadar devam eder
   - Challenge modları: Belirli kurallarla (ör. sadece belirli kuleler, sınırlı ekonomi) oynanan özel modlar
3. **Dalga ve Düşman Çeşitliliği**
   - Mini-boss ve özel dalga sistemleri ekle
   - Dalga arası sürpriz olaylar (ör. meteor yağmuru, enerji fırtınası)
4. **Harita Üzerinde Etkileşimli Objeler**
   - Tuzaklar, güçlendirme noktaları, geçici bariyerler
   - Oyuncunun stratejisini değiştirecek çevresel faktörler
5. **Tekrar Oynanabilirlik**
   - Rastgeleleştirilmiş harita elementleri
   - Günlük/haftalık görevler ve skor tabloları

---

## 👤 Kullanıcı Akışı
1. Oyuncu farklı haritalar veya modlar arasından seçim yapar
2. Oyun sırasında harita üzerindeki engeller ve bonuslar stratejiye yön verir
3. Sonsuz/challenge modunda oyuncu yüksek skor veya dalga hedefler
4. Oyun sonunda skor tablosu ve ödüller gösterilir

---

## 🧑‍💻 Teknik Gereksinimler
- Harita ve dalga yapılarını tanımlayan yeni veri yapıları
- Oyun modları için modüler sistem
- Harita üzerindeki objeler için component yapısı
- Skor ve görev sistemleri için backend veya localStorage entegrasyonu
- UI/UX: Harita/mod seçimi, skor tablosu, görev ekranı

---

## 📝 Notlar
- Harita ve mod çeşitliliği, oyun testleriyle dengelenecek
- Challenge ve sonsuz modlar, topluluk geri bildirimiyle geliştirilecek 