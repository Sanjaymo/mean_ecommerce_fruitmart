import { CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { Product } from '../../models/interfaces';

type AdminTab = 'overview' | 'products' | 'users' | 'orders' | 'emails' | 'sellers';

type AdminStats = {
  userCount: number;
  productCount: number;
  orderCount: number;
  totalRevenue: number;
  sellerCount: number;
};

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
};

type AdminSeller = AdminUser & {
  role: 'user' | 'seller' | 'admin';
  sellerProfile?: {
    shopName?: string;
    shopLocation?: string;
    shopPhoto?: string;
    userPhoto?: string;
    contributionPercent?: number;
    sellerStatus?: 'pending' | 'approved' | 'rejected';
    appliedAt?: string;
    reviewedAt?: string;
    rejectionReason?: string;
  };
};

type AdminOrderItem = {
  name: string;
  quantity: number;
};

type AdminOrder = {
  _id: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  items: AdminOrderItem[];
  user?: {
    name?: string;
    email?: string;
  } | null;
};

type AdminEmailRecipient = {
  user?: string;
  name: string;
  email: string;
  status: 'sent' | 'failed';
  error?: string;
};

type AdminEmailLog = {
  _id: string;
  type: 'direct' | 'campaign';
  subject: string;
  message: string;
  recipients: AdminEmailRecipient[];
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  admin?: {
    name?: string;
    email?: string;
  } | null;
};

