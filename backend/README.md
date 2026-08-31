# Sholex E-Commerce Platform

A full-featured e-commerce store with PWA, guest checkout, order tracking, marketing emails, coupons, and a complete admin dashboard.

## ✨ Features

- 🛍️ Product browsing with search, filters, and pagination
- 🛒 Cart & guest checkout
- 💳 Payment via Paystack, bank transfer, and WhatsApp
- 📦 Order management with user‑friendly tracking numbers
- 👤 Customer accounts, addresses, order history, and profile management
- 📧 Marketing emails (welcome, order confirmation, shipping updates, low stock alerts)
- 🏷️ Coupon / discount system
- 🧑‍💼 Admin dashboard with analytics, user management, inventory, and settings
- 📱 Progressive Web App (installable, offline support, push notifications)
- 🌙 Dark mode and responsive design
- ♿ Accessibility improvements (focus traps, aria labels, live regions)

## 🧰 Tech Stack

**Frontend:**
- React (Vite + TypeScript)
- Redux Toolkit & RTK Query
- Tailwind CSS
- Framer Motion
- React Router

**Backend:**
- Node.js + Express (TypeScript)
- MongoDB + Mongoose
- JWT authentication
- Brevo (email)
- Paystack (payments)
- Cloudinary (image storage)
- Web Push (VAPID)

## 📁 Project Structure
ecommerce-app/
├── frontend/ # React frontend
└── backend/ # Express API


## 🚀 Setup Instructions

### Prerequisites

- Node.js v18+ and npm
- MongoDB database (local or Atlas)
- Cloudinary account
- Paystack account
- Brevo account

### Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend