import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.css',
})
export class OrderConfirmationPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);

  orderId = signal<string>('');
  orderDetails = signal<any>(null);
  loading = signal(true);
  error = signal('');

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
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Could not load order details.');
        this.loading.set(false);
        console.error('Error loading order:', err);
      },
    });
  }

  continueShopping() {
    this.router.navigate(['/dashboard']);
  }

  trackOrder() {
    this.router.navigate(['/order-tracking', this.orderId()]);
  }
}
