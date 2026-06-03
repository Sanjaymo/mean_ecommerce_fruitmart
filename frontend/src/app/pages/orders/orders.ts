import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { Order } from '../../models/interfaces';

@Component({
  selector: 'app-orders',
  imports: [CurrencyPipe, DatePipe, NgOptimizedImage, RouterLink],
  templateUrl: './orders.html',
})
export class Orders implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  orders = signal<Order[]>([]);
  isLoading = signal(true);
  trackingOrderId = signal<string | null>(null);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.api.getOrders().subscribe({
      next: o => {
        this.orders.set(o);
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      },
    });
  }

  toggleTracking(orderId: string) {
    this.trackingOrderId.update(current => (current === orderId ? null : orderId));
  }

  isTrackingOpen(orderId: string) {
    return this.trackingOrderId() === orderId;
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'delivered':
        return 'bg-blue-100 text-blue-700';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-700';
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }

  getProgressPercent(status: string) {
    switch (status) {
      case 'pending':
        return 20;
      case 'confirmed':
        return 45;
      case 'shipped':
        return 75;
      case 'delivered':
      case 'cancelled':
        return 100;
      default:
        return 25;
    }
  }

  getEstimatedDelivery(createdAt: string, status: string) {
    const base = new Date(createdAt);
    if (status === 'delivered' || status === 'cancelled') {
      return base;
    }

    const eta = new Date(base);
    if (status === 'shipped') {
      eta.setDate(eta.getDate() + 1);
    } else if (status === 'confirmed') {
      eta.setDate(eta.getDate() + 2);
    } else {
      eta.setDate(eta.getDate() + 3);
    }

    return eta;
  }

  getTrackingTimeline(order: Order) {
    if (order.status === 'cancelled') {
      return [
        {
          label: 'Order placed',
          description: 'Your order has been created in FruitMart.',
          date: new Date(order.createdAt),
          complete: true,
          current: false,
        },
        {
          label: 'Order cancelled',
          description: 'The order was cancelled before dispatch.',
          date: new Date(order.createdAt),
          complete: true,
          current: true,
        },
      ];
    }

    const statusRank: Record<string, number> = {
      pending: 1,
      confirmed: 2,
      shipped: 3,
      delivered: 4,
    };

    const rank = statusRank[order.status] ?? 1;
    const createdDate = new Date(order.createdAt);

    return [
      {
        label: 'Order placed',
        description: 'Order received and queued for processing.',
        date: createdDate,
        complete: true,
        current: rank === 1,
      },
      {
        label: 'Order confirmed',
        description: 'Items verified and payment validated.',
        date: this.addHours(createdDate, 2),
        complete: rank >= 2,
        current: rank === 2,
      },
      {
        label: 'Shipped',
        description: 'Package dispatched from local hub.',
        date: this.addDays(createdDate, 1),
        complete: rank >= 3,
        current: rank === 3,
      },
      {
        label: 'Delivered',
        description: 'Order delivered to your doorstep.',
        date: this.addDays(createdDate, 2),
        complete: rank >= 4,
        current: rank === 4,
      },
    ];
  }

  private addHours(source: Date, hours: number) {
    const next = new Date(source);
    next.setHours(next.getHours() + hours);
    return next;
  }

  private addDays(source: Date, days: number) {
    const next = new Date(source);
    next.setDate(next.getDate() + days);
    return next;
  }
}
