# 🎬 Animation Classes Quick Reference

A quick lookup guide for all animation classes in FruitMart app.

## 📍 Page Transition Animations (Entrance Effects)

```
fm-animate-fade-in       → Fades in from transparent (400ms)
fm-animate-slide-up      → Slides up with fade (400ms)
fm-animate-slide-down    → Slides down with fade (400ms)
fm-animate-slide-left    → Slides from right to left (400ms)
fm-animate-slide-right   → Slides from left to right (400ms)
fm-animate-zoom-in       → Scales up 95% to 100% (400ms)
fm-animate-bounce-in     → Bouncy entrance (500ms)
```

## 🖱️ Hover Effects

```
fm-hover-scale           → Scales to 105% on hover
fm-hover-lift            → Lifts up 2px, enhanced shadow
fm-hover-glow            → Glowing box-shadow effect
fm-hover-brightness      → Brightness +10%
fm-hover-shadow          → Enhanced box-shadow
```

## 🎯 Icon Animations

```
fm-icon-spin             → 360° rotation (2s loop)
fm-icon-bounce           → Up and down bounce (1s loop)
fm-icon-shake            → Side to side shake (0.5s)
```

## 📝 Text Animations

```
fm-text-animate          → Fade-in with letter-spacing (600ms)
fm-text-blur-animate     → Blur-in effect (600ms)
```

## 📦 Container Animations

```
fm-stagger-container     → Apply to parent, children animate with 80ms stagger
                           (Up to 6+ children with delays)
```

## ✨ Pulse Effects

```
fm-pulse                 → Simple fade pulse (2s loop)
fm-glow-pulse            → Glowing pulse (2s loop)
```

---

## 🚀 Copy-Paste Examples

### Example 1: Button with Hover
```html
<button class="fm-hover-lift rounded-full bg-blue-600 px-6 py-3">
  Click Me
</button>
```

### Example 2: Product Card with Animation
```html
<div class="fm-animate-slide-up fm-hover-lift rounded-xl border p-4">
  <img src="product.jpg" class="fm-hover-scale w-full rounded-lg" />
  <h3 class="fm-text-animate mt-2 font-semibold">Product Name</h3>
</div>
```

### Example 3: Form with Staggered Fields
```html
<form class="fm-stagger-container space-y-4">
  <div>
    <label>Email</label>
    <input type="email" class="fm-hover-glow w-full rounded-lg px-4 py-2" />
  </div>
  <div>
    <label>Password</label>
    <input type="password" class="fm-hover-glow w-full rounded-lg px-4 py-2" />
  </div>
  <button class="fm-hover-lift w-full rounded-lg bg-green-600 py-2 text-white">
    Submit
  </button>
</form>
```

### Example 4: Navigation with Stagger
```html
<nav class="fm-stagger-container flex gap-4">
  <a href="/" class="fm-hover-brightness px-4 py-2">Home</a>
  <a href="/about" class="fm-hover-brightness px-4 py-2">About</a>
  <a href="/contact" class="fm-hover-brightness px-4 py-2">Contact</a>
</nav>
```

### Example 5: Loading Spinner
```html
<div class="flex items-center justify-center gap-2">
  <svg class="fm-icon-spin w-5 h-5">
    <!-- SVG content -->
  </svg>
  <span class="fm-text-blur-animate">Loading...</span>
</div>
```

### Example 6: List with Stagger & Hover
```html
<ul class="fm-stagger-container space-y-2">
  <li class="fm-hover-lift rounded-lg border p-3">Item 1</li>
  <li class="fm-hover-lift rounded-lg border p-3">Item 2</li>
  <li class="fm-hover-lift rounded-lg border p-3">Item 3</li>
</ul>
```

### Example 7: Card Grid
```html
<div class="fm-stagger-container grid grid-cols-1 md:grid-cols-3 gap-4">
  <div class="fm-animate-slide-up fm-hover-lift rounded-xl border p-6">
    <h3 class="fm-text-animate font-bold">Card 1</h3>
    <p>Content here</p>
  </div>
  <div class="fm-animate-slide-up fm-hover-lift rounded-xl border p-6">
    <h3 class="fm-text-animate font-bold">Card 2</h3>
    <p>Content here</p>
  </div>
  <div class="fm-animate-slide-up fm-hover-lift rounded-xl border p-6">
    <h3 class="fm-text-animate font-bold">Card 3</h3>
    <p>Content here</p>
  </div>
</div>
```

