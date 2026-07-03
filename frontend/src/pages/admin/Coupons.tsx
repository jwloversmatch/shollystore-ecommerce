import { useState } from 'react';
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

  const { register, handleSubmit, reset } = useForm();

  const openDrawer = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      reset(coupon);
    } else {
      setEditingCoupon(null);
      reset({
        discountType: 'percentage',
        discountAmount: 10,
        minOrderAmount: 0,
        usageLimit: 0,
        isActive: true,
      });
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingCoupon(null);
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      // Convert numeric fields to actual numbers
      const payload = {
        ...data,
        discountAmount: Number(data.discountAmount),
        minOrderAmount: Number(data.minOrderAmount) || 0,
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leaf-green" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 pt-20 md:pt-24 max-w-7xl mx-auto space-y-6"
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 rounded-xl hover:bg-gray-100 border border-gray-200 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Coupons</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => openDrawer()}
          className="flex items-center gap-2 bg-leaf-green text-white px-4 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-leaf-green/30 transition text-sm"
        >
          <Plus className="w-4 h-4" /> Add Coupon
        </motion.button>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase">Code</th>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase">Min Order</th>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase">Usage</th>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase">Active</th>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon: Coupon) => (
                <motion.tr
                  key={coupon._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 sm:px-6 py-3 font-medium text-sm">{coupon.code}</td>
                  <td className="px-4 sm:px-6 py-3 text-sm capitalize">{coupon.discountType}</td>
                  <td className="px-4 sm:px-6 py-3 text-sm">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountAmount}%`
                      : `₦${coupon.discountAmount}`}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm">₦{coupon.minOrderAmount || 0}</td>
                  <td className="px-4 sm:px-6 py-3 text-sm">
                    {coupon.usedCount}
                    {coupon.usageLimit > 0 ? ` / ${coupon.usageLimit}` : ''}
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        coupon.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {coupon.isActive ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right space-x-1">
                    <button
                      onClick={() => openDrawer(coupon)}
                      className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(coupon._id)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide‑in Drawer for Add/Edit */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={closeDrawer}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-full sm:max-w-md bg-white/95 backdrop-blur-xl shadow-2xl z-50 overflow-y-auto p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingCoupon ? 'Edit Coupon' : 'New Coupon'}
                </h2>
                <button onClick={closeDrawer} className="p-2 rounded-full hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input
                    {...register('code', { required: true })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                    placeholder="e.g., SAVE10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      {...register('discountType')}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      {...register('discountAmount', { required: true })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount (₦)</label>
                  <input
                    type="number"
                    {...register('minOrderAmount')}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit (0 = unlimited)</label>
                  <input
                    type="number"
                    {...register('usageLimit')}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className="w-4 h-4 text-leaf-green focus:ring-leaf-green"
                  />
                  <label className="text-sm font-medium text-gray-700">Active</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (optional)</label>
                  <input
                    type="date"
                    {...register('expiresAt')}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-4 py-2 bg-leaf-green text-white rounded-xl font-medium shadow-md hover:bg-green-700 transition disabled:opacity-60"
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