@Component({
  selector: 'app-admin-dashboard',
  imports: [FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboard implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  tab = signal<AdminTab>('overview');
  stats = signal<AdminStats>({ userCount: 0, productCount: 0, orderCount: 0, totalRevenue: 0, sellerCount: 0 });
  users = signal<AdminUser[]>([]);
  sellers = signal<AdminSeller[]>([]);
  products = signal<Product[]>([]);
  orders = signal<AdminOrder[]>([]);
  emailLogs = signal<AdminEmailLog[]>([]);
  loadError = signal('');

  // Add product form
  showAddForm = signal(false);
  newProduct = signal({ name: '', type: '', price: 0, image: '', description: '' });
  formError = signal('');
  editingProductId = signal<string | null>(null);
  editingPrice = signal<number>(0);

  // Single user email
  emailForm = signal({ userId: '', userName: '', userEmail: '', subject: '', message: '' });
  emailSending = signal(false);
  emailStatus = signal('');
  emailError = signal('');

  // Bulk campaign
  selectedUserIds = signal<string[]>([]);
  bulkEmailForm = signal({ subject: '', message: '' });
  bulkEmailSending = signal(false);
  bulkEmailStatus = signal('');
  bulkEmailError = signal('');

  // Logs
  emailLogsLoading = signal(false);
  // Seller applications
  sellerApplications = signal<any[]>([]);
  sellerFilter = signal<'pending' | 'approved' | 'rejected'>('pending');
  sellerActionLoading = signal(false);
  sellerActionMsg = signal('');
  sellerActionError = signal('');
  rejectingId = signal<string | null>(null);
  rejectReason = signal('');

  readonly averageOrderValue = computed(() => {
    const { orderCount, totalRevenue } = this.stats();
    return orderCount ? totalRevenue / orderCount : 0;
  });

  readonly revenuePerUser = computed(() => {
    const { userCount, totalRevenue } = this.stats();
    return userCount ? totalRevenue / userCount : 0;
  });

  readonly confirmedRate = computed(() => {
    const allOrders = this.orders();
    if (!allOrders.length) return 0;
    const confirmed = allOrders.filter(order => order.status === 'confirmed').length;
    return Math.round((confirmed / allOrders.length) * 100);
  });

  readonly categoryMix = computed(() => {
    const counts = new Map<string, number>();

    for (const product of this.products()) {
      const label = product.type?.trim() || 'Uncategorized';
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 4);
  });

  readonly recentUsers = computed(() => this.users().slice(0, 5));
  readonly recentOrders = computed(() => this.orders().slice(0, 5));
  readonly recentSellers = computed(() => this.sellers().slice(0, 6));

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadStats();
    this.loadProducts();
    this.loadUsers();
    this.loadSellers();
    this.loadOrders();
    this.loadEmailLogs();
    this.loadSellerApplications();
  }

  loadStats() {
    this.api.getAdminStats().subscribe({
      next: s => {
        this.loadError.set('');
        this.stats.set(s);
      },
      error: err => this.handleProtectedLoadError(err),
    });
  }

  loadProducts() {
    this.api.getProducts().subscribe({
      next: p => this.products.set(p),
      error: () => this.loadError.set('Failed to load products'),
    });
  }

  loadUsers() {
    this.api.getUsers().subscribe({
      next: u => {
        this.loadError.set('');
        this.users.set(u);
      },
      error: err => this.handleProtectedLoadError(err),
    });
  }

  loadOrders() {
    this.api.getAdminOrders().subscribe({
      next: o => {
        this.loadError.set('');
        this.orders.set(o);
      },
      error: err => this.handleProtectedLoadError(err),
    });
  }

  loadEmailLogs() {
    this.emailLogsLoading.set(true);
    this.api.getEmailLogs().subscribe({
      next: logs => {
        this.emailLogs.set(logs);
        this.emailLogsLoading.set(false);
      },
      error: () => {
        this.emailLogsLoading.set(false);
      },
    });
  }

  switchTab(t: AdminTab) {
    this.tab.set(t);
    if (t === 'users') this.loadUsers();
    if (t === 'sellers') {
      this.loadSellers();
      this.loadSellerApplications();
    }
    if (t === 'orders') this.loadOrders();
    if (t === 'products') this.loadProducts();
    if (t === 'emails') this.loadEmailLogs();
    if (t === 'overview') {
      this.loadStats();
      this.loadUsers();
      this.loadSellers();
      this.loadOrders();
      this.loadProducts();
      this.loadEmailLogs();
    }
  }

  loadSellers() {
    this.api.getSellers().subscribe({
      next: (sellers: AdminSeller[]) => this.sellers.set(sellers),
      error: err => this.handleProtectedLoadError(err),
    });
  }

  addProduct() {
    const p = this.newProduct();
    if (!p.name || !p.type || !p.price || !p.image || !p.description) {
      this.formError.set('All fields are required');
      return;
    }
    this.api.addProduct(p).subscribe({
      next: () => {
        this.showAddForm.set(false);
        this.newProduct.set({ name: '', type: '', price: 0, image: '', description: '' });
        this.loadProducts();
        this.loadStats();
      },
      error: () => this.formError.set('Failed to add product'),
    });
  }

  deleteProduct(id: string) {
    this.api.deleteProduct(id).subscribe({
      next: () => {
        this.loadProducts();
        this.loadStats();
      },
      error: () => this.formError.set('Failed to delete product'),
    });
  }

  startEditPrice(product: Product) {
    this.formError.set('');
    this.editingProductId.set(product._id);
    this.editingPrice.set(product.price);
  }

  cancelEditPrice() {
    this.editingProductId.set(null);
    this.editingPrice.set(0);
  }

  savePrice(product: Product) {
    const nextPrice = Number(this.editingPrice());
    if (!Number.isFinite(nextPrice) || nextPrice < 0) {
      this.formError.set('Price must be a valid number greater than or equal to 0');
      return;
    }

    this.api.updateProduct(product._id, { price: nextPrice }).subscribe({
      next: () => {
        this.cancelEditPrice();
        this.loadProducts();
        this.loadStats();
      },
      error: () => this.formError.set('Failed to update product price'),
    });
  }

  getInitials(name: string) {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  getOrderItemSummary(items: AdminOrderItem[]) {
    return items.reduce((count, item) => count + item.quantity, 0);
  }

  openEmailComposer(user: AdminUser) {
    this.emailError.set('');
    this.emailStatus.set('');
    this.emailForm.set({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      subject: '',
      message: '',
    });
  }

  closeEmailComposer() {
    this.emailForm.set({ userId: '', userName: '', userEmail: '', subject: '', message: '' });
    this.emailError.set('');
    this.emailStatus.set('');
  }

  isUserSelected(userId: string) {
    return this.selectedUserIds().includes(userId);
  }

  toggleUserSelection(userId: string) {
    const selected = this.selectedUserIds();
    if (selected.includes(userId)) {
      this.selectedUserIds.set(selected.filter((id) => id !== userId));
      return;
    }
    this.selectedUserIds.set([...selected, userId]);
  }

  selectAllUsers() {
    this.selectedUserIds.set(this.users().map((u) => u._id));
  }

  clearSelectedUsers() {
    this.selectedUserIds.set([]);
  }

  sendBulkCampaign() {
    const form = this.bulkEmailForm();
    const userIds = this.selectedUserIds();

    this.bulkEmailError.set('');
    this.bulkEmailStatus.set('');

    if (!userIds.length) {
      this.bulkEmailError.set('Select at least one user for campaign');
      return;
    }

    if (!form.subject.trim() || !form.message.trim()) {
      this.bulkEmailError.set('Subject and message are required');
      return;
    }

    this.bulkEmailSending.set(true);
    this.api.sendBulkEmailToUsers({
      userIds,
      subject: form.subject.trim(),
      message: form.message.trim(),
    }).subscribe({
      next: (res) => {
        this.bulkEmailStatus.set(res?.message || 'Campaign sent');
        this.bulkEmailSending.set(false);
        this.bulkEmailForm.set({ subject: '', message: '' });
        this.clearSelectedUsers();
        this.loadEmailLogs();
      },
      error: (err) => {
        this.bulkEmailError.set(err.error?.message || err.error?.errors?.[0]?.msg || 'Failed to send campaign');
        this.bulkEmailSending.set(false);
      },
    });
  }

  sendEmailToUser() {
    const form = this.emailForm();
    if (!form.userId || !form.subject.trim() || !form.message.trim()) {
      this.emailError.set('Subject and message are required');
      return;
    }

    this.emailSending.set(true);
    this.emailError.set('');
    this.emailStatus.set('');

    this.api.sendEmailToUser(form.userId, {
      subject: form.subject.trim(),
      message: form.message.trim(),
    }).subscribe({
      next: (res) => {
        this.emailStatus.set(res?.message || 'Email sent successfully');
        this.emailSending.set(false);
        this.loadEmailLogs();
      },
      error: (err) => {
        this.emailError.set(err.error?.message || err.error?.errors?.[0]?.msg || 'Failed to send email');
        this.emailSending.set(false);
      },
    });
  }

  loadSellerApplications() {
    this.api.getSellerApplications(this.sellerFilter()).subscribe({
      next: (apps: any[]) => this.sellerApplications.set(apps),
      error: () => {},
    });
  }

  switchSellerFilter(filter: 'pending' | 'approved' | 'rejected') {
    this.sellerFilter.set(filter);
    this.loadSellerApplications();
  }

  approveSeller(userId: string) {
    this.sellerActionLoading.set(true);
    this.sellerActionMsg.set('');
    this.sellerActionError.set('');
    this.api.approveSellerApplication(userId).subscribe({
      next: () => {
        this.sellerActionMsg.set('Seller approved successfully');
        this.sellerActionLoading.set(false);
        this.loadSellers();
        this.loadSellerApplications();
        this.loadStats();
      },
      error: (err: any) => {
        this.sellerActionError.set(err.error?.message || 'Failed to approve');
        this.sellerActionLoading.set(false);
      },
    });
  }

  startRejectSeller(userId: string) {
    this.rejectingId.set(userId);
    this.rejectReason.set('');
    this.sellerActionMsg.set('');
    this.sellerActionError.set('');
  }

  cancelRejectSeller() {
    this.rejectingId.set(null);
    this.rejectReason.set('');
  }

  confirmRejectSeller() {
    const userId = this.rejectingId();
    if (!userId) return;
    this.sellerActionLoading.set(true);
    this.api.rejectSellerApplication(userId, this.rejectReason()).subscribe({
      next: () => {
        this.sellerActionMsg.set('Application rejected');
        this.sellerActionLoading.set(false);
        this.rejectingId.set(null);
        this.loadSellers();
        this.loadSellerApplications();
        this.loadStats();
      },
      error: (err: any) => {
        this.sellerActionError.set(err.error?.message || 'Failed to reject');
        this.sellerActionLoading.set(false);
      },
    });
  }

  private handleProtectedLoadError(err: { status?: number }) {
    if (err.status === 401) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadError.set('Failed to load admin data');
  }
}
