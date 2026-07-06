export interface OrderItemDetail {
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  _id: string;
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