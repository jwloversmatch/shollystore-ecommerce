import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Order } from "../../types/account";
import type { ProductItem } from "../../types/home"; // ✅ imported

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
  products: ProductItem[]; // ✅ properly typed, no any
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ─── API Slice ────────────────────────────────────────────────────────────────
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: [
    "Product",
    "Order",
    "User",
    "Settings",
    "HeroSlide",
    "Category",
    "Coupon",
  ],
  endpoints: (builder) => ({
    // ══════════════════════════════════════════════════════════════════
    // Products (public)
    // ══════════════════════════════════════════════════════════════════
    getProducts: builder.query<ProductsResponse, {
      category?: string;
      includeSubcategories?: boolean;
      featured?: boolean;
      page?: number;
      limit?: number;
    }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.category) {
          searchParams.append("category", params.category);
          if (params.includeSubcategories !== undefined)
            searchParams.append("includeSubcategories", String(params.includeSubcategories));
        }
        if (params?.featured) searchParams.append("featured", "true");
        if (params?.page) searchParams.append("page", String(params.page));
        if (params?.limit) searchParams.append("limit", String(params.limit));
        else searchParams.append("limit", "12"); // default page size
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
  }),
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useCreateOrderMutation,
  useVerifyPaymentQuery,
  useLazyVerifyPaymentQuery,
  useGetMyOrdersQuery,
  useGetAllOrdersQuery,
  useGetAdminStatsQuery,
  useUpdateOrderStatusMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadImageMutation,
  useLoginMutation,
  useRegisterMutation,
  useUpdateProfileMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  useGetSalesAnalyticsQuery,
  useGetTopProductsQuery,
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
} = apiSlice;