import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../services/cart.new';
import { ApiService } from '../../services/api';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './payment.html',
  styleUrls: ['./payment.css'],
})
export class PaymentPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  cartService = inject(CartService);

  orderId = signal<string>('');
  selectedMethod = signal<string>('');
  processingPayment = signal(false);
  paymentError = signal('');
  orderDetails = signal<any>({
    _id: '',
    items: [],
    totalAmount: 0,
    deliveryLocation: {},
    createdAt: new Date(),
  });
  orderLoading = signal(true);

  paymentMethods = [
    { id: 'upi', name: 'UPI', icon: '📱', description: 'Pay using UPI apps' },
    { id: 'netbanking', name: 'Net Banking', icon: '🏦', description: 'Direct bank transfer' },
    { id: 'card', name: 'Debit/Credit Card', icon: '💳', description: 'Visa, Mastercard, Amex' },
    { id: 'cod', name: 'Cash on Delivery', icon: '💵', description: 'Pay when you receive' },
  ];

  isPaymentDisabled = computed(() => {
    return !this.selectedMethod() || this.processingPayment() || !this.orderId();
  });

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = params['orderId'];
      if (id) {
        this.orderId.set(id);
        this.loadOrderDetails(id);
      } else {
        this.router.navigate(['/cart']);
      }
    });
  }

  loadOrderDetails(orderId: string) {
    // Try to load full order details, but don't fail if endpoint is not available
    this.api.getPaymentDetails(orderId).subscribe({
      next: (data) => {
        if (data && data.order) {
          this.orderDetails.set(data.order);
        }
        this.orderLoading.set(false);
        console.log('✓ Order details loaded successfully:', data?.order);
      },
      error: (err) => {
        // Use the orderId we have - this allows payment to proceed even if details endpoint fails
        // Don't set error message - just fail silently and use the orderId
        this.orderDetails.update(current => ({
          ...current,
          _id: orderId,
        }));
        this.orderLoading.set(false);
        // Don't show error message here - payment can proceed with just the orderId
        console.log('ℹ Using orderId directly, full details not available:', orderId);
      },
    });
  }

  selectPaymentMethod(method: string) {
    this.selectedMethod.set(method);
    this.paymentError.set('');
    console.log('Selected payment method:', method);
  }

  processPayment() {
    const method = this.selectedMethod();
    const orderId = this.orderId();

    if (!method) {
      this.paymentError.set('Please select a payment method');
      console.error('No payment method selected');
      return;
    }

    if (!orderId) {
      this.paymentError.set('Order ID is missing. Please go back and try again.');
      console.error('No order ID found');
      return;
    }

    this.processingPayment.set(true);
    this.paymentError.set('');
    console.log('Processing payment for orderId:', orderId, 'method:', method);

    // Initialize payment
    this.api.initializePayment(orderId, method).subscribe({
      next: (response) => {
        console.log('Payment initialized:', response);
        if (method === 'cod') {
          // For COD, payment is automatically confirmed
          this.navigateToConfirmation(orderId);
        } else {
          // For online payments, show payment gateway
          this.simulateOnlinePayment(orderId, response.paymentId, response.transactionId);
        }
      },
      error: (err) => {
        this.processingPayment.set(false);
        const errorMsg = err?.error?.message || 'Payment initialization failed. Please try again.';
        this.paymentError.set(errorMsg);
        console.error('Payment init error:', err);
      },
    });
  }

  simulateOnlinePayment(orderId: string, paymentId: string, transactionId: string) {
    // Simulate payment processing delay
    setTimeout(() => {
      // You can add a modal or payment gateway integration here
      // For now, we'll simulate successful payment with 80% success rate
      const isSuccess = Math.random() > 0.2;
      console.log('Payment simulation result:', isSuccess ? 'SUCCESS' : 'FAILED');

      this.api.verifyPayment(orderId, paymentId, transactionId, isSuccess).subscribe({
        next: (response) => {
          console.log('Payment verified:', response);
          if (isSuccess) {
            this.navigateToConfirmation(orderId);
          } else {
            this.processingPayment.set(false);
            this.paymentError.set('Payment declined. Please try another payment method.');
            this.selectedMethod.set('');
          }
        },
        error: (err) => {
          this.processingPayment.set(false);
          const errorMsg = err?.error?.message || 'Payment verification failed. Please try again.';
          this.paymentError.set(errorMsg);
          console.error('Payment verify error:', err);
        },
      });
    }, 2000);
  }

  navigateToConfirmation(orderId: string) {
    this.cartService.clearCart();
    this.router.navigate(['/order-confirmation', orderId]);
  }

  goBack() {
    this.router.navigate(['/cart']);
  }
}
