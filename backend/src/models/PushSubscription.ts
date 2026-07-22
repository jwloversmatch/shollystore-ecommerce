import mongoose, { Document, Schema } from 'mongoose';

export interface IPushSubscription extends Document {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: mongoose.Types.ObjectId;   // optional: link to a user
  createdAt: Date;
}

const pushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth:   { type: String, required: true },
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  },
  { timestamps: true }
);

export const PushSubscriptionModel = mongoose.model<IPushSubscription>(
  'PushSubscription',
  pushSubscriptionSchema
);