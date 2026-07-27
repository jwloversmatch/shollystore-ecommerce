import { CheckCircle, Clock, Truck, Package, AlertCircle, XCircle } from "lucide-react";
import type { ReactNode } from "react";

export const getStatusInfo = (
  status: string
): { icon: ReactNode; color: string; label: string } => {
  const map: Record<string, { icon: ReactNode; color: string; label: string }> = {
    Paid: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: "bg-green-100 text-green-700",
      label: "Paid",
    },
    Pending: {
      icon: <Clock className="w-4 h-4" />,
      color: "bg-yellow-100 text-yellow-700",
      label: "Pending",
    },
    Shipped: {
      icon: <Truck className="w-4 h-4" />,
      color: "bg-blue-100 text-blue-700",
      label: "Shipped",
    },
    Delivered: {
      icon: <Package className="w-4 h-4" />,
      color: "bg-purple-100 text-purple-700",
      label: "Delivered",
    },
    Cancelled: {
      icon: <XCircle className="w-4 h-4" />,
      color: "bg-red-100 text-red-700",
      label: "Cancelled",
    },
  };
  return (
    map[status] || {
      icon: <AlertCircle className="w-4 h-4" />,
      color: "bg-gray-100 text-gray-700",
      label: status,
    }
  );
};

export const paymentLabels: Record<string, string> = {
  paystack: "Paystack",
  bank_transfer: "Bank Transfer",
  whatsapp: "WhatsApp",
};