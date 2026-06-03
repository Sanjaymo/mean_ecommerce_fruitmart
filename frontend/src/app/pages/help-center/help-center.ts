import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

type HelpTopic = {
  key: string;
  title: string;
  subtitle: string;
  points: string[];
  cta: string;
};

@Component({
  selector: 'app-help-center',
  imports: [RouterLink],
  templateUrl: './help-center.html',
  styles: ``,
})
export class HelpCenter {
  private readonly topicMap: Record<string, HelpTopic> = {
    delivery: {
      key: 'delivery',
      title: 'Delivery Questions',
      subtitle: 'Track ETA, slot changes, and doorstep instructions without support wait times.',
      points: [
        'Expected delivery window updates are shown in your order timeline.',
        'Slot change requests are accepted before rider assignment starts.',
        'Doorstep notes and preferred handoff instructions are supported per order.',
      ],
      cta: 'Need live help? Contact dispatch support from your order details page.',
    },
    payment: {
      key: 'payment',
      title: 'Payment Assistance',
      subtitle: 'Resolve pending transactions, failed UPI payments, and invoice issues quickly.',
      points: [
        'If payment is pending, wait 5-10 minutes before retrying to avoid duplicate capture.',
        'Failed UPI/card payments are auto-reconciled and reflected in recent payments.',
        'Invoices are generated after successful payment settlement and can be downloaded.',
      ],
      cta: 'For refund disputes, keep your transaction reference ID ready.',
    },
    returns: {
      key: 'returns',
      title: 'Returns and Issue Resolution',
      subtitle: 'Report damaged or missing products with faster replacement and refund timelines.',
      points: [
        'Claims should be raised within the active issue window on the order page.',
        'Photo evidence helps us speed up verification and approval.',
        'Eligible items can be replaced immediately or refunded to source/wallet.',
      ],
      cta: 'Use the Order History page to open a new issue in two clicks.',
    },
    business: {
      key: 'business',
      title: 'Business and Bulk Orders',
      subtitle: 'Get custom pricing, recurring schedules, and dedicated support for office purchases.',
      points: [
        'Bulk orders include quantity planning and preferred delivery windows.',
        'Monthly repeat plans can be configured for offices and institutions.',
        'Invoices and payment terms can be managed by your procurement team.',
      ],
      cta: 'Contact us with your expected monthly volume for a custom quote.',
    },
  };

  readonly topics = Object.values(this.topicMap);
  readonly selectedTopic = signal<HelpTopic>(this.topicMap['delivery']);
  readonly faqItems = [
    {
      question: 'How fast do I get a refund after a failed payment?',
      answer: 'Most reconciliations complete automatically within 24 hours. Bank/card reversals can take 2-7 business days based on payment provider timelines.',
    },
    {
      question: 'Can I change the delivery slot after placing an order?',
      answer: 'Yes, slot updates are allowed before dispatch starts. Once a rider is assigned, you can still update doorstep instructions from tracking.',
    },
    {
      question: 'What if an item is damaged or missing?',
      answer: 'Open your order details, submit an issue with optional photos, and choose refund or replacement. Our team prioritizes quality-related tickets.',
    },
  ];

  readonly supportBadges = computed(() => [
    'Customer Care: 1800-208-9988',
    'Seller Help: 1800-119-441',
    'Mail: support@fruitmart.local',
  ]);

  constructor(private readonly route: ActivatedRoute) {
    this.route.queryParamMap.subscribe((params) => {
      const topic = params.get('topic') ?? 'delivery';
      this.selectedTopic.set(this.topicMap[topic] ?? this.topicMap['delivery']);
    });
  }
}
