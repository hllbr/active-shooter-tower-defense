# 📋 Medium Priority Issues in GameBoard.tsx

## Issue #11: Mobile Touch Event Incompatibility
**Severity**: Medium
**Component**: All mouse event handlers
```javascript
onMouseEnter={(e) => { /* ... */ }}
onMouseLeave={(e) => { /* ... */ }}
handleMouseMove, handleMouseUp
```
**Problem**:
- Sadece mouse event'ları, touch event'ları yok
- Mobile cihazlarda tooltip ve drag&drop çalışmıyor

**Test Case**:
1. Mobile device veya touch simulator kullan
2. Tooltip'i açmaya çalış
3. Kule sürükleme işlemini test et

---

## Issue #12: Window Resize Performance
**Severity**: Medium
**Component**: SVG dimensions (lines 335-336)
```javascript
const width = window.innerWidth;
const height = window.innerHeight;
```
**Problem**:
- Her render'da window.inner* çağrılıyor
- Resize event'lerde gereksiz re-calculation

**Test Case**:
1. Window'u sürekli resize et
2. Performance tab'ında render count'ı gözlemle

---

## Issue #13: CSS Animation Overlap
**Severity**: Medium
**Component**: Keyframe animations (lines 400-800)
```css
@keyframes slot-emerge { /* ... */ }
@keyframes lock-shake { /* ... */ }
@keyframes screen-shake { /* ... */ }
```
**Problem**:
- Aynı element'te multiple animation riski
- Animation state çakışması

**Test Case**:
1. Slot unlock sırasında screen shake tetikle
2. Visual glitch olup olmadığını gözlemle

---

## Issue #14: Debug Message Stacking
**Severity**: Medium
**Component**: Debug message display (lines 660-675)
```javascript
{debugMessage && (
  <div style={{ /* fixed position */ }}>
    {debugMessage}
  </div>
)}
```
**Problem**:
- Aynı anda sadece bir debug message
- Rapid action'larda message loss

**Test Case**:
1. Hızlı tower action'lar yap
2. Debug message'ların kaybolup kaybolmadığını kontrol et

---

## Issue #15: Tooltip Content Overflow
**Severity**: Medium
**Component**: Tooltip content (lines 470-620)
```javascript
<div style={{
  minWidth: 320,
  maxWidth: 400,
  // Content overflow riski
}}>
```
**Problem**:
- Uzun stat değerlerinde text overflow
- Dynamic content için fixed width

**Test Case**:
1. Çok yüksek stat değerleri elde et (millions)
2. Tooltip'te text overflow kontrol et

---

## Issue #16: Game Over Stats Animation Timing
**Severity**: Medium
**Component**: Animated counters (lines 226-232)
```javascript
const animatedKills = useAnimatedCounter(totalEnemiesKilled);
const animatedGold = useAnimatedCounter(totalGoldSpent);
// Tüm animasyonlar aynı anda başlıyor
```
**Problem**:
- Tüm stats aynı anda animate ediliyor
- UX açısından sequential animation daha iyi

**Test Case**:
1. Game over ekranını izle
2. Stats animation timing'inin smooth olup olmadığını kontrol et

---

## Issue #17: SVG Element Z-Index Issues
**Severity**: Medium
**Component**: SVG element ordering
```javascript
{/* Tower Slots */}
{/* Dragged Tower */}
{/* Enemies */}
{/* Bullets */}
```
**Problem**:
- SVG'de element order = z-index
- Drag visualization altında kalabilir

**Test Case**:
1. Kule sürüklerken enemy spawn et
2. Visual layering'in doğru olup olmadığını kontrol et

---

## Issue #18: Memory Usage in Large Games
**Severity**: Medium
**Component**: Effects arrays rendering
```javascript
{effects.map((effect) => (...))}
{bullets.map((bullet) => (...))}
{enemies.map((enemy) => (...))}
```
**Problem**:
- Büyük array'lerde render performance
- Cleanup mechanism eksik

**Test Case**:
1. Uzun süre oyun oyna (30+ wave)
2. Memory usage ve FPS'i izle

---

## Issue #19: Start Screen Click Area
**Severity**: Low-Medium
**Component**: Start overlay (lines 700-730)
```javascript
<div onClick={() => { setStarted(true); startPreparation(); }}>
  {/* Entire screen clickable */}
</div>
```
**Problem**:
- Tüm ekran clickable, accidental start
- UX açısından button area daha iyi

**Test Case**:
1. Start screen'de accidental click yap
2. Unexpected game start kontrol et 