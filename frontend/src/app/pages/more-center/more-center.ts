import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

type MoreTab = {
  key: string;
  label: string;
  title: string;
  summary: string;
  bullets: string[];
};

type UserNotification = {
  id: string;
  title: string;
  message: string;
  tone: 'success' | 'warning' | 'danger' | 'info';
  when: string;
};

@Component({
  selector: 'app-more-center',
  imports: [RouterLink],
  templateUrl: './more-center.html',
  styles: ``,
})
export class MoreCenter implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly tabMap: Record<string, MoreTab> = {
    seller: {
      key: 'seller',
      label: 'Become a Seller',
      title: 'Seller Onboarding Program',
      summary: 'List products, manage inventory, and start selling with analytics-backed onboarding guidance.',
      bullets: [
        'Streamlined KYC and business verification flow.',
        'Catalog support with bulk upload templates.',
        'Payout and order lifecycle tracking dashboard.',
      ],
    },
    notifications: {
      key: 'notifications',
      label: 'Notification Center',
      title: 'Notification Center',
      summary: 'Track account updates, seller application status, and important service notifications.',
      bullets: [
        'Seller application updates appear here automatically.',
        'Approval and rejection outcomes are shown with timestamps.',
        'Critical account notifications are kept visible for quick action.',
      ],
    },
    care: {
      key: 'care',
      label: '24x7 Customer Care',
      title: '24x7 Customer Care Desk',
      summary: 'Get support for order status, refunds, failed payments, and delivery concerns around the clock.',
      bullets: [
        'Live support for urgent delivery and payment issues 24x7.',
        'Customer Care: 1800-208-9988 and Seller Help: 1800-119-441.',
        'Ticket tracking with fast escalation for unresolved cases.',
      ],
    },
    advertise: {
      key: 'advertise',
      label: 'Advertise on FruitMart',
      title: 'Advertising and Growth Suite',
      summary: 'Promote products through sponsored placements and campaign reports to increase visibility.',
      bullets: [
        'Ad placements on home and category pages.',
        'Campaign-level spend controls and scheduling.',
        'Performance metrics with click and conversion insights.',
      ],
    },
    postad: {
      key: 'postad',
      label: 'Post Your Ad',
      title: 'Post Your Advertisement',
      summary: 'Users and sellers can submit promotional ads for banner slots and discover pages after moderation review.',
      bullets: [
        'Submit ad title, media link, target page, and campaign dates.',
        'Each ad goes through quality and policy review before publishing.',
        'Approved ads are visible in your campaign panel with live status.',
      ],
    },
  };

  readonly tabs = Object.values(this.tabMap);
  readonly selected = signal<MoreTab>(this.tabMap['seller']);
  readonly sellerStatus = computed(() => this.auth.user()?.sellerProfile?.sellerStatus || '');
  readonly sellerReviewedAt = computed(() => this.auth.user()?.sellerProfile?.reviewedAt || this.auth.user()?.sellerProfile?.appliedAt || this.auth.user()?.createdAt || '');
  readonly sellerReason = computed(() => this.auth.user()?.sellerProfile?.rejectionReason || '');
  readonly notifications = computed<UserNotification[]>(() => {
    const status = this.sellerStatus();
    const when = this.sellerReviewedAt() ? new Date(this.sellerReviewedAt()).toLocaleString() : 'just now';

    const base: UserNotification[] = [
      {
        id: 'security-session',
        title: 'Account Security',
        message: 'Your account session and profile access are protected with role-based authorization.',
        tone: 'info',
        when: 'today',
      },
    ];

    if (status === 'pending') {
      base.unshift({
        id: 'seller-pending',
        title: 'Seller Application Under Review',
        message: 'Your seller application is under review. You can submit again only after admin approval or rejection.',
        tone: 'warning',
        when,
      });
    } else if (status === 'approved') {
      base.unshift({
        id: 'seller-approved',
        title: 'Seller Application Approved',
        message: 'Congratulations! Seller Hub is now enabled. You can add products, manage orders, and view your revenue.',
        tone: 'success',
        when,
      });
    } else if (status === 'rejected') {
      base.unshift({
        id: 'seller-rejected',
        title: 'Seller Application Rejected',
        message: this.sellerReason() ? `Reason: ${this.sellerReason()}` : 'Your seller application was rejected. Please update details and submit again.',
        tone: 'danger',
        when,
      });
    }

    return base;
  });

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.auth.refreshProfile().subscribe();
    this.route.queryParamMap.subscribe(params => {
      const key = params.get('tab') ?? 'seller';
      this.selected.set(this.tabMap[key] ?? this.tabMap['seller']);
    });
  }
}
