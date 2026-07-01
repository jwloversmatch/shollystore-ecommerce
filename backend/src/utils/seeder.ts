import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product';

dotenv.config();

const products = [
  { 
    name: 'Fresh Tomato Juice', 
    slug: 'fresh-tomato-juice', 
    price: 2500, 
    category: 'Juices', 
    images: ['https://via.placeholder.com/150?text=Tomato'], 
    stock: 20, 
    isFeatured: true,
    description: 'Freshly squeezed tomatoes, rich in vitamins and antioxidants.'
  },
  { 
    name: 'Organic Apple Juice', 
    slug: 'organic-apple-juice', 
    price: 3000, 
    category: 'Juices', 
    images: ['https://via.placeholder.com/150?text=Apple'], 
    stock: 15, 
    isFeatured: true,
    description: 'Cold-pressed from organic apples, naturally sweet and refreshing.'
  },
  { 
    name: 'Green Detox Blend', 
    slug: 'green-detox-blend', 
    price: 3500, 
    category: 'Beverages', 
    images: ['https://via.placeholder.com/150?text=Detox'], 
    stock: 10, 
    isFeatured: false,
    description: 'A powerful blend of spinach, kale, cucumber, and ginger.'
  },
  { 
    name: 'Mango Smoothie', 
    slug: 'mango-smoothie', 
    price: 2800, 
    category: 'Juices', 
    images: ['https://via.placeholder.com/150?text=Mango'], 
    stock: 12, 
    isFeatured: true,
    description: 'Creamy mango smoothie with a hint of lime, perfect for hot days.'
  },
  { 
    name: 'Berry Boost', 
    slug: 'berry-boost', 
    price: 3200, 
    category: 'Beverages', 
    images: ['https://via.placeholder.com/150?text=Berry'], 
    stock: 8, 
    isFeatured: false,
    description: 'Mixed berries with a touch of honey, packed with antioxidants.'
  },
  { 
    name: 'Fresh Broccoli', 
    slug: 'fresh-broccoli', 
    price: 1500, 
    category: 'Vegetables', 
    images: ['https://via.placeholder.com/150?text=Broccoli'], 
    stock: 25, 
    isFeatured: true,
    description: 'Organic broccoli florets, perfect for stir-fries or steaming.'
  },
  { 
    name: 'Red Bell Pepper', 
    slug: 'red-bell-pepper', 
    price: 1200, 
    category: 'Vegetables', 
    images: ['https://via.placeholder.com/150?text=Pepper'], 
    stock: 30, 
    isFeatured: false,
    description: 'Sweet and crunchy red bell peppers, great for salads or roasting.'
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    await Product.deleteMany(); // Clear existing data
    await Product.insertMany(products);
    console.log('✅ Products seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();