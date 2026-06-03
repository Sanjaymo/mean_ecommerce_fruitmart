import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/interfaces';
import { DeliveryLocation } from '../models/interfaces';
import { runtimeConfig } from '../config/runtime-config';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly API = runtimeConfig.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Products
  getProducts(search?: string, type?: string) {
    const params: Record<string, string> = {};
    if (search) params['search'] = search;
    if (type && type !== 'All') params['type'] = type;
    return this.http.get<Product[]>(`${this.API}/products`, { params });
  }

  getProductTypes() {
    return this.http.get<string[]>(`${this.API}/products/types`);
  }

  // User profile
  getProfile() {
    return this.http.get<any>(`${this.API}/user/profile`);
  }

  updateProfile(data: { name?: string; email?: string; phone?: string; profilePhoto?: string; deliveryLocation?: DeliveryLocation | null }) {
    return this.http.put<any>(`${this.API}/user/profile`, data);
  }

  changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.http.put<any>(`${this.API}/user/change-password`, data);
  }

  setPassword(data: { newPassword: string; confirmPassword: string }) {
    return this.http.put<any>(`${this.API}/user/set-password`, data);
  }

  // Orders
  placeOrder(items: any[], totalAmount: number, deliveryLocation?: DeliveryLocation) {
    return this.http.post<any>(`${this.API}/orders`, { items, totalAmount, deliveryLocation });
  }

  getOrders() {
    return this.http.get<any[]>(`${this.API}/orders`);
  }

  // Payments
  initializePayment(orderId: string, paymentMethod: string) {
    return this.http.post<any>(`${this.API}/payments/init`, { orderId, paymentMethod });
  }

  verifyPayment(orderId: string, paymentId: string, transactionId: string, success: boolean) {
    return this.http.post<any>(`${this.API}/payments/verify`, { orderId, paymentId, transactionId, success });
  }

  getPaymentDetails(orderId: string) {
    return this.http.get<any>(`${this.API}/payments/${orderId}`);
  }

  // Admin
  getAdminStats() {
    return this.http.get<any>(`${this.API}/admin/stats`);
  }

  getUsers() {
    return this.http.get<any[]>(`${this.API}/admin/users`);
  }

  getSellers() {
    return this.http.get<any[]>(`${this.API}/admin/sellers`);
  }

  addProduct(product: Partial<Product>) {
    return this.http.post<Product>(`${this.API}/admin/products`, product);
  }

  updateProduct(id: string, product: Partial<Product>) {
    return this.http.put<Product>(`${this.API}/admin/products/${id}`, product);
  }

  deleteProduct(id: string) {
    return this.http.delete<any>(`${this.API}/admin/products/${id}`);
  }

  getAdminOrders() {
    return this.http.get<any[]>(`${this.API}/admin/orders`);
  }

  sendContactMessage(data: { name: string; email: string; subject: string; message: string }) {
    return this.http.post<any>(`${this.API}/support/contact`, data);
  }

  sendEmailToUser(userId: string, data: { subject: string; message: string }) {
    return this.http.post<any>(`${this.API}/admin/users/${userId}/send-email`, data);
  }

  sendBulkEmailToUsers(data: { userIds: string[]; subject: string; message: string }) {
    return this.http.post<any>(`${this.API}/admin/users/send-bulk-email`, data);
  }

  getEmailLogs(limit = 50) {
    return this.http.get<any[]>(`${this.API}/admin/email-logs`, { params: { limit } });
  }

  // Seller application
  applyForSeller(data: { shopName: string; shopLocation: string; shopPhoto: string; userPhoto: string; contributionPercent: number }) {
    return this.http.post<any>(`${this.API}/seller/apply`, data);
  }

  getSellerDashboard() {
    return this.http.get<any>(`${this.API}/seller/dashboard`);
  }

  getSellerProducts() {
    return this.http.get<Product[]>(`${this.API}/seller/products`);
  }

  addSellerProduct(product: Partial<Product>) {
    return this.http.post<Product>(`${this.API}/seller/products`, product);
  }

  updateSellerProduct(id: string, product: Partial<Product>) {
    return this.http.put<Product>(`${this.API}/seller/products/${id}`, product);
  }

  deleteSellerProduct(id: string) {
    return this.http.delete<any>(`${this.API}/seller/products/${id}`);
  }

  getSellerOrders() {
    return this.http.get<any[]>(`${this.API}/seller/orders`);
  }

  // Admin: seller applications
  getSellerApplications(status?: string) {
    const params: Record<string, string> = {};
    if (status) params['status'] = status;
    return this.http.get<any[]>(`${this.API}/admin/seller-applications`, { params });
  }

  approveSellerApplication(userId: string) {
    return this.http.put<any>(`${this.API}/admin/seller-applications/${userId}/approve`, {});
  }

  rejectSellerApplication(userId: string, reason: string) {
    return this.http.put<any>(`${this.API}/admin/seller-applications/${userId}/reject`, { reason });
  }
}
