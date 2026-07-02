import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  name?: string;             // customer name at time of order
  phone?: string;            // customer phone at time of order
  orderItems: { name: string; qty: number; price: number; product: mongoose.Types.ObjectId }[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode?: string;
    country?: string;
  };
  totalPrice: number;
  status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered';
  paymentResult?: { id: string; status: string; update_time: string };
  paymentMethod?: 'paystack' | 'bank_transfer' | 'whatsapp';
  paymentDetails?: {
    accountNumber?: string;
    bankName?: string;
    whatsappNumber?: string;
  };
}

const OrderSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String },            // optional, but you can make it required if needed
  phone: { type: String },
  orderItems: [{
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true }
  }],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: String,
    country: String,
  },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Paid', 'Shipped', 'Delivered'], default: 'Pending' },
  paymentResult: { id: String, status: String, update_time: String },
  paymentMethod: { type: String, enum: ['paystack', 'bank_transfer', 'whatsapp'] },
  paymentDetails: {
    accountNumber: String,
    bankName: String,
    whatsappNumber: String,
  }
}, { timestamps: true });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);