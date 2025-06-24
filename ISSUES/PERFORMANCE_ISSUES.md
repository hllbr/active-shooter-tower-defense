# ⚡ Performance Issues in GameBoard.tsx

## Issue #31: Unnecessary Re-renders 
**Severity**: High
**Component**: Main component body
**Problem**:
- Her render'da window.innerWidth/Height çağrılıyor
- SVG dimensions gereksiz yere re-calculate ediliyor
- useAnimatedCounter hook her render'da yeniden tanımlanıyor

**Impact**: 60 FPS → 30-40 FPS düşüşü
**Test Case**:
1. React DevTools Profiler aç
2. Oyunu 5 dakika oyna
3. Render count ve timing'leri analiz et

**Optimization**:
```javascript
// ❌ Current
const width = window.innerWidth;
const height = window.innerHeight;

// ✅ Better
const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
useEffect(() => {
  const updateDimensions = () => setDimensions({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });
  // Only on resize
}, []);
```

---

## Issue #32: Expensive DOM Calculations in Hot Path
**Severity**: Critical
**Component**: handleMouseMove (lines 400-412)
**Problem**:
- getBoundingClientRect() her mouse move'da
- High-frequency event'lerde 16ms budget'ı aşıyor

**Impact**: Drag operation'da stutter
**Test Case**:
1. Performance tab aç
2. Kule sürükleme başlat
3. Frame timing'leri gözlemle (>16ms frames)

**Optimization**:
```javascript
// ❌ Current - Her mouse move'da
const svgRect = svgElement.getBoundingClientRect();

// ✅ Better - Cache edilmeli
const svgRectRef = useRef(null);
useEffect(() => {
  svgRectRef.current = svgElement.getBoundingClientRect();
}, [/* dependencies */]);
```

---

## Issue #33: Large Array Iterations Without Optimization
**Severity**: High
**Component**: SVG rendering loops
```javascript
{enemies.map((enemy) => (...))}  // Could be 100+
{bullets.map((bullet) => (...))} // Could be 500+
{effects.map((effect) => (...))} // Could be 200+
```
**Problem**:
- Virtual scrolling yok
- Off-screen rendering
- Key optimization eksik

**Impact**: Late-game'de FPS drop
**Test Case**:
1. 50+ wave'e kadar oyna
2. Çok sayıda enemy/bullet spawn et
3. FPS meter ile performance ölç

---

## Issue #34: Inefficient Distance Calculations
**Severity**: Medium-High
**Component**: Drag target detection
```javascript
towerSlots.forEach((slot, idx) => {
  const distance = Math.sqrt(Math.pow(mouseX - slot.x, 2) + Math.pow(mouseY - slot.y, 2));
});
```
**Problem**:
- Math.sqrt() gereksiz (distance² comparison yeterli)
- O(n) her mouse up'ta

**Optimization**:
```javascript
// ❌ Current
const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

// ✅ Better
const distanceSquared = dx * dx + dy * dy;
const thresholdSquared = detectionRadius * detectionRadius;
if (distanceSquared <= thresholdSquared) { /* ... */ }
```

---

## Issue #35: CSS Animation Performance
**Severity**: Medium
**Component**: Multiple CSS animations
**Problem**:
- Layout-triggering properties (width, height)
- Composite layer creation eksik
- GPU acceleration kullanılmıyor

**Impact**: Animation jank
**Test Case**:
1. Chrome DevTools → Rendering tab
2. "Paint flashing" enable et
3. Animation'ları gözlemle

**Optimization**:
```css
/* ❌ Current */
@keyframes screen-shake {
  0% { transform: translate(0, 0); }
  10% { transform: translate(-1px, -1px); }
}

/* ✅ Better */
@keyframes screen-shake {
  0% { transform: translate3d(0, 0, 0); }
  10% { transform: translate3d(-1px, -1px, 0); }
}
```

---

## Issue #36: Memory Leaks from Closures
**Severity**: High
**Component**: Event handlers ve timers
**Problem**:
- Event handler'larda closure memory leaks
- Timer cleanup incomplete
- Component state retention

**Test Case**:
1. Chrome DevTools → Memory tab
2. Heap snapshot al
3. Component mount/unmount cycle
4. Memory growth gözlemle

---

## Issue #37: Tooltip Rendering Performance
**Severity**: Medium
**Component**: Complex tooltip (lines 470-620)
**Problem**:
- Complex nested div structure
- Conditional rendering overhead
- Multiple style calculations

**Impact**: Hover lag
**Optimization**: Memoization ve component splitting

---

## Issue #38: String Template Performance
**Severity**: Low-Medium
**Component**: Progress calculation
```javascript
width: `${Math.min(100, (enemiesKilled / enemiesRequired) * 100)}%`
```
**Problem**:
- String interpolation her render'da
- Math calculation redundancy

**Optimization**: useMemo ile cache

---

## Issue #39: Event Listener Management
**Severity**: Medium
**Component**: Multiple window event listeners
**Problem**:
- Passive event listener'lar kullanılmıyor
- Event delegation eksik

**Test Case**:
1. Event listener count'ını monitor et
2. Scroll performance test et

---

## Issue #40: Bundle Size & Code Splitting
**Severity**: Medium
**Component**: Monolithic component
**Problem**:
- 1375 line tek component
- Code splitting opportunity
- Tree shaking engellenebilir

**Impact**: Initial load time
**Optimization**: Component lazy loading 