import { useState, useRef, useLayoutEffect } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} from "../../features/api/apiSlice";
import { Plus, X, Edit2, Trash2, ArrowLeft } from "lucide-react";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useTheme } from "../../context/ThemeContext";

interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountAmount: number;
  minOrderAmount: number;
  isActive: boolean;
  expiresAt?: string;
  usageLimit: number;
  usedCount: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const ACCENT = "#e8622a";

// ─── Shared formatting helper ──────────────────────────────────────────────────
const formatWithCommas = (raw: string): string => {
  if (!raw) return "";
  const [intPart, decPart] = raw.split(".");
  const formattedInt = (intPart || "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
};

function useFormattedInput(initial: string | number = "") {
  const [raw, setRaw] = useState(String(initial));
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCursor = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (pendingCursor.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(
        pendingCursor.current,
        pendingCursor.current,
      );
      pendingCursor.current = null;
    }
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const cursor = el.selectionStart ?? el.value.length;
    const nonCommasBefore = el.value.slice(0, cursor).replace(/,/g, "").length;
    const stripped = el.value.replace(/,/g, "");
    let cleaned = "";
    let seenDot = false;
    let decCount = 0;
    for (const ch of stripped) {
      if (ch >= "0" && ch <= "9") {
        if (seenDot) {
          if (decCount < 2) {
            cleaned += ch;
            decCount++;
          }
        } else {
          cleaned += ch;
        }
      } else if (ch === "." && !seenDot) {
        seenDot = true;
        cleaned += ch;
      }
    }
    const formatted = formatWithCommas(cleaned);
    let charCount = 0;
    let newCursor = formatted.length;
    for (let i = 0; i < formatted.length; i++) {
      if (formatted[i] !== ",") {
        charCount++;
        if (charCount === nonCommasBefore) {
          newCursor = i + 1;
          break;
        }
      }
    }
    pendingCursor.current = newCursor;
    setRaw(cleaned);
  };

  const set = (val: string | number) => setRaw(String(val));

  return {
    raw,
    set,
    inputProps: {
      ref: inputRef,
      type: "text" as const,
      inputMode: "decimal" as const,
      value: formatWithCommas(raw),
      onChange,
    },
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
const Coupons = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: coupons = [], isLoading, refetch } = useGetCouponsQuery({});
  const [createCoupon] = useCreateCouponMutation();
  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const discountAmountInput = useFormattedInput(10);
  const minOrderAmountInput = useFormattedInput(0);

  const { register, handleSubmit, reset } = useForm();

  // Theme styles
  const bg = isDark ? "#0A0A0B" : "#FCFAF5";
  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardShadow = isDark
    ? "0 8px 32px rgba(0,0,0,0.35)"
    : "0 4px 16px rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textSecondary = isDark ? "#9ca3af" : "#6b7280";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const tableBorder = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const theadBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const drawerBg = isDark ? "#141414" : "#fff";
  const drawerBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingCoupon(null);
  };

  useFocusTrap(drawerRef, drawerOpen, closeDrawer);

  const openDrawer = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      reset({
        code: coupon.code,
        discountType: coupon.discountType,
        usageLimit: coupon.usageLimit,
        isActive: coupon.isActive,
        expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
      });
      discountAmountInput.set(coupon.discountAmount);
      minOrderAmountInput.set(coupon.minOrderAmount || 0);
    } else {
      setEditingCoupon(null);
      reset({ discountType: "percentage", usageLimit: 0, isActive: true });
      discountAmountInput.set(10);
      minOrderAmountInput.set(0);
    }
    setDrawerOpen(true);
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      const payload = {
        ...data,
        discountAmount: Number(discountAmountInput.raw),
        minOrderAmount: Number(minOrderAmountInput.raw) || 0,
        usageLimit: Number(data.usageLimit) || 0,
        isActive: data.isActive === "true" || data.isActive === true,
      };
      if (editingCoupon) {
        await updateCoupon({ id: editingCoupon._id, ...payload }).unwrap();
        toast.success("Coupon updated!");
      } else {
        await createCoupon(payload).unwrap();
        toast.success("Coupon created!");
      }
      refetch();
      closeDrawer();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to save coupon");
    }
  };

  const handleDeleteClick = (id: string) => {
    setCouponToDelete(id);
    setDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!couponToDelete) return;
    await deleteCoupon(couponToDelete);
    refetch();
    setDeleteModalOpen(false);
    setCouponToDelete(null);
  };

  // ══════ LOADING ═════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto space-y-6 focus:outline-none pt-[calc(56px+env(safe-area-inset-top,0px))] md:pt-[calc(80px+env(safe-area-inset-top,0px))] lg:pt-[calc(88px+env(safe-area-inset-top,0px))]"
        style={{ background: bg }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
            <div className="h-6 w-32 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
          </div>
          <div className="h-10 w-28 rounded-xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
        </div>
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            boxShadow: cardShadow,
          }}
        >
          <div className="overflow-x-auto" role="status" aria-label="Loading coupons">
            <span className="sr-only">Loading...</span>
            <table className="w-full text-left">
              <thead style={{ background: theadBg }}>
                <tr>
                  {["Code", "Type", "Amount", "Min Order", "Usage", "Active", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-4 sm:px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest"
                      style={{ color: textMuted }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="border-t" style={{ borderColor: tableBorder }}>
                    {Array.from({ length: 7 }).map((_, c) => (
                      <td key={c} className="px-4 sm:px-6 py-3">
                        <div
                          className="h-4 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse"
                          style={{ width: c === 6 ? "60%" : "80%" }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    );
  }

  // ══════ MAIN PAGE ═════════════════════════════════════════════════════
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto space-y-6 focus:outline-none pt-[calc(56px+env(safe-area-inset-top,0px))] md:pt-[calc(80px+env(safe-area-inset-top,0px))] lg:pt-[calc(88px+env(safe-area-inset-top,0px))]"
      style={{ background: bg }}
    >
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon?"
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin")}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0"
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: textMuted,
            }}
            aria-label="Back to admin dashboard"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: `${ACCENT}18` }}
              >
                <span className="text-[10px] font-extrabold" style={{ color: ACCENT }} aria-hidden="true">
                  C
                </span>
              </div>
              <p
                className="text-[10px] font-extrabold uppercase tracking-[0.2em]"
                style={{ color: ACCENT }}
              >
                Admin
              </p>
            </div>
            <h1 className="text-2xl md:text-3xl font-black leading-none" style={{ color: textPrimary }}>
              Coupons
            </h1>
          </div>
        </div>
        <button
          onClick={() => openDrawer()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm"
          style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }}
          aria-label="Add new coupon"
        >
          <Plus className="w-4 h-4" aria-hidden="true" /> Add Coupon
        </button>
      </header>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          boxShadow: cardShadow,
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left" aria-label="Coupons list">
            <caption className="sr-only">
              List of all coupons with their details and actions
            </caption>
            <thead style={{ background: theadBg }}>
              <tr>
                {["Code", "Type", "Amount", "Min Order", "Usage", "Active", "Actions"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 sm:px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest"
                    style={{ color: textMuted }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon: Coupon) => (
                <motion.tr
                  key={coupon._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t transition-colors"
                  style={{ borderColor: tableBorder }}
                >
                  <td className="px-4 sm:px-6 py-3 font-semibold text-sm" style={{ color: textPrimary }}>
                    {coupon.code}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm capitalize" style={{ color: textSecondary }}>
                    {coupon.discountType}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm" style={{ color: textSecondary }}>
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountAmount}%`
                      : `₦${coupon.discountAmount.toLocaleString()}`}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm" style={{ color: textSecondary }}>
                    ₦{(coupon.minOrderAmount || 0).toLocaleString()}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm" style={{ color: textSecondary }}>
                    {coupon.usedCount}
                    {coupon.usageLimit > 0 ? ` / ${coupon.usageLimit}` : ""}
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold"
                      style={
                        coupon.isActive
                          ? { background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }
                          : { background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: textMuted, border: inputBorder }
                      }
                    >
                      {coupon.isActive ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openDrawer(coupon)}
                        className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300 transition-colors hover:bg-blue-500/10"
                        aria-label={`Edit coupon ${coupon.code}`}
                      >
                        <Edit2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(coupon._id)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 transition-colors hover:bg-red-500/10"
                        aria-label={`Delete coupon ${coupon.code}`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 sm:px-6 py-12 text-center text-sm" style={{ color: textMuted }}>
                    No coupons found. Create your first coupon to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide‑in Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={closeDrawer}
              role="presentation"
              aria-hidden="true"
            />
            <motion.div
              ref={drawerRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-full sm:max-w-md shadow-2xl z-50 overflow-y-auto p-6"
              style={{
                background: drawerBg,
                borderLeft: `1px solid ${drawerBorder}`,
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="drawer-title"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 id="drawer-title" className="text-xl font-black" style={{ color: textPrimary }}>
                  {editingCoupon ? "Edit Coupon" : "New Coupon"}
                </h2>
                <button
                  onClick={closeDrawer}
                  className="p-2 rounded-xl hover:bg-white/5 transition"
                  style={{ color: textMuted }}
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
                aria-label={editingCoupon ? "Edit coupon form" : "Create coupon form"}
              >
                <div>
                  <label
                    htmlFor="coupon-code"
                    className="block text-[10px] font-extrabold uppercase tracking-widest mb-2"
                    style={{ color: textMuted }}
                  >
                    Code
                  </label>
                  <input
                    id="coupon-code"
                    {...register("code", { required: true })}
                    placeholder="e.g., SAVE10"
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none border transition-all"
                    style={{
                      background: inputBg,
                      borderColor: inputBorder,
                      color: textPrimary,
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="coupon-type"
                      className="block text-[10px] font-extrabold uppercase tracking-widest mb-2"
                      style={{ color: textMuted }}
                    >
                      Type
                    </label>
                    <select
                      id="coupon-type"
                      {...register("discountType")}
                      className="w-full px-4 py-3.5 rounded-xl text-sm outline-none border transition-all appearance-none"
                      style={{
                        background: inputBg,
                        borderColor: inputBorder,
                        color: textPrimary,
                      }}
                      aria-label="Discount type"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="coupon-amount"
                      className="block text-[10px] font-extrabold uppercase tracking-widest mb-2"
                      style={{ color: textMuted }}
                    >
                      Amount
                    </label>
                    <input
                      id="coupon-amount"
                      {...discountAmountInput.inputProps}
                      placeholder="0"
                      className="w-full px-4 py-3.5 rounded-xl text-sm outline-none border transition-all"
                      style={{
                        background: inputBg,
                        borderColor: inputBorder,
                        color: textPrimary,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="coupon-min-order"
                    className="block text-[10px] font-extrabold uppercase tracking-widest mb-2"
                    style={{ color: textMuted }}
                  >
                    Min Order Amount (₦)
                  </label>
                  <input
                    id="coupon-min-order"
                    {...minOrderAmountInput.inputProps}
                    placeholder="0"
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none border transition-all"
                    style={{
                      background: inputBg,
                      borderColor: inputBorder,
                      color: textPrimary,
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="coupon-usage-limit"
                    className="block text-[10px] font-extrabold uppercase tracking-widest mb-2"
                    style={{ color: textMuted }}
                  >
                    Usage Limit (0 = unlimited)
                  </label>
                  <input
                    id="coupon-usage-limit"
                    type="number"
                    {...register("usageLimit")}
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none border transition-all"
                    style={{
                      background: inputBg,
                      borderColor: inputBorder,
                      color: textPrimary,
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="coupon-active"
                    type="checkbox"
                    {...register("isActive")}
                    className="w-4 h-4 rounded focus:ring-0 accent-[#e8622a]"
                  />
                  <label htmlFor="coupon-active" className="text-sm font-bold" style={{ color: textSecondary }}>
                    Active
                  </label>
                </div>
                <div>
                  <label
                    htmlFor="coupon-expiry"
                    className="block text-[10px] font-extrabold uppercase tracking-widest mb-2"
                    style={{ color: textMuted }}
                  >
                    Expiry Date (optional)
                  </label>
                  <input
                    id="coupon-expiry"
                    type="date"
                    {...register("expiresAt")}
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none border transition-all"
                    style={{
                      background: inputBg,
                      borderColor: inputBorder,
                      color: textPrimary,
                    }}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: inputBorder }}>
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="px-5 py-3 rounded-xl text-sm font-bold transition-colors"
                    style={{
                      background: inputBg,
                      border: `1px solid ${inputBorder}`,
                      color: textMuted,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-xl font-black text-white text-sm transition-all"
                    style={{
                      background: ACCENT,
                      boxShadow: `0 6px 18px ${ACCENT}44`,
                    }}
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Coupons;