import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  orderItems: { name: string; qty: number; price: number; product: mongoose.Types.ObjectId }[];
  totalPrice: number;
  status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered';
  paymentResult?: { id: string; status: string; update_time: string };
  // ✅ New fields for multiple payment methods
  paymentMethod?: 'paystack' | 'bank_transfer' | 'whatsapp';
  paymentDetails?: {
    accountNumber?: string;
    bankName?: string;
    whatsappNumber?: string;
  };
}

const OrderSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [{
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true }
  }],
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Paid', 'Shipped', 'Delivered'], default: 'Pending' },
  paymentResult: { id: String, status: String, update_time: String },
  // ✅ New schema fields
  paymentMethod: { type: String, enum: ['paystack', 'bank_transfer', 'whatsapp'] },
  paymentDetails: {
    accountNumber: String,
    bankName: String,
    whatsappNumber: String,
  }
}, { timestamps: true });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);