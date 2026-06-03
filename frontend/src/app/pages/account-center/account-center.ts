import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

type AccountTab = {
  key: string;
  label: string;
  title: string;
  summary: string;
  bullets: string[];
};

@Component({
  selector: 'app-account-center',
  imports: [RouterLink],
  templateUrl: './account-center.html',
  styles: ``,
})
export class AccountCenter implements OnInit {
  private readonly tabMap: Record<string, AccountTab> = {
    coupons: {
      key: 'coupons',
      label: 'Coupons',
      title: 'Coupons and Deals',
      summary: 'Apply active discount codes, review upcoming offers, and track coupon usage across recent orders.',
      bullets: [
        'Auto-applies best eligible coupon at checkout.',
        'Shows expiration schedule for all saved deals.',
        'Includes category-specific offers for fruits and essentials.',
      ],
    },
    supercoin: {
      key: 'supercoin',
      label: 'SuperCoins',
      title: 'Supercoin Rewards',
      summary: 'Reward points summary from orders, referrals, and festive campaigns with redemption guidance.',
      bullets: [
        'Estimated coin balance updates after order confirmation.',
        'Monthly reward history with earned versus redeemed insights.',
        'Suggested reward bundles based on shopping behavior.',
      ],
    },
    plus: {
      key: 'plus',
      label: 'FruitMart Plus Zone',
      title: 'FruitMart Plus Zone',
      summary: 'Premium benefits, faster delivery windows, and exclusive access to limited-time grocery bundles.',
      bullets: [
        'Early access to high-demand daily fresh stock.',
        'Priority customer support queue for Plus members.',
        'Member-only savings on bulk purchases and subscriptions.',
      ],
    },
    wallet: {
      key: 'wallet',
      label: 'Saved Cards and Wallet',
      title: 'Wallet and Saved Payments',
      summary: 'Securely manage payment methods, set a default card, and check wallet transactions in one place.',
      bullets: [
        'Tokenized card storage with masked card details.',
        'Wallet ledger for credits, debits, and refunds.',
        'One-click payment preference for faster checkout.',
      ],
    },
    addresses: {
      key: 'addresses',
      label: 'Saved Addresses',
      title: 'Saved Delivery Addresses',
      summary: 'Maintain home, work, and family delivery locations with area validation for accurate dispatch.',
      bullets: [
        'Address labels for home, office, and other.',
        'Serviceability check before final order placement.',
        'Preferred slot hints per saved location.',
      ],
    },
    wishlist: {
      key: 'wishlist',
      label: 'Wishlist',
      title: 'Wishlist and Reminders',
      summary: 'Save items for later and get notified when products are back in stock or price drops occur.',
      bullets: [
        'Quick move from wishlist to cart.',
        'Stock return and price-drop alerts.',
        'Seasonal recommendation set built from wishlist trends.',
      ],
    },
    giftcards: {
      key: 'giftcards',
      label: 'Gift Cards',
      title: 'Gift Cards and Voucher Support',
      summary: 'Purchase, redeem, and monitor gift cards for personal and corporate gifting use-cases.',
      bullets: [
        'Multiple denomination choices with instant delivery.',
        'Corporate gifting support for bulk voucher orders.',
        'Redemption history and balance visibility in one dashboard.',
      ],
    },
  };

  readonly tabs = Object.values(this.tabMap);
  readonly selected = signal<AccountTab>(this.tabMap['coupons']);

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const key = params.get('tab') ?? 'coupons';
      this.selected.set(this.tabMap[key] ?? this.tabMap['coupons']);
    });
  }
}
