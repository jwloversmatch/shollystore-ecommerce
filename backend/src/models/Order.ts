import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  name?: string;
  phone?: string;
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
  name: { type: String },
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

// ---------- Indexes ----------
OrderSchema.index({ user: 1, createdAt: -1 });        // getMyOrders – user's orders sorted by date
OrderSchema.index({ status: 1, createdAt: -1 });      // admin orders filtered by status
OrderSchema.index({ createdAt: -1 });                 // recent orders dashboard
OrderSchema.index({ 'orderItems.product': 1 });       // top products aggregation

export const Order = mongoose.model<IOrder>('Order', OrderSchema);