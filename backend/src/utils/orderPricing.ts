import mongoose from 'mongoose';
import { Product, IProduct, IVariant } from '../models/Product';
import { Coupon } from '../models/Coupon';

export interface OrderItemInput {
  _id: string;
  name: string;
  qty: number;
  price: number;
  image?: string;
  variant?: { sku?: string; color?: string; size?: string };
}

export interface PricedOrderItem {
  name: string;
  qty: number;
  price: number;
  product: mongoose.Types.ObjectId;
  image?: string;
  variant?: { sku?: string; color?: string; size?: string };
}

export interface OrderPricing {
  orderItems: PricedOrderItem[];
  subtotal: number;
  discount: number;
  taxAmount: number;
  shippingFee: number;      
  totalPrice: number;
  couponCode?: string;
}

const findVariant = (
  product: IProduct,
  variantInput?: OrderItemInput['variant'],
): IVariant | undefined => {
  if (!variantInput) return undefined;
  return product.variants?.find(
    (v) =>
      (variantInput.sku && v.sku === variantInput.sku) ||
      (variantInput.color &&
        variantInput.size &&
        v.color === variantInput.color &&
        v.size === variantInput.size),
  );
};

const getItemPrice = (product: IProduct, variant?: IVariant): number => {
  if (variant?.price != null) return variant.price;
  return product.price;
};

const getAvailableStock = (product: IProduct, variant?: IVariant): number => {
  if (variant?.stock != null) return variant.stock;
  return product.stock;
};

/** Server-side price calculation — never trust client-supplied totals */
export const calculateOrderPricing = async (
  items: OrderItemInput[],
  couponCode?: string,
  shippingFee: number = 0,  
): Promise<OrderPricing> => {
  const orderItems: PricedOrderItem[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item._id);
    if (!product || product.isActive === false) {
      throw new Error(`Product not found: ${item._id}`);
    }

    const variant = findVariant(product, item.variant);
    const unitPrice = getItemPrice(product, variant);
    const available = getAvailableStock(product, variant);

    if (available < item.qty) {
      throw new Error(
        `Insufficient stock for ${product.name}. Available: ${available}`,
      );
    }

    const lineTotal = unitPrice * item.qty;
    subtotal += lineTotal;

    orderItems.push({
      name: product.name,
      qty: item.qty,
      price: unitPrice,
      product: product._id,
      image: item.image || product.images?.[0],
      variant: item.variant,
    });
  }

  let discount = 0;
  let appliedCoupon: string | undefined;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (
      coupon &&
      coupon.isActive &&
      (!coupon.expiresAt || new Date() <= coupon.expiresAt) &&
      ((coupon.usageLimit ?? 0) === 0 || coupon.usedCount < (coupon.usageLimit ?? 0)) &&
      subtotal >= (coupon.minOrderAmount || 0)
    ) {
      discount =
        coupon.discountType === 'percentage'
          ? Math.round((subtotal * coupon.discountAmount) / 100)
          : coupon.discountAmount;
      appliedCoupon = coupon.code;
    }
  }

  const taxAmount = 0; // extend when tax rules are configured in settings
  const totalPrice = Math.max(0, subtotal - discount + taxAmount + shippingFee); 

  return {
    orderItems,
    subtotal,
    discount,
    taxAmount,
    shippingFee,     
    totalPrice,
    couponCode: appliedCoupon,
  };
};