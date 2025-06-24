# 🎯 GitHub Issues - Shooter Tower Defense

Bu klasör, projenizin GitHub repository'si için hazırlanmış issue şablonlarını içerir.

## 📋 Issue Listesi

### 🔥 Kritik Öncelik
1. **[01-critical-bullet-collision.md](./01-critical-bullet-collision.md)** - Bullet collision detection sorunları
2. **[02-performance-state-updates.md](./02-performance-state-updates.md)** - Performance optimization 
3. **[04-economy-balancing.md](./04-economy-balancing.md)** - Economy tower gelir dengeleme
4. **[06-enemy-spawning-balance.md](./06-enemy-spawning-balance.md)** - Düşman spawning dengeleme

### ⭐ Orta Öncelik  
5. **[03-tower-targeting-algorithm.md](./03-tower-targeting-algorithm.md)** - Tower targeting sistemi
6. **[05-drag-drop-ux.md](./05-drag-drop-ux.md)** - Drag & Drop UX iyileştirmeleri
7. **[07-memory-leak-prevention.md](./07-memory-leak-prevention.md)** - Memory leak prevention

## 🚀 GitHub'a Issue Ekleme Rehberi

### Yöntem 1: Manuel Kopyala-Yapıştır
1. GitHub repository'nize gidin: https://github.com/hllbr/active-shooter-tower-defense
2. **Issues** sekmesine tıklayın
3. **New Issue** butonuna basın
4. İlgili `.md` dosyasını açın ve içeriği kopyalayın
5. **Title** ve **Comment** alanlarına yapıştırın
6. **Labels** bölümünden uygun etiketleri seçin
7. **Submit new issue** ile kaydedin

### Yöntem 2: GitHub CLI (Önerilen)
```bash
# GitHub CLI yükleyin
npm install -g @github/gh

# Login olun
gh auth login

# Issue oluşturun
gh issue create --title "🐛 Bullet Collision Detection Sorunları" \
  --body-file ./github-issues/01-critical-bullet-collision.md \
  --label "bug,critical,gameplay,performance"
```

### Yöntem 3: Toplu Issue Oluşturma
```bash
# create-all-issues.sh
#!/bin/bash

gh issue create -t "🐛 Bullet Collision Detection" -F ./01-critical-bullet-collision.md -l "bug,critical"
gh issue create -t "⚡ Performance State Updates" -F ./02-performance-state-updates.md -l "performance,critical"  
gh issue create -t "🎮 Tower Targeting Algorithm" -F ./03-tower-targeting-algorithm.md -l "enhancement,gameplay"
gh issue create -t "💰 Economy Balancing" -F ./04-economy-balancing.md -l "economy,balancing"
gh issue create -t "🎨 Drag & Drop UX" -F ./05-drag-drop-ux.md -l "ui/ux,enhancement"
gh issue create -t "🌊 Enemy Spawning Balance" -F ./06-enemy-spawning-balance.md -l "gameplay,balancing"
gh issue create -t "🧠 Memory Leak Prevention" -F ./07-memory-leak-prevention.md -l "performance,memory"

echo "✅ Tüm issue'lar oluşturuldu!"
```

## 🏷️ Önerilen Label'lar

GitHub repository'nizde şu label'ları oluşturun:

- `bug` (kırmızı) - Hata düzeltmeleri
- `critical` (koyu kırmızı) - Kritik sorunlar
- `enhancement` (mavi) - Yeni özellikler
- `performance` (sarı) - Performans iyileştirmeleri
- `ui/ux` (mor) - Kullanıcı deneyimi
- `gameplay` (yeşil) - Oyun mekaniği
- `economy` (altın) - Oyun ekonomisi
- `balancing` (turuncu) - Oyun dengesi
- `tech-debt` (gri) - Teknik borç
- `memory` (pembe) - Memory yönetimi

## 📊 Proje Yönetimi

### Milestone Önerisi
1. **v1.1 - Critical Fixes** (1-2 hafta)
   - Bullet collision
   - Performance optimization
   - Economy balancing

2. **v1.2 - Gameplay Enhancement** (3-4 hafta)
   - Tower targeting
   - Enemy spawning
   - UX improvements

3. **v1.3 - Polish & Optimization** (5-6 hafta)
   - Memory management
   - Visual effects
   - Mobile support

### Project Board Yapısı
- **🔴 Backlog** - Planlanmış işler
- **🟡 In Progress** - Çalışılan konular
- **🟢 Review** - Gözden geçirme bekleyenler
- **✅ Done** - Tamamlananlar

## 💡 İpuçları

1. **Priority sırasına göre issue'ları oluşturun**
2. **Her issue için ayrı branch oluşturun**: `feature/issue-1-bullet-collision`
3. **Commit mesajlarında issue referansı verin**: `fix: bullet collision düzeltildi (closes #1)`
4. **Pull request'lerde issue'lara link verin**
5. **Community contribution için "good first issue" etiketleri kullanın**

## 🤝 Katkıda Bulunma

Bu issue'lar topluluk katkısına açık! Özellikle şu konularda yardım aranıyor:
- UI/UX tasarım
- Mobile optimization
- Performance tuning
- Game balancing

---

📝 **Not**: Bu issue'lar GAME_ANALYSIS_REPORT.md dosyasından oluşturulmuştur ve projenizin mevcut durumuna göre güncellenebilir. 