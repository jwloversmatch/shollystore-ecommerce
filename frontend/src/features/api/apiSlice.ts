import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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
    getProducts: builder.query({
      query: () => "/products?limit=9999",
      providesTags: ["Product"],
    }),

    createOrder: builder.mutation({
      query: (orderData) => ({
        url: "/orders",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Order"],
    }),

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

    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/orders/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Order", "Product"],
    }),

    uploadImage: builder.mutation({
      query: (formData) => ({
        url: "/upload",
        method: "POST",
        body: formData,
      }),
    }),

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

    updateStock: builder.mutation({
      query: ({ id, stock }) => ({
        url: `/admin/inventory/${id}`,
        method: "PUT",
        body: { stock },
      }),
      invalidatesTags: ["Product"],
    }),

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

    getCategories: builder.query({
      query: () => "/categories",
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

    getOrderCustomerCount: builder.query({
      query: () => "/admin/orders/analytics/order-customers",
    }),

    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/auth/profile",
        method: "PUT",
        body,
      }),
    }),

    // ✅ New: Send marketing email (new arrival / back-in-stock)
    sendMarketingEmail: builder.mutation({
      query: (data) => ({
        url: "/admin/marketing/send",
        method: "POST",
        body: data,
      }),
    }),

    getProductBySlug: builder.query({
      query: (slug) => `/products/${slug}`,
      providesTags: ["Product"],
    }),

    // Inside endpoints
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
  }),
});

export const {
  useGetProductsQuery,
  useCreateOrderMutation,
  useGetAdminStatsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateOrderStatusMutation,
  useUploadImageMutation,
  useLoginMutation,
  useRegisterMutation,
  useGetSalesAnalyticsQuery,
  useGetTopProductsQuery,
  useGetCustomerCountQuery,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateStockMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetPublicSettingsQuery,
  useGetAllOrdersQuery,
  useGetHeroSlidesQuery,
  useGetAllHeroSlidesQuery,
  useCreateHeroSlideMutation,
  useUpdateHeroSlideMutation,
  useDeleteHeroSlideMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetOrderCustomerCountQuery,
  useUpdateProfileMutation,
  useSendMarketingEmailMutation,
  useGetProductBySlugQuery,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useValidateCouponMutation,
} = apiSlice;
