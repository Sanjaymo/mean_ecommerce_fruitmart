import { CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { Product } from '../../models/interfaces';

type SellerTab = 'overview' | 'products' | 'orders' | 'revenue';

type SellerStats = {
  productCount: number;
  orderCount: number;
  totalRevenue: number;
  adminFee: number;
  sellerEarnings: number;
  thisMonthRevenue: number;
  contributionPercent: number;
  shopName: string;
};

type SellerOrder = {
  _id: string;
  createdAt: string;
  status: string;
  sellerTotal: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  user?: { name?: string; email?: string } | null;
};

@Component({
  selector: 'app-seller-dashboard',
  imports: [FormsModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './seller-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerDashboard implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  tab = signal<SellerTab>('overview');
  stats = signal<SellerStats>({
    productCount: 0,
    orderCount: 0,
    totalRevenue: 0,
    adminFee: 0,
    sellerEarnings: 0,
    thisMonthRevenue: 0,
    contributionPercent: 10,
    shopName: '',
  });
  products = signal<Product[]>([]);
  orders = signal<SellerOrder[]>([]);
  loadError = signal('');

  // Product form
  showAddForm = signal(false);
  editingProductId = signal<string | null>(null);
  productForm = signal({ name: '', type: '', price: 0, image: '', description: '' });
  formError = signal('');
  formSaving = signal(false);
  deleteConfirmId = signal<string | null>(null);

  userName = computed(() => this.auth.user()?.name ?? '');
  shopName = computed(() => this.auth.user()?.sellerProfile?.shopName || this.stats().shopName || 'My Shop');
  shopPhoto = computed(() => this.auth.user()?.sellerProfile?.shopPhoto ?? '');
  userPhoto = computed(() => this.auth.user()?.sellerProfile?.userPhoto ?? '');
  shopLocation = computed(() => this.auth.user()?.sellerProfile?.shopLocation ?? '');
  contributionPct = computed(() => this.auth.user()?.sellerProfile?.contributionPercent ?? this.stats().contributionPercent);

  readonly recentOrders = computed(() => this.orders().slice(0, 5));

  readonly growthTips = [
    { icon: '📸', tip: 'Use high-quality, well-lit photos for every product listing.' },
    { icon: '🏷️', tip: 'Price competitively — check similar products and match or beat them.' },
    { icon: '📦', tip: 'Keep your product catalog fresh and remove out-of-season items.' },
    { icon: '⭐', tip: 'Maintain quality on every order to build a strong seller reputation.' },
    { icon: '📅', tip: 'List seasonal fruits early to capture demand before competitors.' },
    { icon: '💬', tip: 'Write detailed descriptions to increase buyer confidence.' },
  ];

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.auth.refreshProfile().subscribe(() => {
      this.loadDashboard();
      this.loadProducts();
      this.loadOrders();
    });
  }

  switchTab(t: SellerTab) {
    this.tab.set(t);
    this.showAddForm.set(false);
    this.formError.set('');
  }

  private loadDashboard() {
    this.api.getSellerDashboard().subscribe({
      next: data => this.stats.set(data),
      error: () => this.loadError.set('Failed to load dashboard data'),
    });
  }

  private loadProducts() {
    this.api.getSellerProducts().subscribe({
      next: data => this.products.set(data),
      error: () => {},
    });
  }

  private loadOrders() {
    this.api.getSellerOrders().subscribe({
      next: data => this.orders.set(data),
      error: () => {},
    });
  }

  openAddForm() {
    this.editingProductId.set(null);
    this.productForm.set({ name: '', type: '', price: 0, image: '', description: '' });
    this.formError.set('');
    this.showAddForm.set(true);
    this.tab.set('products');
  }

  openEditForm(product: Product) {
    this.editingProductId.set(product._id);
    this.productForm.set({
      name: product.name,
      type: product.type,
      price: product.price,
      image: product.image,
      description: product.description,
    });
    this.formError.set('');
    this.showAddForm.set(true);
  }

  cancelForm() {
    this.showAddForm.set(false);
    this.editingProductId.set(null);
    this.formError.set('');
  }

  updateFormField(field: string, value: string) {
    this.productForm.update(f => ({ ...f, [field]: field === 'price' ? Number(value) : value }));
  }

  saveProduct() {
    const f = this.productForm();
    if (!f.name.trim()) { this.formError.set('Product name is required'); return; }
    if (!f.type.trim()) { this.formError.set('Product type is required'); return; }
    if (!f.image.trim()) { this.formError.set('Image URL is required'); return; }
    if (!f.description.trim()) { this.formError.set('Description is required'); return; }
    if (f.price < 0) { this.formError.set('Price must be a positive number'); return; }

    this.formSaving.set(true);
    this.formError.set('');

    const editId = this.editingProductId();
    const obs = editId ? this.api.updateSellerProduct(editId, f) : this.api.addSellerProduct(f);

    obs.subscribe({
      next: () => {
        this.showAddForm.set(false);
        this.editingProductId.set(null);
        this.formSaving.set(false);
        this.loadProducts();
        this.loadDashboard();
      },
      error: (e: any) => {
        const firstErr = e?.error?.errors?.[0]?.msg;
        this.formError.set(firstErr || e?.error?.message || 'Failed to save product');
        this.formSaving.set(false);
      },
    });
  }

  confirmDelete(id: string) {
    this.deleteConfirmId.set(id);
  }

  cancelDelete() {
    this.deleteConfirmId.set(null);
  }

  deleteProduct(id: string) {
    this.api.deleteSellerProduct(id).subscribe({
      next: () => {
        this.deleteConfirmId.set(null);
        this.loadProducts();
        this.loadDashboard();
      },
      error: () => { this.deleteConfirmId.set(null); },
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      confirmed: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      shipped: 'bg-sky-100 text-sky-700',
      delivered: 'bg-violet-100 text-violet-700',
      cancelled: 'bg-rose-100 text-rose-700',
    };
    return map[status] ?? 'bg-slate-100 text-slate-600';
  }
}
