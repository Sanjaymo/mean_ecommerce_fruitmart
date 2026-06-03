import { Component, OnInit, inject, signal } from '@angular/core';
import { CartService } from '../../services/cart.new';
import { ApiService } from '../../services/api';
import { RouterLink, Router } from '@angular/router';
import { CurrencyPipe, CommonModule, NgOptimizedImage } from '@angular/common';
import { DeliveryLocation } from '../../models/interfaces';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, CurrencyPipe, CommonModule, NgOptimizedImage],
  templateUrl: './cart.html',
  styles: ``,
})
export class CartPage implements OnInit {
  cartService = inject(CartService);
  private api = inject(ApiService);
  private router = inject(Router);

  items = this.cartService.cartItems;
  totalPrice = this.cartService.totalPrice;
  totalItems = this.cartService.totalItems;
  checkoutErr = signal('');
  checkoutLoading = signal(false);
  deliveryLocation = signal<DeliveryLocation | null>(null);

  ngOnInit() {
    this.api.getProfile().subscribe({
      next: user => this.deliveryLocation.set(user.deliveryLocation || null),
      error: () => this.deliveryLocation.set(null),
    });
  }

  increment(productId: string, currentQty: number) {
    this.cartService.updateQuantity(productId, currentQty + 1);
  }

  decrement(productId: string, currentQty: number) {
    this.cartService.updateQuantity(productId, currentQty - 1);
  }

  remove(productId: string) {
    this.cartService.removeFromCart(productId);
  }

  placeOrder() {
    this.checkoutErr.set('');
    const loc = this.deliveryLocation();
    if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') {
      this.checkoutErr.set('Please add delivery location before placing order.');
      return;
    }

    this.checkoutLoading.set(true);
    const orderItems = this.items().map(i => ({
      product: i.product._id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
      image: i.product.image,
    }));
    this.api.placeOrder(orderItems, this.totalPrice(), loc).subscribe({
      next: (order) => {
        // Navigate to payment page instead of showing success
        this.router.navigate(['/payment', order._id]);
      },
      error: err => {
        this.checkoutLoading.set(false);
        this.checkoutErr.set(err?.error?.message || 'Order could not be placed right now.');
      },
    });
  }
}
