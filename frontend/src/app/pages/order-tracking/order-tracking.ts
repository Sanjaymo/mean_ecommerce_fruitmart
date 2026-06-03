import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { CommonModule, CurrencyPipe } from '@angular/common';

interface OrderStatus {
  status: string;
  timestamp: Date;
  description: string;
  icon: string;
  completed: boolean;
}

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.css',
})
export class OrderTrackingPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);

  orderId = signal<string>('');
  orderDetails = signal<any>(null);
  loading = signal(true);
  error = signal('');

  statusTimeline = signal<OrderStatus[]>([]);

  allStatuses = {
    pending: { description: 'Order Placed', icon: '📋' },
    confirmed: { description: 'Order Confirmed', icon: '✅' },
    shipped: { description: 'Shipped', icon: '📦' },
    delivered: { description: 'Delivered', icon: '🚚' },
    cancelled: { description: 'Cancelled', icon: '❌' },
  };

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = params['orderId'];
      if (id) {
        this.orderId.set(id);
        this.loadOrderDetails(id);
      } else {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  loadOrderDetails(orderId: string) {
    this.api.getPaymentDetails(orderId).subscribe({
      next: (data) => {
        this.orderDetails.set(data.order);
        this.generateTimeline(data.order);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Could not load order details.');
        this.loading.set(false);
        console.error('Error loading order:', err);
      },
    });
  }

  generateTimeline(order: any): void {
    const statuses: OrderStatus[] = [];
    const createdDate = new Date(order.createdAt);

    // Add order placed status
    statuses.push({
      status: 'pending',
      timestamp: createdDate,
      description: 'Order Placed',
      icon: '📋',
      completed: true,
    });

    // Add confirmed status (assumed 1 hour after placing)
    const confirmedDate = new Date(createdDate.getTime() + 60 * 60 * 1000);
    statuses.push({
      status: 'confirmed',
      timestamp: confirmedDate,
      description: 'Order Confirmed',
      icon: '✅',
      completed: order.status !== 'pending',
    });

    // Add shipped status (assumed 1 day after confirmation)
    const shippedDate = new Date(confirmedDate.getTime() + 24 * 60 * 60 * 1000);
    statuses.push({
      status: 'shipped',
      timestamp: shippedDate,
      description: 'Shipped',
      icon: '📦',
      completed: ['shipped', 'delivered'].includes(order.status),
    });

    // Add delivered status (assumed 2-3 days after shipping)
    const deliveredDate = new Date(shippedDate.getTime() + 2 * 24 * 60 * 60 * 1000);
    statuses.push({
      status: 'delivered',
      timestamp: deliveredDate,
      description: 'Delivered',
      icon: '🚚',
      completed: order.status === 'delivered',
    });

    this.statusTimeline.set(statuses);
  }

  getStatusBadgeColor(status: string): string {
    switch (status) {
      case 'confirmed':
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  continueShopping() {
    this.router.navigate(['/dashboard']);
  }

  goBackToOrders() {
    this.router.navigate(['/orders']);
  }
}