### Example 8: Hero Section
```html
<section class="min-h-screen bg-gradient-to-r from-blue-600 to-purple-600">
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <h1 class="fm-text-animate text-5xl font-bold text-white">
        Welcome to FruitMart
      </h1>
      <p class="fm-text-blur-animate mt-4 text-xl text-white/80">
        Fresh fruits delivered to your door
      </p>
      <button class="fm-animate-slide-up fm-hover-lift mt-8 rounded-full bg-white px-8 py-3 font-semibold text-blue-600">
        Get Started
      </button>
    </div>
  </div>
</section>
```

### Example 9: Notification
```html
<div class="fm-animate-bounce-in rounded-lg border border-green-400 bg-green-50 p-4">
  <p class="text-green-800">✓ Operation completed successfully!</p>
</div>
```

### Example 10: Modal/Dialog
```html
<div class="fm-animate-zoom-in fixed inset-0 flex items-center justify-center bg-black/50">
  <div class="fm-animate-slide-up rounded-xl bg-white p-6">
    <h2 class="fm-text-animate text-2xl font-bold">Confirm Action</h2>
    <p class="mt-2 text-gray-600">Are you sure?</p>
    <div class="mt-6 flex gap-2">
      <button class="fm-hover-lift flex-1 rounded-lg border px-4 py-2">Cancel</button>
      <button class="fm-hover-lift flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white">
        Confirm
      </button>
    </div>
  </div>
</div>
```

---

## ⏱️ Animation Timings

All animations run at comfortable speeds:
- **Entrance animations**: 400-500ms
- **Hover effects**: 200ms transitions
- **Stagger delays**: 80ms between items
- **Icon spins**: 2s continuous loop
- **Pulses**: 2s continuous loop

---

## 🎛️ Combining Animations

You can combine multiple classes:

```html
<!-- Combines entrance + hover + text effects -->
<div class="fm-animate-slide-up fm-hover-lift">
  <h1 class="fm-text-animate">Title</h1>
  <p class="fm-text-blur-animate">Subtitle</p>
</div>

<!-- Stagger with individual hover effects -->
<div class="fm-stagger-container">
  <button class="fm-hover-scale">Button 1</button>
  <button class="fm-hover-lift">Button 2</button>
  <button class="fm-hover-glow">Button 3</button>
</div>
```

---

## ♿ Accessibility

All animations respect `prefers-reduced-motion`:
- Users who prefer reduced motion will see no animations
- Page functionality is never affected
- No essential information is animation-dependent

---

## 📱 Mobile Responsive

All animations work on:
- Desktop (full animations)
- Tablet (optimized animations)
- Mobile (touch-friendly animations)

---

## 🔧 Custom Animation Delays

Add custom delays using inline styles:

```html
<div class="fm-animate-slide-up" style="animation-delay: 100ms;">
  Content 1
</div>

<div class="fm-animate-slide-up" style="animation-delay: 200ms;">
  Content 2
</div>

<div class="fm-animate-slide-up" style="animation-delay: 300ms;">
  Content 3
</div>
```

---

## 🎨 Combining with Tailwind

Use Tailwind classes alongside animation classes:

```html
<!-- Color + Animation + Hover + Size -->
<button class="fm-hover-lift fm-animate-slide-up 
              bg-gradient-to-r from-blue-600 to-purple-600
              text-white font-bold text-lg px-8 py-3
              rounded-full shadow-lg">
  Click Me
</button>
```

---

## 🐛 Troubleshooting

**Animation not showing?**
- Check if `prefers-reduced-motion` is enabled in OS settings
- Ensure the animation class is spelled correctly
- Check browser console for errors

**Animation too fast/slow?**
- Use custom `animation-delay` for timing
- Modify the keyframe duration in `app.css` if needed

**Hover effect not working?**
- Ensure element isn't `pointer-events: none`
- Check if parent has `overflow: hidden` (may clip effects)
- Verify hover class is spelled correctly

---

## 📚 Full Documentation

See `ANIMATIONS_GUIDE.md` for detailed information on each animation with parameters and advanced usage.

---

## 💡 Pro Tips

1. **Use entrance animations for page loads** - Makes app feel snappier
2. **Use hover effects on interactive elements** - Provides visual feedback
3. **Use stagger for lists** - Creates smooth, organized feel
4. **Avoid over-animating** - Less is more, focus on key interactions
5. **Test with reduced motion** - Ensure accessibility always
6. **Combine animations** - Stack 2-3 classes for unique effects
7. **Use delays strategically** - Guide user attention with timing

---

**Happy Animating! 🚀**
