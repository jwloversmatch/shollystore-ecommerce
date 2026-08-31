import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { User } from '../models/User';

export const createTestProduct = async (overrides: any = {}) => {
  const productData = {
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test description',
    price: 5000,
    images: ['image.jpg'],
    stock: 10,
    category: new mongoose.Types.ObjectId(),
    isActive: true,
    ...overrides,
  };
  return await Product.create(productData);
};

export const createTestUser = async (overrides: any = {}) => {
  const userData = {
    email: 'test@example.com',
    password: 'Password123',
    name: 'Test User',
    isVerified: true,
    ...overrides,
  };
  return await User.create(userData);
};