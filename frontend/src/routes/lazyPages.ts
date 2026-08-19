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

export const Dashboard = lazy(() => import("../pages/admin/dashboard/"));
export const Products = lazy(() => import("../pages/admin/products/"));
export const Orders = lazy(() => import("../pages/admin/orders/"));
export const HeroSlides = lazy(() => import("../pages/admin/HeroSlides"));
export const Categories = lazy(() => import("../pages/admin/categories/"));
export const Coupons = lazy(() => import("../pages/admin/Coupons"));
export const Settings = lazy(() => import("../pages/admin/settings/"));

export const NotFound = lazy(() => import("../pages/NotFound"));
export const Footer = lazy(() => import("../pages/Footer"));