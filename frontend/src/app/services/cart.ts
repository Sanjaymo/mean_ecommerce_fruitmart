import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Fruit } from '../models/fruit';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly items = signal<CartItem[]>([]);

  readonly cartItems = this.items.asReadonly();

  readonly totalItems = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly totalPrice = computed(() =>
    this.items().reduce((sum, item) => sum + item.fruit.price * item.quantity, 0)
  );

  addToCart(fruit: Fruit) {
    this.items.update(items => {
      const existing = items.find(i => i.fruit.id === fruit.id);
      if (existing) {
        return items.map(i =>
          i.fruit.id === fruit.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...items, { fruit, quantity: 1 }];
    });
  }

  removeFromCart(fruitId: number) {
    this.items.update(items => items.filter(i => i.fruit.id !== fruitId));
  }

  updateQuantity(fruitId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(fruitId);
      return;
    }
    this.items.update(items =>
      items.map(i =>
        i.fruit.id === fruitId ? { ...i, quantity } : i
      )
    );
  }

  clearCart() {
    this.items.set([]);
  }
}
