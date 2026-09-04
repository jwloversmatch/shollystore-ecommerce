import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../auth/authSlice";
import type { Order } from "../../types/account";
import type { ProductItem } from "../../types/home";

// ─── Response types ───────────────────────────────────────────────────────────
interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  data: {
    amount: number;
    currency: string;
    status: string;
    reference: string;
    metadata: Record<string, unknown>;
  };
}

export interface ProductsResponse {
  products: ProductItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductSuggestion {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images?: string[];
  category?: { name: string; slug: string } | string;
}

export interface RevenueTrendItem {
  date: string;
  revenue: number;
  orders: number;
}

// ─── Wishlist product type (populated by backend) ───────────────────────────
export interface WishlistProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images?: string[];
  stock?: number;
  category?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
}

// ─── Review interface ────────────────────────────────────────────────────
export interface Review {
  _id: string;
  product: string;
  user: { _id: string; name: string; avatar?: string };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminReview {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug?: string;
    images?: string[];
  };
  user: {
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  reviews: AdminReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ─── Base query with token from localStorage ─────────────────────────────────
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

// ─── Wrapper: auto-logout on 401 ─────────────────────────────────────────────
const baseQueryWithReauth: typeof baseQuery = async (
  args,
  api,
  extraOptions,
) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
  }

  return result;
};

