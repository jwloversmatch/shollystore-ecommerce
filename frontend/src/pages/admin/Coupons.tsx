import { useState, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} from '../../features/api/apiSlice';
import { Plus, X, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';

interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  minOrderAmount: number;
  isActive: boolean;
  expiresAt?: string;
  usageLimit: number;
  usedCount: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const ACCENT = '#e8622a';

// ─── Shared formatting helper (unchanged) ─────────────────────────────────────
const formatWithCommas = (raw: string): string => {
  if (!raw) return '';
  const [intPart, decPart] = raw.split('.');
  const formattedInt = (intPart || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
};

function useFormattedInput(initial: string | number = '') {
  const [raw, setRaw] = useState(String(initial));
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCursor = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (pendingCursor.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(pendingCursor.current, pendingCursor.current);
      pendingCursor.current = null;
    }
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const cursor = el.selectionStart ?? el.value.length;
    const nonCommasBefore = el.value.slice(0, cursor).replace(/,/g, '').length;
    const stripped = el.value.replace(/,/g, '');
    let cleaned = '';
    let seenDot = false;
    let decCount = 0;
    for (const ch of stripped) {
      if (ch >= '0' && ch <= '9') {
        if (seenDot) {
          if (decCount < 2) { cleaned += ch; decCount++; }
        } else {
          cleaned += ch;
        }
      } else if (ch === '.' && !seenDot) {
        seenDot = true;
        cleaned += ch;
      }
    }
    const formatted = formatWithCommas(cleaned);
    let charCount = 0;
    let newCursor = formatted.length;
    for (let i = 0; i < formatted.length; i++) {
      if (formatted[i] !== ',') {
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
      type: 'text' as const,
      inputMode: 'decimal' as const,
      value: formatWithCommas(raw),
      onChange,
    },
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
const Coupons = () => {
  const navigate = useNavigate();
  const { data: coupons = [], isLoading, refetch } = useGetCouponsQuery({});
  const [createCoupon] = useCreateCouponMutation();
  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  const discountAmountInput = useFormattedInput(10);
  const minOrderAmountInput = useFormattedInput(0);

  const { register, handleSubmit, reset } = useForm();

  const openDrawer = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      reset({
        code: coupon.code,
        discountType: coupon.discountType,
        usageLimit: coupon.usageLimit,
        isActive: coupon.isActive,
        expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
      });
      discountAmountInput.set(coupon.discountAmount);
      minOrderAmountInput.set(coupon.minOrderAmount || 0);
    } else {
      setEditingCoupon(null);
      reset({
        discountType: 'percentage',
        usageLimit: 0,
        isActive: true,
      });
      discountAmountInput.set(10);
      minOrderAmountInput.set(0);
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingCoupon(null);
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      const payload = {
        ...data,
        discountAmount: Number(discountAmountInput.raw),
        minOrderAmount: Number(minOrderAmountInput.raw) || 0,
        usageLimit: Number(data.usageLimit) || 0,
        isActive: data.isActive === 'true' || data.isActive === true,
      };
      if (editingCoupon) {
        await updateCoupon({ id: editingCoupon._id, ...payload }).unwrap();
        toast.success('Coupon updated!');
      } else {
        await createCoupon(payload).unwrap();
        toast.success('Coupon created!');
      }
      refetch();
      closeDrawer();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || 'Failed to save coupon');
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

  // ══════ LOADING SKELETON ═════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <div
        className="min-h-screen p-4 md:p-6 pt-20 md:pt-24 max-w-7xl mx-auto space-y-6"
        style={{ background: '#0A0A0B' }}
      >
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
            <div className="h-6 w-32 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
          </div>
          <div className="h-10 w-28 rounded-xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
        </div>

        {/* Table card skeleton */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: '#141414',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
                <tr>
                  {['Code','Type','Amount','Min Order','Usage','Active','Actions'].map((h) => (
                    <th key={h} className="px-4 sm:px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <tr
                    key={idx}
                    className="border-t"
                    style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <td className="px-4 sm:px-6 py-3">
                      <div className="h-4 w-16 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="h-4 w-20 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="h-4 w-16 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="h-4 w-24 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="h-4 w-12 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="h-5 w-12 rounded-full bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex justify-end gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ══════ MAIN PAGE ════════════════════════════════════════════════════════════
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen p-4 md:p-6 pt-20 md:pt-24 max-w-7xl mx-auto space-y-6"
      style={{ background: '#0A0A0B' }}
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => navigate('/admin')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors shrink-0"
            style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: `${ACCENT}18` }}>
                <span className="text-[10px] font-extrabold" style={{ color: ACCENT }}>C</span>
              </div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
                Admin
              </p>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-none">Coupons</h1>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: `0 12px 28px ${ACCENT}55` }}
          whileTap={{ scale: 0.96 }}
          onClick={() => openDrawer()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm"
          style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }}
        >
          <Plus className="w-4 h-4" />
          Add Coupon
        </motion.button>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#141414',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
              <tr>
                <th className="px-4 sm:px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-600">Code</th>
                <th className="px-4 sm:px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-600">Type</th>
                <th className="px-4 sm:px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-600">Amount</th>
                <th className="px-4 sm:px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-600">Min Order</th>
                <th className="px-4 sm:px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-600">Usage</th>
                <th className="px-4 sm:px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-600">Active</th>
                <th className="px-4 sm:px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon: Coupon) => (
                <motion.tr
                  key={coupon._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t transition-colors hover:bg-white/[0.015]"
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                >
                  <td className="px-4 sm:px-6 py-3 font-semibold text-sm text-white">{coupon.code}</td>
                  <td className="px-4 sm:px-6 py-3 text-sm capitalize text-gray-400">{coupon.discountType}</td>
                  <td className="px-4 sm:px-6 py-3 text-sm text-gray-300">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountAmount}%`
                      : `₦${coupon.discountAmount.toLocaleString()}`}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm text-gray-300">
                    ₦{(coupon.minOrderAmount || 0).toLocaleString()}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm text-gray-300">
                    {coupon.usedCount}
                    {coupon.usageLimit > 0 ? ` / ${coupon.usageLimit}` : ''}
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        coupon.isActive
                          ? ''
                          : ''
                      }`}
                      style={
                        coupon.isActive
                          ? { background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }
                          : { background: 'rgba(255,255,255,0.06)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }
                      }
                    >
                      {coupon.isActive ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openDrawer(coupon)}
                        className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300 transition-colors hover:bg-blue-500/10"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(coupon._id)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 transition-colors hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide‑in Drawer (dark) */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={closeDrawer}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-full sm:max-w-md shadow-2xl z-50 overflow-y-auto p-6"
              style={{
                background: '#141414',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-white">
                  {editingCoupon ? 'Edit Coupon' : 'New Coupon'}
                </h2>
                <button
                  onClick={closeDrawer}
                  className="p-2 rounded-xl hover:bg-white/5 transition text-gray-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Code</label>
                  <input
                    {...register('code', { required: true })}
                    placeholder="e.g., SAVE10"
                    className="w-full px-4 py-3.5 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none border border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Type</label>
                    <select
                      {...register('discountType')}
                      className="w-full px-4 py-3.5 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none border border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15 transition-all appearance-none"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Amount</label>
                    <input
                      {...discountAmountInput.inputProps}
                      placeholder="0"
                      className="w-full px-4 py-3.5 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none border border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Min Order Amount (₦)</label>
                  <input
                    {...minOrderAmountInput.inputProps}
                    placeholder="0"
                    className="w-full px-4 py-3.5 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none border border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Usage Limit (0 = unlimited)</label>
                  <input
                    type="number"
                    {...register('usageLimit')}
                    className="w-full px-4 py-3.5 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none border border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15 transition-all"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className="w-4 h-4 rounded focus:ring-0 text-leaf-green bg-[#1c1c1c] border-gray-600 accent-[#e8622a]"
                  />
                  <label className="text-sm font-bold text-gray-300">Active</label>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Expiry Date (optional)</label>
                  <input
                    type="date"
                    {...register('expiresAt')}
                    className="w-full px-4 py-3.5 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none border border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15 transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="px-5 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-white transition-colors"
                    style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: `0 14px 36px ${ACCENT}55` }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="px-5 py-3 rounded-xl font-black text-white text-sm transition-all"
                    style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }}
                  >
                    Save
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Coupons;