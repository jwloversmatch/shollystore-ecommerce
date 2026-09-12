// src/routes/lazyPages.ts
import { lazy } from "react";

export const Home = lazy(() => import(/* webpackPrefetch: true */ "../pages/Home"));
export const Cart = lazy(() => import("../pages/Cart"));
export const Checkout = lazy(() => import("../pages/Checkout"));
export const Login = lazy(() => import("../pages/Login"));
export const Register = lazy(() => import("../pages/Register"));
export const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
export const ResetPassword = lazy(() => import("../pages/ResetPassword"));
export const VerifyEmail = lazy(() => import("../pages/VerifyEmail"));
export const Account = lazy(() => import("../pages/Account"));
export const ProductDetail = lazy(() => import("../pages/ProductDetail"));
export const ShopPage = lazy(() => import("../pages/ShopPage"));
export const TrackOrder = lazy(() => import("../pages/TrackOrder"));

// Admin pages
export const Dashboard = lazy(() => import("../pages/admin/dashboard/"));
export const Products = lazy(() => import("../pages/admin/products/"));
export const Orders = lazy(() => import("../pages/admin/orders/"));
export const HeroSlides = lazy(() => import("../pages/admin/HeroSlides"));
export const Categories = lazy(() => import("../pages/admin/categories/"));
export const Coupons = lazy(() => import("../pages/admin/Coupons"));
export const Reviews = lazy(() => import("../pages/admin/reviews/ReviewsPage"));
export const LegalPages = lazy(() => import("../pages/admin/LegalPages"));
export const UsersPage = lazy(() => import("../pages/admin/users/UsersPage"));

// Admin settings (nested routes)
export const SettingsLayout = lazy(() => import("../pages/admin/settings/SettingsLayout"));
export const GeneralSettings = lazy(() => import("../pages/admin/settings/general/GeneralSettings"));
export const PaymentsSettings = lazy(() => import("../pages/admin/settings/payments/PaymentsSettings"));
export const NotificationsSettings = lazy(() => import("../pages/admin/settings/notifications/NotificationsSettings"));
export const ActivitySettings = lazy(() => import("../pages/admin/settings/activity/ActivitySettings"));

// Admin shell (sidebar + topbar)
export const AdminLayout = lazy(() => import("../layouts/AdminLayout"));

export const NotFound = lazy(() => import("../pages/NotFound"));
export const Footer = lazy(() => import("../pages/Footer"));

export const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
export const TermsOfUse = lazy(() => import('../pages/TermsOfUse'));
export const About = lazy(() => import('../pages/About'));
export const Contact = lazy(() => import('../pages/Contact'));
export const ReturnPolicy = lazy(() => import('../pages/ReturnPolicy'));
export const Unsubscribe = lazy(() => import('../pages/Unsubscribe'));