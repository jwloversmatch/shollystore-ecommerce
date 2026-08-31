/// <reference types="jest" />

import request from "supertest";
import app from "../app";
import { createTestProduct, createTestUser } from "./helpers";
import {
  sendOrderConfirmation,
  sendAdminOrderNotification,
} from "../services/email.service";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { paystack } from "../config/paystack";

describe("Order API", () => {
  let user: any;
  let product: any;
  const authToken = "fake-token";

  beforeEach(async () => {
    user = await createTestUser();
    global.__TEST_USER__ = user;
    product = await createTestProduct();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── Bank Transfer / Shipping Fee tests ────────────────────────────────
  it("should create an order with bank transfer and calculate Lagos shipping fee", async () => {
    const orderPayload = {
      orderItems: [
        {
          _id: product._id,
          name: product.name,
          qty: 2,
          price: product.price,
          image: product.images[0],
        },
      ],
      shippingAddress: {
        address: "12 Lagos Street",
        city: "Lagos",
        country: "Nigeria",
      },
      paymentMethod: "bank_transfer",
    };

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${authToken}`)
      .send(orderPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.order.shippingFee).toBe(2500);
    expect(res.body.order.totalPrice).toBe(product.price * 2 + 2500);
    expect(res.body.order.trackingNumber).toMatch(/^SHO-\d{4}-[A-Z0-9]{6}$/);
  });

  it("should charge ₦4000 shipping for non-Lagos city in Nigeria", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        orderItems: [
          {
            _id: product._id,
            name: product.name,
            qty: 1,
            price: product.price,
            image: product.images[0],
          },
        ],
        shippingAddress: {
          address: "1 Abuja Road",
          city: "Abuja",
          country: "Nigeria",
        },
        paymentMethod: "bank_transfer",
      });

    expect(res.status).toBe(201);
    expect(res.body.order.shippingFee).toBe(4000);
  });

  it("should charge ₦30000 shipping for international address", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        orderItems: [
          {
            _id: product._id,
            name: product.name,
            qty: 1,
            price: product.price,
            image: product.images[0],
          },
        ],
        shippingAddress: {
          address: "123 Main St",
          city: "Accra",
          country: "Ghana",
        },
        paymentMethod: "bank_transfer",
      });

    expect(res.status).toBe(201);
    expect(res.body.order.shippingFee).toBe(30000);
  });

  it("should return 400 when stock is insufficient", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        orderItems: [
          {
            _id: product._id,
            name: product.name,
            qty: 100,
            price: product.price,
            image: product.images[0],
          },
        ],
        shippingAddress: {
          address: "1 Lagos",
          city: "Lagos",
          country: "Nigeria",
        },
        paymentMethod: "bank_transfer",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should track an order by tracking number and email", async () => {
    const createRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        orderItems: [
          {
            _id: product._id,
            name: product.name,
            qty: 1,
            price: product.price,
            image: product.images[0],
          },
        ],
        shippingAddress: {
          address: "1 Lagos",
          city: "Lagos",
          country: "Nigeria",
        },
        paymentMethod: "bank_transfer",
      });

    const order = createRes.body.order;
    const trackRes = await request(app).get(
      `/api/orders/track/${order.trackingNumber}?email=${user.email}`,
    );

    expect(trackRes.status).toBe(200);
    expect(trackRes.body.success).toBe(true);
    expect(trackRes.body.order.shippingFee).toBe(2500);
    expect(trackRes.body.order._id).toBe(order._id);
  });

  it("should reject tracking with wrong email", async () => {
    const createRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        orderItems: [
          {
            _id: product._id,
            name: product.name,
            qty: 1,
            price: product.price,
            image: product.images[0],
          },
        ],
        shippingAddress: {
          address: "1 Lagos",
          city: "Lagos",
          country: "Nigeria",
        },
        paymentMethod: "bank_transfer",
      });

    const order = createRes.body.order;
    const trackRes = await request(app).get(
      `/api/orders/track/${order.trackingNumber}?email=wrong@example.com`,
    );

    expect(trackRes.status).toBe(404);
  });

  // ─── Paystack Webhook tests ────────────────────────────────────────────
  describe("Paystack Webhook", () => {
    it("should process charge.success once (idempotency)", async () => {
      // Create order first via API
      const createRes = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          orderItems: [
            {
              _id: product._id,
              name: product.name,
              qty: 1,
              price: product.price,
              image: product.images[0],
            },
          ],
          shippingAddress: {
            address: "1 Lagos",
            city: "Lagos",
            country: "Nigeria",
          },
          paymentMethod: "paystack",
        });

      expect(createRes.status).toBe(201);
      const orderId = createRes.body.order._id;

      // Mock Paystack signature verification to return true
      (paystack.verifyWebhookSignature as jest.Mock).mockReturnValue(true);

      const event = {
        event: "charge.success",
        data: {
          id: 12345,
          status: "success",
          reference: "ref123",
          paid_at: new Date().toISOString(),
          metadata: { order_id: orderId },
          gateway_response: "Successful",
        },
      };

      // First webhook call
      const res1 = await request(app)
        .post("/api/orders/webhook")
        .set("x-paystack-signature", "valid-signature")
        .send(event);

      expect(res1.status).toBe(200);

      // Check product stock reduced
      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct?.stock).toBe(product.stock - 1);

      // Second webhook call (duplicate)
      const res2 = await request(app)
        .post("/api/orders/webhook")
        .set("x-paystack-signature", "valid-signature")
        .send(event);

      expect(res2.status).toBe(200);

      // Stock should not be reduced again
      const finalProduct = await Product.findById(product._id);
      expect(finalProduct?.stock).toBe(product.stock - 1);
    });

    it("should handle charge.failed and not deduct stock", async () => {
      const createRes = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          orderItems: [
            {
              _id: product._id,
              name: product.name,
              qty: 1,
              price: product.price,
              image: product.images[0],
            },
          ],
          shippingAddress: {
            address: "1 Lagos",
            city: "Lagos",
            country: "Nigeria",
          },
          paymentMethod: "paystack",
        });

      const orderId = createRes.body.order._id;

      (paystack.verifyWebhookSignature as jest.Mock).mockReturnValue(true);

      const event = {
        event: "charge.failed",
        data: {
          id: 67890,
          status: "failed",
          reference: "ref456",
          metadata: { order_id: orderId },
          gateway_response: "Insufficient funds",
        },
      };

      const res = await request(app)
        .post("/api/orders/webhook")
        .set("x-paystack-signature", "valid-signature")
        .send(event);

      expect(res.status).toBe(200);

      const order = await Order.findById(orderId);
      expect(order?.status).toBe("Pending");
      expect(order?.paymentFailReason).toBe("Insufficient funds");

      const productAfter = await Product.findById(product._id);
      expect(productAfter?.stock).toBe(product.stock);
    });
  });
});