import mongoose, { Document, Schema } from 'mongoose';

export interface IHeroSlide extends Document {
  imageUrl: string;
  title?: string;
  subtitle?: string;
  order: number;
  isActive: boolean;
}

const HeroSlideSchema: Schema = new Schema({
  imageUrl: { type: String, required: true },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const HeroSlide = mongoose.model<IHeroSlide>('HeroSlide', HeroSlideSchema);