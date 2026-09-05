export interface OrderItemDetail {
  name: string;
  qty: number;
  price: number;
  product?: string;
  image?: string;
  variant?: {
    sku?: string;
    color?: string;
    size?: string;
  };
}

export interface Order {
  _id: string;
  trackingNumber?: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  orderItems: OrderItemDetail[];
  shippingAddress?: {
    address: string;
    city: string;
    postalCode?: string;
    country?: string;
  };
  paymentMethod?: string;
  name?: string;
  phone?: string;
  couponCode?: string;
  discount?: number;
  shippingFee?: number;
  email?: string;
  guestEmail?: string;
}

export interface IAddress {
  _id: string;
  label: string;
  address: string;
  city: string;
  postalCode?: string;
  country?: string;
  isDefault: boolean;
}
