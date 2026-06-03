import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart.new';
import { DeliveryLocation, Product } from '../../models/interfaces';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, CurrencyPipe, NgOptimizedImage, RouterLink],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
})
export class Dashboard implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);

  searchQuery = signal('');
  selectedType = signal('All');
  types = signal<string[]>(['All']);
  products = signal<Product[]>([]);
  addedId = signal<string | null>(null);
  deliveryLocation = signal<DeliveryLocation | null>(null);
  bootstrapLoads = signal(3);

  readonly isLoading = computed(() => this.bootstrapLoads() > 0);

  filteredProducts = computed(() => {
    let items = this.products();
    const q = this.searchQuery().toLowerCase();
    const category = this.selectedType();
    if (q) items = items.filter(p => p.name.toLowerCase().includes(q));
    if (category !== 'All') {
      items = items.filter(p => {
        const pType = p.type?.toLowerCase() || '';
        if (category === 'Fruits') return pType.includes('fruit');
        if (category === 'Vegetables') return pType.includes('vegetable');
        return true;
      });
    }
    return items;
  });

  cartCount = this.cartService.totalItems;
  hasDeliveryLocation = computed(() => !!this.deliveryLocation()?.formattedAddress || (!!this.deliveryLocation()?.lat && !!this.deliveryLocation()?.lng));
  isSeller = this.auth.isSeller;
  sellerStatus = computed(() => this.auth.user()?.sellerProfile?.sellerStatus || '');
  sellerShopName = computed(() => this.auth.user()?.sellerProfile?.shopName || 'Your Seller Hub');

  ngOnInit() {
    this.auth.refreshProfile().subscribe();
    this.bootstrapLoads.set(3);
    this.api
      .getProducts()
      .pipe(finalize(() => this.finishBootstrapLoad()))
      .subscribe({ next: (p) => this.products.set(p) });
    this.api
      .getProductTypes()
      .pipe(finalize(() => this.finishBootstrapLoad()))
      .subscribe({
        next: (types) => {
          const categorized = new Set<string>();
          types.forEach((type: string) => {
            if (type && type.toLowerCase().includes('fruit')) {
              categorized.add('Fruits');
            } else if (type && type.toLowerCase().includes('vegetable')) {
              categorized.add('Vegetables');
            }
          });
          this.types.set(Array.from(['All', ...categorized]));
        }
      });
    this.api
      .getProfile()
      .pipe(finalize(() => this.finishBootstrapLoad()))
      .subscribe({
        next: (u) => this.deliveryLocation.set(u.deliveryLocation || null),
        error: () => this.deliveryLocation.set(null),
      });
  }

  private finishBootstrapLoad() {
    this.bootstrapLoads.update((count) => Math.max(0, count - 1));
  }

  onSearch(query: string) {
    this.searchQuery.set(query);
  }

  onFilterType(type: string) {
    this.selectedType.set(type);
  }

  resetFilters() {
    this.searchQuery.set('');
    this.selectedType.set('All');
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
    this.addedId.set(product._id);
    setTimeout(() => this.addedId.set(null), 1000);
  }
}
