# FruitMart Modern Animations Guide 🎨

This guide explains all the modern animation classes and effects available in your FruitMart app.

## Table of Contents
1. [Page Transition Animations](#page-transition-animations)
2. [Hover Effects](#hover-effects)
3. [Icon Animations](#icon-animations)
4. [Text Animations](#text-animations)
5. [Stagger Animations](#stagger-animations)
6. [Utility Classes](#utility-classes)
7. [Usage Examples](#usage-examples)

---

## Page Transition Animations

These animations are perfect for when users navigate between pages or when elements enter the viewport.

### Available Animations:

| Class | Effect | Duration | Easing |
|-------|--------|----------|--------|
| `fm-animate-fade-in` | Smooth fade from transparent to visible | 400ms | ease-out |
| `fm-animate-slide-up` | Slides up with fade | 400ms | ease-out |
| `fm-animate-slide-down` | Slides down with fade | 400ms | ease-out |
| `fm-animate-slide-left` | Slides left with fade | 400ms | ease-out |
| `fm-animate-slide-right` | Slides right with fade | 400ms | ease-out |
| `fm-animate-zoom-in` | Scales up from 95% to 100% | 400ms | ease-out |
| `fm-animate-bounce-in` | Bouncy entrance animation | 500ms | cubic-bezier |

### Example Usage:
```html
<!-- Hero section slides up on page load -->
<section class="fm-animate-slide-up">
  <h1>Welcome to FruitMart</h1>
  <p>Fresh groceries delivered fast</p>
</section>

<!-- Product cards fade in -->
<div class="fm-animate-fade-in">
  <img src="apple.jpg" alt="Apple" />
  <p>Fresh Apples</p>
</div>

<!-- Zoom effect for important content -->
<div class="fm-animate-zoom-in">
  <h2>Limited Time Offer!</h2>
</div>
```

---

## Hover Effects

Apply smooth, modern hover effects to buttons, cards, and interactive elements.

### Available Hover Effects:

| Class | Effect | Trigger |
|-------|--------|---------|
| `fm-hover-scale` | Scales up by 5% | Hover |
| `fm-hover-lift` | Lifts 2px up with shadow enhancement | Hover |
| `fm-hover-glow` | Adds glowing box-shadow | Hover |
| `fm-hover-brightness` | Increases brightness by 10% | Hover |
| `fm-hover-shadow` | Enhanced box-shadow effect | Hover |

### Example Usage:
```html
<!-- Button with lift effect -->
<button class="fm-hover-lift rounded-full px-6 py-3">
  Add to Cart
</button>

<!-- Product card with scale and shadow -->
<div class="fm-hover-scale fm-hover-shadow rounded-xl p-4">
  <img src="banana.jpg" alt="Banana" />
  <p>Premium Bananas</p>
</div>

<!-- Link with brightness effect -->
<a href="/products" class="fm-hover-brightness text-blue-600">
  Browse All Products
</a>

<!-- Card with glow effect -->
<div class="fm-hover-glow rounded-xl border border-white/10 p-6">
  <h3>Featured Deal</h3>
</div>
```

---

## Icon Animations

Animate icons for loading states, notifications, and interactions.

### Available Icon Animations:

| Class | Effect | Duration | Timing |
|-------|--------|----------|--------|
| `fm-icon-spin` | Continuous rotation | 2s | linear |
| `fm-icon-bounce` | Bouncing up and down | 1s | ease-in-out |
| `fm-icon-shake` | Shaking side to side | 0.5s | ease-in-out |

### Example Usage:
```html
<!-- Loading spinner -->
<svg class="fm-icon-spin w-6 h-6">
  <!-- SVG content -->
</svg>

<!-- Bounce animation for notifications -->
<svg class="fm-icon-bounce w-5 h-5">
  <!-- Notification icon -->
</svg>

<!-- Shake animation for warnings -->
<svg class="fm-icon-shake w-6 h-6">
  <!-- Warning icon -->
</svg>
```

---

## Text Animations

Smooth text entrance animations.

### Available Text Animations:

| Class | Effect | Duration | Notes |
|-------|--------|----------|-------|
| `fm-text-animate` | Fade-in with letter-spacing adjustment | 600ms | Good for headings |
| `fm-text-blur-animate` | Blur-in effect | 600ms | Unique, modern feel |

### Example Usage:
```html
<!-- Heading with text animation -->
<h1 class="fm-text-animate">
  Fresh Fruits Delivered Daily
</h1>

<!-- Subheading with blur effect -->
<p class="fm-text-blur-animate text-lg">
  Quality you can trust, freshness you'll love
</p>
```

---

## Stagger Animations

Perfect for animating lists and grids with a cascading effect.

### How Stagger Works:

Add `fm-stagger-container` to a parent element, and all children will animate in sequence with 80ms delays between each.

### Example Usage:
```html
<!-- Product list with stagger animation -->
<div class="fm-stagger-container">
  <div class="product-card">Product 1</div>
  <div class="product-card">Product 2</div>
  <div class="product-card">Product 3</div>
  <div class="product-card">Product 4</div>
  <div class="product-card">Product 5</div>
</div>

<!-- Order items with stagger -->
<ul class="fm-stagger-container space-y-3">
  <li>Order #001 - Apples</li>
  <li>Order #002 - Oranges</li>
  <li>Order #003 - Bananas</li>
</ul>
```

---

## Utility Classes

### Pulse Effects:

| Class | Effect | Duration |
|-------|--------|----------|
| `fm-pulse` | Simple fade in/out pulse | 2s |
| `fm-glow-pulse` | Pulsing glow effect | 2s |

### Example Usage:
```html
<!-- Loading indicator -->
<div class="fm-pulse w-12 h-12 rounded-full bg-blue-500"></div>

<!-- Glowing badge -->
<span class="fm-glow-pulse px-3 py-1 rounded-full bg-green-500">
  New
</span>
```

### Smooth Transitions:

All buttons, links, inputs, selects, and textareas automatically have:
- 200ms smooth color transitions
- 200ms smooth background transitions
- 200ms smooth border transitions
- 200ms smooth box-shadow transitions

---

## Usage Examples

### Example 1: Enhanced Product Card
```html
<div class="fm-animate-slide-up fm-hover-lift fm-hover-shadow rounded-xl border border-white/10 bg-white p-6">
  <img class="fm-hover-scale rounded-lg w-full h-40 object-cover" 
       src="apple.jpg" alt="Fresh Apples" />
  
  <h3 class="fm-text-animate mt-4 text-lg font-semibold">
    Premium Red Apples
  </h3>
  
  <p class="text-gray-600">
    Fresh and crispy apples imported daily
  </p>
  
  <div class="mt-4 flex gap-2">
    <button class="fm-hover-lift flex-1 rounded-full bg-green-500 px-4 py-2 text-white">
      Add to Cart
    </button>
    <button class="fm-hover-scale rounded-full border border-gray-300 px-4 py-2">
      <svg class="w-5 h-5"><!-- Heart icon --></svg>
    </button>
  </div>
</div>
```

### Example 2: Animated Navigation Menu
```html
<nav class="fm-hover-lift fixed top-0 left-0 right-0 bg-white shadow">
  <ul class="fm-stagger-container flex gap-4">
    <li><a href="/" class="fm-hover-brightness px-4 py-2">Home</a></li>
    <li><a href="/about" class="fm-hover-brightness px-4 py-2">About</a></li>
    <li><a href="/products" class="fm-hover-brightness px-4 py-2">Products</a></li>
    <li><a href="/contact" class="fm-hover-brightness px-4 py-2">Contact</a></li>
  </ul>
</nav>
```

### Example 3: Animated Form
```html
<form class="space-y-4">
  <!-- Form fields with animations -->
  <div class="fm-animate-slide-up">
    <label class="fm-text-animate block font-semibold">Email Address</label>
    <input type="email" class="fm-hover-glow w-full rounded-lg border px-4 py-2" 
           placeholder="Enter your email" />
  </div>
  
  <div class="fm-animate-slide-up" style="animation-delay: 100ms;">
    <label class="fm-text-animate block font-semibold">Password</label>
    <input type="password" class="fm-hover-glow w-full rounded-lg border px-4 py-2" 
           placeholder="Enter your password" />
  </div>
  
  <button class="fm-hover-lift fm-animate-slide-up w-full rounded-full bg-blue-600 py-3 
                 text-white font-semibold" style="animation-delay: 200ms;">
    Sign In
  </button>
</form>
```

### Example 4: Loading State
```html
<div class="flex items-center justify-center gap-3">
  <div class="fm-icon-spin">
    <svg class="w-6 h-6 animate-spin">
      <!-- Loading spinner -->
    </svg>
  </div>
  <p class="fm-text-blur-animate">Processing your order...</p>
</div>
```

### Example 5: Order List with Stagger
```html
<div class="fm-stagger-container space-y-3">
  <div class="fm-hover-lift rounded-lg border border-gray-200 p-4">
    <div class="flex justify-between">
      <span class="font-semibold">Order #12345</span>
      <span class="text-green-600 font-semibold">Delivered</span>
    </div>
    <p class="text-gray-600 text-sm">Fresh Apples, Bananas, Oranges</p>
    <p class="text-gray-500 text-sm">Delivered on June 15, 2024</p>
  </div>
  
  <div class="fm-hover-lift rounded-lg border border-gray-200 p-4">
    <div class="flex justify-between">
      <span class="font-semibold">Order #12344</span>
      <span class="text-blue-600 font-semibold">In Transit</span>
    </div>
    <p class="text-gray-600 text-sm">Mango, Pineapple, Grapes</p>
    <p class="text-gray-500 text-sm">Arriving today</p>
  </div>
</div>
```

---

## Performance Tips

1. **Use `will-change` for smooth animations:**
   ```css
   .element-to-animate {
     will-change: transform, opacity;
   }
   ```

2. **Reduce motion on user preference:**
   The app respects `prefers-reduced-motion` - animations are disabled for users who prefer reduced motion.

3. **Combine animations strategically:**
   - Use `fm-animate-slide-up` for page entries
   - Use `fm-hover-lift` for interactive elements
   - Use `fm-stagger-container` for lists and grids

4. **Don't over-animate:**
   - Use animations to guide user attention
   - Keep animations under 500ms for snappy feel
   - Use consistent timing across similar elements

---

## Browser Support

All animations are supported in:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

For older browsers, the animations gracefully degrade to instant state changes.

---

## Accessibility

- All animations respect `prefers-reduced-motion` media query
- Animations don't interfere with keyboard navigation
- Loading states use ARIA labels
- Color animations don't rely on color alone to convey meaning

---

## Customization

To modify animation timings and easing, edit the keyframes in `src/app/app.css`:

```css
@keyframes fm-slide-up {
  from {
    opacity: 0;
    transform: translateY(16px); /* Adjust distance */
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fm-animate-slide-up {
  animation: fm-slide-up 400ms ease-out forwards; /* Adjust timing */
}
```

---

## Questions?

If you need to add custom animations, follow the pattern:
1. Create a keyframe animation in `app.css`
2. Create a utility class using the keyframe
3. Use it in your components

Happy animating! 🚀
