import { Routes } from '@angular/router';

import { adminGuard, becomeSellerGuard, guestGuard, homeGuard, sellerGuard, userGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [homeGuard],
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services/services').then((m) => m.Services),
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
  },
  {
    path: 'help-center',
    loadComponent: () => import('./pages/help-center/help-center').then((m) => m.HelpCenter),
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy').then((m) => m.Privacy),
  },
  {
    path: 'terms',
    loadComponent: () => import('./pages/terms/terms').then((m) => m.Terms),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPasswordPage),
  },
  {
    path: 'verify-otp',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/verify-otp/verify-otp').then((m) => m.VerifyOtpPage),
  },
  {
    path: 'reset-password',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/reset-password/reset-password').then((m) => m.ResetPasswordPage),
  },
  {
    path: 'dashboard',
    canActivate: [userGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'cart',
    canActivate: [userGuard],
    loadComponent: () => import('./pages/cart/cart').then((m) => m.CartPage),
  },
  {
    path: 'payment/:orderId',
    canActivate: [userGuard],
    loadComponent: () => import('./pages/payment/payment').then((m) => m.PaymentPage),
  },
  {
    path: 'order-confirmation/:orderId',
    canActivate: [userGuard],
    loadComponent: () => import('./pages/order-confirmation/order-confirmation').then((m) => m.OrderConfirmationPage),
  },
  {
    path: 'order-tracking/:orderId',
    canActivate: [userGuard],
    loadComponent: () => import('./pages/order-tracking/order-tracking').then((m) => m.OrderTrackingPage),
  },
  {
    path: 'orders',
    canActivate: [userGuard],
    loadComponent: () => import('./pages/orders/orders').then((m) => m.Orders),
  },
  {
    path: 'track-order',
    canActivate: [userGuard],
    loadComponent: () => import('./pages/orders/orders').then((m) => m.Orders),
  },
  {
    path: 'profile',
    canActivate: [userGuard],
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
  },
  {
    path: 'delivery-location',
    canActivate: [userGuard],
    loadComponent: () => import('./pages/delivery-location/delivery-location').then((m) => m.DeliveryLocationPage),
  },
  {
    path: 'account-center',
    canActivate: [userGuard],
    loadComponent: () => import('./pages/account-center/account-center').then((m) => m.AccountCenter),
  },
  {
    path: 'more-center',
    canActivate: [userGuard],
    loadComponent: () => import('./pages/more-center/more-center').then((m) => m.MoreCenter),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
  },
  {
    path: 'become-seller',
    canActivate: [userGuard, becomeSellerGuard],
    loadComponent: () => import('./pages/become-seller/become-seller').then((m) => m.BecomeSeller),
  },
  {
    path: 'seller-dashboard',
    canActivate: [sellerGuard],
    loadComponent: () => import('./pages/seller-dashboard/seller-dashboard').then((m) => m.SellerDashboard),
  },
  { path: '**', redirectTo: '' },
];
