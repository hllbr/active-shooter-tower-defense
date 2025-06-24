# 🚨 Critical Issues in GameBoard.tsx

## Issue #1: Memory Leak in Game Over Screen Music
**Severity**: Critical
**Component**: GameOverScreen (lines 1041-1047)
```javascript
{isGameOver && (() => {
  stopBackgroundMusic();
  setTimeout(() => playSound('gameover'), 500);
  return true;
})() && (
```
**Problem**: 
- Her render'da yeni setTimeout oluşturuluyor
- stopBackgroundMusic() her render'da çağrılıyor
- Memory leak ve performance sorunu

**Test Case**:
1. Oyunu kaybetmeye zorla
2. Oyunu hızlıca resetle ve tekrar kaybetmeye zorla
3. DevTools'da memory kullanımını gözlemle

**Fix Needed**: useEffect ile bir kez çağrılmalı

---

## Issue #2: Duplicate State Definitions
**Severity**: Critical  
**Component**: Multiple state definitions (lines 334-345)
```javascript
const [dragState, setDragState] = useState<DragState>({...});
const [debugMessage, setDebugMessage] = useState<string>('');
```
**Problem**:
- dragState ve debugMessage, useEffect'lerden önce tanımlanmış
- Scope problemi ve state çakışması riski

**Test Case**:
1. Kule sürükleme işlemi başlat
2. Debug mesajı gösterilirken başka bir işlem yap
3. State inconsistency gözlemle

---

## Issue #3: Infinite Re-render Risk
**Severity**: Critical
**Component**: useAnimatedCounter hook (lines 208-225)
```javascript
const useAnimatedCounter = (endValue: number) => {
  useEffect(() => {
    if (!isGameOver) return;
    // requestAnimationFrame chain
  }, [endValue]);
};
```
**Problem**:
- Component-level hook, her render'da yeniden tanımlanıyor
- endValue değişirse infinite animation loop riski

**Test Case**:
1. Game over ekranına git
2. Stats'ın sürekli animasyon yaptığını gözlemle
3. Performance tab'ında frame rate düşmesini kontrol et

---

## Issue #4: Race Condition in Preparation Timer
**Severity**: High
**Component**: Preparation Effect (lines 280-290)
```javascript
}, [prepRemaining, isPreparing, startWave]);
```
**Problem**:
- prepRemaining her değişimde effect tetikleniyor
- startWave dependency'si race condition yaratabilir

**Test Case**:
1. Wave başlatma sırasında pause/resume yap
2. Preparation timer'ın senkronizasyon hatası gösterip göstermediğini kontrol et 