// ─── API Slice ───────────────────────────────────────────────────────────────
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Product",
    "Order",
    "User",
    "Settings",
    "HeroSlide",
    "Category",
    "Coupon",
    "Wishlist",
    "Review",
    "Cart",
  ],
  endpoints: (builder) => ({
    // ══════════════════════════════════════════════════════════════════
    // Products (public)
    // ══════════════════════════════════════════════════════════════════
    getProducts: builder.query<
      ProductsResponse,
      {
        category?: string;
        includeSubcategories?: boolean;
        featured?: boolean;
        search?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.category) {
          searchParams.append("category", params.category);
          if (params.includeSubcategories !== undefined)
            searchParams.append(
              "includeSubcategories",
              String(params.includeSubcategories),
            );
        }
        if (params?.featured) searchParams.append("featured", "true");
        if (params?.search) searchParams.append("search", params.search);
        if (params?.page) searchParams.append("page", String(params.page));
        if (params?.limit) searchParams.append("limit", String(params.limit));
        else searchParams.append("limit", "12");
        const qs = searchParams.toString();
        return `/products${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Product"],
    }),

    getProductBySlug: builder.query({
      query: (slug) => `/products/${slug}`,
      providesTags: ["Product"],
    }),

    // ─── Orders (public) ────────────────────────────────────────────────────
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: "/orders",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Order"],
    }),

    verifyPayment: builder.query<VerifyPaymentResponse, string>({
      query: (reference: string) => `/orders/verify/${reference}`,
    }),

    getMyOrders: builder.query<Order[], void>({
      query: () => "/orders/my-orders",
      providesTags: ["Order"],
    }),

    // ─── Admin Orders ───────────────────────────────────────────────────────
    getAllOrders: builder.query({
      query: ({
        page = 1,
        limit = 10,
        status,
        paymentMethod,
        search,
        startDate,
        endDate,
      }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (status && status !== "All") params.append("status", status);
        if (paymentMethod && paymentMethod !== "All")
          params.append("paymentMethod", paymentMethod);
        if (search) params.append("search", search);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        return `/admin/orders/all?${params.toString()}`;
      },
      providesTags: ["Order"],
    }),

    getAdminStats: builder.query({
      query: () => "/admin/orders",
      providesTags: ["Order"],
    }),

    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/orders/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Order", "Product"],
    }),

    // ─── Revenue Trend ───────────────────────────────────────────────────────
    getRevenueTrend: builder.query<
      { success: boolean; data: RevenueTrendItem[] },
      number
    >({
      query: (days = 30) =>
        `/admin/orders/analytics/revenue-trend?days=${days}`,
      providesTags: ["Order"],
    }),

    // ─── Admin Products ─────────────────────────────────────────────────────
    createProduct: builder.mutation({
      query: (productData) => ({
        url: "/admin/products",
        method: "POST",
        body: productData,
      }),
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),

    // ─── Upload ─────────────────────────────────────────────────────────────
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: "/upload",
        method: "POST",
        body: formData,
      }),
    }),

    // ─── Auth ───────────────────────────────────────────────────────────────
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
    }),

    verifyEmail: builder.query<{ success: boolean; message: string }, string>({
      query: (token) => `/auth/verify-email?token=${token}`,
    }),

    resendVerification: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (email) => ({
        url: "/auth/resend-verification",
        method: "POST",
        body: { email },
      }),
    }),

    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/auth/profile",
        method: "PUT",
        body,
      }),
    }),

    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),

    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),

    changePassword: builder.mutation({
      query: (data) => ({
        url: "/auth/change-password",
        method: "PUT",
        body: data,
      }),
    }),

    deleteAccount: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (password) => ({
        url: "/auth/account",
        method: "DELETE",
        body: { password },
      }),
      invalidatesTags: ["User"],
    }),

    // ─── Addresses ──────────────────────────────────────────────────────────
    getAddresses: builder.query({
      query: () => "/auth/addresses",
      transformResponse: (response: {
        success: boolean;
        addresses: {
          _id: string;
          label: string;
          address: string;
          city: string;
          isDefault: boolean;
          postalCode?: string;
          country?: string;
        }[];
      }) => response.addresses,
      providesTags: ["User"],
    }),
    addAddress: builder.mutation({
      query: (data) => ({
        url: "/auth/addresses",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateAddress: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/auth/addresses/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `/auth/addresses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    setDefaultAddress: builder.mutation({
      query: (id) => ({
        url: `/auth/addresses/${id}/default`,
        method: "PUT",
      }),
      invalidatesTags: ["User"],
    }),

    // ─── Admin Analytics ────────────────────────────────────────────────────
    getSalesAnalytics: builder.query({
      query: () => "/admin/orders/analytics",
      providesTags: ["Order"],
    }),

    getTopProducts: builder.query({
      query: () => "/admin/orders/analytics/top-products",
      providesTags: ["Product"],
    }),

    getCustomerCount: builder.query({
      query: () => "/admin/orders/analytics/customers",
    }),

    getOrderCustomerCount: builder.query({
      query: () => "/admin/orders/analytics/order-customers",
    }),

    // ─── Admin Users ────────────────────────────────────────────────────────
    getUsers: builder.query({
      query: () => "/admin/users",
      providesTags: ["User"],
    }),

    updateUserRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `/admin/users/${id}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: ["User"],
    }),

    // ─── Admin Inventory ────────────────────────────────────────────────────
    updateStock: builder.mutation({
      query: ({ id, stock }) => ({
        url: `/admin/inventory/${id}`,
        method: "PUT",
        body: { stock },
      }),
      invalidatesTags: ["Product"],
    }),

    // ─── Settings ───────────────────────────────────────────────────────────
    getSettings: builder.query({
      query: () => "/admin/settings",
      providesTags: ["Settings"],
    }),

    updateSettings: builder.mutation({
      query: (data) => ({
        url: "/admin/settings",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),

    getPublicSettings: builder.query({
      query: () => "/settings/public",
    }),

    getSettingsChanges: builder.query({
      query: () => "/admin/settings/changes",
      providesTags: ["Settings"],
    }),

    // ─── Hero Slides ────────────────────────────────────────────────────────
    getHeroSlides: builder.query({
      query: () => "/hero-slides",
      providesTags: ["HeroSlide"],
    }),
    getAllHeroSlides: builder.query({
      query: () => "/admin/hero-slides",
      providesTags: ["HeroSlide"],
    }),
    createHeroSlide: builder.mutation({
      query: (data) => ({
        url: "/admin/hero-slides",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["HeroSlide"],
    }),
    updateHeroSlide: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/hero-slides/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["HeroSlide"],
    }),
    deleteHeroSlide: builder.mutation({
      query: (id) => ({
        url: `/admin/hero-slides/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["HeroSlide"],
    }),

    // ─── Categories (public & admin) ────────────────────────────────────────
    getCategories: builder.query({
      query: (params?: { parent?: string | null }) => {
        const searchParams = new URLSearchParams();
        if (params?.parent !== undefined) {
          if (params.parent === null) {
            searchParams.append("parent", "null");
          } else {
            searchParams.append("parent", params.parent);
          }
        }
        const queryString = searchParams.toString();
        return `/categories${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Category"],
    }),

    getCategoryTree: builder.query({
      query: () => "/categories/tree",
      providesTags: ["Category"],
    }),

    createCategory: builder.mutation({
      query: (data) => ({
        url: "/admin/categories",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/categories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/admin/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    // ─── Coupons ────────────────────────────────────────────────────────────
    getCoupons: builder.query({
      query: () => "/admin/coupons",
      providesTags: ["Coupon"],
    }),
    createCoupon: builder.mutation({
      query: (data) => ({ url: "/admin/coupons", method: "POST", body: data }),
      invalidatesTags: ["Coupon"],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/coupons/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Coupon"],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({ url: `/admin/coupons/${id}`, method: "DELETE" }),
      invalidatesTags: ["Coupon"],
    }),
    validateCoupon: builder.mutation({
      query: (data) => ({
        url: "/coupons/validate",
        method: "POST",
        body: data,
      }),
    }),

    // ─── Marketing ──────────────────────────────────────────────────────────
    sendMarketingEmail: builder.mutation({
      query: (data) => ({
        url: "/admin/marketing/send",
        method: "POST",
        body: data,
      }),
    }),

    // ─── Push Notifications ─────────────────────────────────────────────────
    sendPushNotification: builder.mutation<
      { success: boolean; message: string },
      { title: string; body: string; url?: string }
    >({
      query: (data) => ({
        url: "/push/send",
        method: "POST",
        body: data,
      }),
    }),

    getProductSuggestions: builder.query<
      { suggestions: ProductSuggestion[] },
      { q: string; categoryId?: string }
    >({
      query: ({ q, categoryId }) => {
        const params = new URLSearchParams({ q });
        if (categoryId) params.append("category", categoryId);
        return `/products/suggestions?${params.toString()}`;
      },
      providesTags: ["Product"],
    }),

    trackOrder: builder.query<
      {
        success: boolean;
        order: {
          _id: string;
          trackingNumber?: string;
          status: string;
          totalPrice: number;
          orderItems: {
            name: string;
            qty: number;
            price: number;
            image?: string;
          }[];
          shippingAddress: {
            address: string;
            city: string;
            postalCode?: string;
            country?: string;
          };
          paymentMethod?: string;
          paymentDetails?: {
            bankName?: string;
            accountName?: string;
            accountNumber?: string;
            whatsappNumber?: string;
          };
          shippingFee?: number;
          createdAt: string;
        };
      },
      { orderId: string; email: string }
    >({
      query: ({ orderId, email }) =>
        `/orders/track/${orderId}?email=${encodeURIComponent(email)}`,
    }),

    // ─── Wishlist endpoints ────────────────────────────────────────────────
    getWishlist: builder.query<
      { success: boolean; wishlist: WishlistProduct[] },
      void
    >({
      query: () => "/wishlist",
      providesTags: ["Wishlist"],
    }),
    addToWishlist: builder.mutation<
      { success: boolean; wishlist: string[] },
      string
    >({
      query: (productId) => ({
        url: `/wishlist/${productId}`,
        method: "POST",
      }),
      invalidatesTags: ["Wishlist"],
    }),
    removeFromWishlist: builder.mutation<
      { success: boolean; wishlist: string[] },
      string
    >({
      query: (productId) => ({
        url: `/wishlist/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
    }),

    getProductReviews: builder.query<
      {
        reviews: Review[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      },
      { productId: string; page?: number; limit?: number }
    >({
      query: ({ productId, page = 1, limit = 10 }) =>
        `/products/${productId}/reviews?page=${page}&limit=${limit}`,
      providesTags: (result, _error, { productId }) =>
        result ? [{ type: "Review", id: productId }] : ["Review"],
    }),

    addReview: builder.mutation<
      Review,
      { productId: string; rating: number; comment: string }
    >({
      query: ({ productId, rating, comment }) => ({
        url: `/products/${productId}/reviews`,
        method: "POST",
        body: { rating, comment },
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: "Review", id: productId },
        { type: "Product", id: productId },
      ],
    }),

    updateReview: builder.mutation<
      Review,
      { productId: string; reviewId: string; rating?: number; comment?: string }
    >({
      query: ({ productId, reviewId, ...body }) => ({
        url: `/products/${productId}/reviews/${reviewId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: "Review", id: productId },
        { type: "Product", id: productId },
      ],
    }),

    deleteReview: builder.mutation<
      { message: string },
      { productId: string; reviewId: string }
    >({
      query: ({ productId, reviewId }) => ({
        url: `/products/${productId}/reviews/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: "Review", id: productId },
        { type: "Product", id: productId },
      ],
    }),

    // ─── Admin Bulk Import ────────────────────────────────────────────────────
    bulkImportProducts: builder.mutation<
      {
        success: boolean;
        total: number;
        created: number;
        updated: number;
        skipped: number;
        errors: { row: number; message: string }[];
      },
      FormData
    >({
      query: (formData) => ({
        url: "/admin/products/bulk-import",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),

    getAdminReviews: builder.query<
      ReviewsResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 20, search = "" }) =>
        `/admin/reviews?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
      providesTags: ["Review"],
    }),

    deleteAdminReview: builder.mutation<{ message: string }, string>({
      query: (reviewId) => ({
        url: `/admin/reviews/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Review", "Product"],
    }),

    saveCart: builder.mutation<
      { success: boolean; cart: unknown },
      {
        items: {
          product: string;
          qty: number;
          price: number;
          variant?: { sku?: string; color?: string; size?: string };
        }[];
      }
    >({
      query: (payload) => ({
        url: "/cart",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Cart"],
    }),

    getCart: builder.query({
      query: () => "/cart",
      providesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useLazyGetProductsQuery,
  useGetProductBySlugQuery,
  useCreateOrderMutation,
  useVerifyPaymentQuery,
  useLazyVerifyPaymentQuery,
  useGetMyOrdersQuery,
  useGetAllOrdersQuery,
  useGetAdminStatsQuery,
  useUpdateOrderStatusMutation,
  useTrackOrderQuery,
  useGetRevenueTrendQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadImageMutation,
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailQuery,
  useResendVerificationMutation,
  useUpdateProfileMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  useGetSalesAnalyticsQuery,
  useGetTopProductsQuery,
  useGetProductSuggestionsQuery,
  useGetCustomerCountQuery,
  useGetOrderCustomerCountQuery,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateStockMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetPublicSettingsQuery,
  useGetSettingsChangesQuery,
  useGetHeroSlidesQuery,
  useGetAllHeroSlidesQuery,
  useCreateHeroSlideMutation,
  useUpdateHeroSlideMutation,
  useDeleteHeroSlideMutation,
  useGetCategoriesQuery,
  useGetCategoryTreeQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useValidateCouponMutation,
  useSendMarketingEmailMutation,
  useSendPushNotificationMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetProductReviewsQuery,
  useAddReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useBulkImportProductsMutation,
  useGetAdminReviewsQuery,
  useDeleteAdminReviewMutation,
  useSaveCartMutation,
  useGetCartQuery,
} = apiSlice;
