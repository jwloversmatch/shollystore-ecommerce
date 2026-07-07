// paystack.service.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { createHmac, timingSafeEqual } from 'crypto';

export interface PaystackConfig {
  secretKey: string;
  baseUrl?: string;          // default: https://api.paystack.co
  clientUrl?: string;        // required for initializePayment
  timeoutMs?: number;        // default: 15000
}

export interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface InitializeData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface VerifyData {
  amount: number;
  currency: string;
  status: string;
  reference: string;
  metadata: Record<string, any>;
}

export class PaystackError extends Error {
  public readonly statusCode?: number;
  public readonly paystackMessage?: string;
  public readonly isOperational = true;

  constructor(message: string, statusCode?: number, paystackMessage?: string) {
    super(message);
    this.name = 'PaystackError';
    this.statusCode = statusCode;
    this.paystackMessage = paystackMessage;
  }
}

export class ValidationError extends PaystackError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class PaystackService {
  private readonly client: AxiosInstance;
  private readonly config: Required<PaystackConfig>;

  constructor(config: PaystackConfig) {
    this.config = {
      baseUrl: 'https://api.paystack.co',
      timeoutMs: 15000,
      clientUrl: '',
      ...config,
    };

    if (!this.config.secretKey) {
      throw new ValidationError('Paystack secretKey is required');
    }

    this.client = this.createHttpClient();
  }

  async initializePayment(
    email: string,
    amountInKobo: number,
    orderId: string,
    options?: { currency?: string; metadata?: Record<string, any> }
  ): Promise<PaystackResponse<InitializeData>> {
    this.validateInitializeInput(email, amountInKobo, orderId);

    const payload = {
      email,
      amount: amountInKobo,
      currency: options?.currency ?? 'NGN',
      metadata: { order_id: orderId, ...(options?.metadata ?? {}) },
      callback_url: this.buildCallbackUrl(),
    };

    return this.post('/transaction/initialize', payload);
  }

  async verifyPayment(reference: string): Promise<PaystackResponse<VerifyData>> {
    if (!reference || typeof reference !== 'string') {
      throw new ValidationError('Transaction reference is required');
    }
    return this.get(`/transaction/verify/${encodeURIComponent(reference)}`);
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!payload || !signature) return false;
    try {
      const hash = createHmac('sha512', this.config.secretKey)
        .update(payload)
        .digest('hex');
      const hashBuffer = Buffer.from(hash);
      const sigBuffer = Buffer.from(signature);
      return hashBuffer.length === sigBuffer.length && timingSafeEqual(hashBuffer, sigBuffer);
    } catch {
      return false;
    }
  }

  private createHttpClient(): AxiosInstance {
    return axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeoutMs,
      headers: {
        Authorization: `Bearer ${this.config.secretKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  private validateInitializeInput(email: string, amountInKobo: number, orderId: string): void {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ValidationError('Invalid email address');
    }
    if (!Number.isInteger(amountInKobo) || amountInKobo <= 0) {
      throw new ValidationError('Amount must be a positive integer (kobo)');
    }
    if (!orderId || typeof orderId !== 'string') {
      throw new ValidationError('orderId is required and must be a string');
    }
    if (!this.config.clientUrl) {
      throw new ValidationError('clientUrl is required for payment initialization');
    }
  }

  private buildCallbackUrl(): string {
    const base = this.config.clientUrl!.replace(/\/+$/, '');
    return `${base}/payment-success`;
  }

  private async post<T>(path: string, data: unknown): Promise<PaystackResponse<T>> {
    try {
      const response = await this.client.post<PaystackResponse<T>>(path, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private async get<T>(path: string): Promise<PaystackResponse<T>> {
    try {
      const response = await this.client.get<PaystackResponse<T>>(path);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): PaystackError {
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError<PaystackResponse<never>>;
      if (axiosErr.response) {
        const status = axiosErr.response.status;
        const paystackMsg = axiosErr.response.data?.message ?? 'Unknown Paystack error';
        return new PaystackError(`Paystack request failed (${status})`, status, paystackMsg);
      }
      return new PaystackError('Paystack request failed due to network error');
    }
    return new PaystackError('An unexpected error occurred');
  }
}