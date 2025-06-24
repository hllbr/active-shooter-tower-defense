# ⚠️ High Priority Issues in GameBoard.tsx

## Issue #5: Event Listener Memory Leaks
**Severity**: High
**Component**: Tab Key Handler (lines 360-380)
```javascript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => { /* ... */ };
  const handleKeyUp = (e: KeyboardEvent) => { /* ... */ };
  
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}, []);
```
**Problem**:
- Empty dependency array, ama setShowTooltip closure'da yakalanıyor
- Component unmount'ta event listener'lar kalmış olabilir

**Test Case**:
1. Component mount/unmount döngüsü yap
2. Tab tuşuna bas ve tooltip'in çalışıp çalışmadığını kontrol et
3. DevTools'da event listener sayısını gözlemle

---

## Issue #6: Mouse Event Performance Issue
**Severity**: High
**Component**: handleMouseMove (lines 400-412)
```javascript
const handleMouseMove = (event: React.MouseEvent) => {
  if (!dragState.isDragging) return;
  
  event.preventDefault();
  const svgElement = event.currentTarget as SVGElement;
  const svgRect = svgElement.getBoundingClientRect();
  // setState her mouse move'da çağrılıyor
```
**Problem**:
- Her mouse hareketiNde getBoundingClientRect() ve setState
- High-frequency event'lerde performance sorunu

**Test Case**:
1. Kule sürükleme işlemini başlat
2. Hızlı mouse hareketi yap
3. Performance tab'ında frame drops kontrol et

---

## Issue #7: Tooltip Position Bug
**Severity**: High  
**Component**: Tooltip rendering (lines 430-620)
```javascript
{showTooltip && (
  <div style={{
    position: 'absolute',
    top: '120%',
    left: 0,
    // Fixed positioning, ekran kenarlarında overflow
  }}>
```
**Problem**:
- Tooltip ekran kenarlarında taşabiliyor
- Mobile cihazlarda görünürlük sorunu

**Test Case**:
1. Browserı küçült
2. Info icon'a hover yap
3. Tooltip'in ekrandan taştığını gözlemle

---

## Issue #8: Animation State Inconsistency
**Severity**: High
**Component**: Screen shake effect (lines 355-365)
```javascript
useEffect(() => {
  if (unlockingSlots.size > 0) {
    setScreenShake(true);
    const timer = setTimeout(() => setScreenShake(false), 600);
    return () => clearTimeout(timer);
  }
}, [unlockingSlots]);
```
**Problem**:
- unlockingSlots.size === 0 olduğunda timer cleanup'ı yok
- Rapid unlocking'de animation overlap riski

**Test Case**:
1. Hızlı slot unlock yap
2. Animation'ların çakışıp çakışmadığını gözlemle

---

## Issue #9: Drag Detection Algorithm Flaw
**Severity**: High
**Component**: handleMouseUp (lines 430-480)
```javascript
towerSlots.forEach((slot, idx) => {
  // Distance calculation for every slot
  const distance = Math.sqrt(
    Math.pow(mouseX - slot.x, 2) + Math.pow(mouseY - slot.y, 2)
  );
```
**Problem**:
- O(n) complexity her mouse up'ta
- Çok slot olduğunda performance sorunu

**Test Case**:
1. Çok sayıda slot unlock et
2. Kule sürükleme işleminde lag olup olmadığını test et

---

## Issue #10: SVG Animation Memory Leak
**Severity**: Medium-High
**Component**: Inline SVG animations (lines 400-800)
```javascript
style={{ animation: 'mine-light-pulse 2s ease-in-out infinite' }}
```
**Problem**:
- CSS animasyonları DOM'da kalıyor
- Component unmount'ta cleanup yok

**Test Case**:
1. Çok sayıda mine spawn et
2. Component'i unmount et
3. DevTools'da animation frame sayısını kontrol et 