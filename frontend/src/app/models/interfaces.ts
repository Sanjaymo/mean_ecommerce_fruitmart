export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  role: 'user' | 'seller' | 'admin';
  hasPassword?: boolean;
  isGoogleUser?: boolean;
  createdAt: string;
  deliveryLocation?: DeliveryLocation;
  sellerProfile?: SellerProfile;
}

export interface SellerProfile {
  shopName: string;
  shopLocation: string;
  shopPhoto: string;
  userPhoto: string;
  contributionPercent: number;
  sellerStatus: 'pending' | 'approved' | 'rejected';
  appliedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface DeliveryLocation {
  lat: number;
  lng: number;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  formattedAddress: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Product {
  _id: string;
  name: string;
  type: string;
  price: number;
  image: string;
  description: string;
  sellerId?: string | null;
  sellerContribution?: number;
  sellerName?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  _id: string;
  user: string | { name: string; email: string };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  deliveryLocation?: DeliveryLocation;
  sellerProfile?: SellerProfile;
  createdAt: string;
}
