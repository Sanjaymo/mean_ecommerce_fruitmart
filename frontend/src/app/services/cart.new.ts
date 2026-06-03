import { Injectable, signal, computed } from '@angular/core';
import { Product, CartItem } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly items = signal<CartItem[]>([]);

  readonly cartItems = this.items.asReadonly();
  readonly totalItems = computed(() => this.items().reduce((s, i) => s + i.quantity, 0));
  readonly totalPrice = computed(() => this.items().reduce((s, i) => s + i.product.price * i.quantity, 0));

  addToCart(product: Product) {
    this.items.update(items => {
      const existing = items.find(i => i.product._id === product._id);
      if (existing) {
        return items.map(i => i.product._id === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...items, { product, quantity: 1 }];
    });
  }

  removeFromCart(productId: string) {
    this.items.update(items => items.filter(i => i.product._id !== productId));
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) { this.removeFromCart(productId); return; }
    this.items.update(items => items.map(i => i.product._id === productId ? { ...i, quantity } : i));
  }

  clearCart() {
    this.items.set([]);
  }
}
