import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../features/api/apiSlice';
import { ArrowLeft, Banknote, MessageCircle, Building, Pencil, Trash2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import ConfirmationModal from '../../components/ConfirmationModal';

const settingsSchema = z.object({
  bankAccountName: z.string().min(1, 'Account name is required'),
  bankAccountNumber: z.string().min(1, 'Account number is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  whatsappNumber: z.string().min(1, 'WhatsApp number is required'),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const Settings = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);

  const { data: settings, isLoading, refetch } = useGetSettingsQuery({});
  const [updateSettings, { isLoading: updating }] = useUpdateSettingsMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  // Pre-fill form with existing settings when editing
  useEffect(() => {
    if (settings) {
      reset({
        bankAccountName: settings.bankAccountName || '',
        bankAccountNumber: settings.bankAccountNumber || '',
        bankName: settings.bankName || '',
        whatsappNumber: settings.whatsappNumber || '',
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      await updateSettings(data).unwrap();
      toast.success('Settings updated successfully!');
      refetch();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings.');
    }
  };

  const handleClearAll = async () => {
    try {
      await updateSettings({
        bankAccountName: '',
        bankAccountNumber: '',
        bankName: '',
        whatsappNumber: '',
      }).unwrap();
      toast.success('Settings cleared!');
      refetch();
      setIsEditing(false);
      setClearModalOpen(false);
    } catch (error) {
      console.error('Failed to clear settings:', error);
      toast.error('Failed to clear settings.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leaf-green"></div>
      </div>
    );
  }

  const hasSettings = settings?.bankAccountName || settings?.bankAccountNumber || settings?.bankName || settings?.whatsappNumber;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6 pt-20 md:pt-24 max-w-4xl mx-auto space-y-6"
    >
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate('/admin')}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Store Settings</h1>
      </div>

      {/* Current Settings Preview (Card) */}
      {!isEditing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-800">Current Payment Details</h2>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-200"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              {hasSettings && (
                <button
                  onClick={() => setClearModalOpen(true)}
                  className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {hasSettings ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                <Building className="w-5 h-5 text-leaf-green shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Bank</p>
                  <p className="font-medium text-gray-800">{settings?.bankName || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                <Banknote className="w-5 h-5 text-leaf-green shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Account Name</p>
                  <p className="font-medium text-gray-800">{settings?.bankAccountName || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                <Banknote className="w-5 h-5 text-leaf-green shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Account Number</p>
                  <p className="font-medium text-gray-800 font-mono">{settings?.bankAccountNumber || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                <MessageCircle className="w-5 h-5 text-leaf-green shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">WhatsApp</p>
                  <p className="font-medium text-gray-800">{settings?.whatsappNumber || '—'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl text-gray-500">
              <span className="text-sm">No payment details configured yet.</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Edit Form (Slide-in animation) */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800">Edit Payment Details</h2>
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  Bank Name
                </label>
                <input
                  {...register('bankName')}
                  className={`w-full border ${
                    errors.bankName ? 'border-red-500' : 'border-gray-200'
                  } rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent transition-all placeholder:text-gray-400`}
                  placeholder="e.g. GTBank"
                />
                {errors.bankName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">•</span> {errors.bankName.message}
                  </p>
                )}
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                <input
                  {...register('bankAccountName')}
                  className={`w-full border ${
                    errors.bankAccountName ? 'border-red-500' : 'border-gray-200'
                  } rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent transition-all placeholder:text-gray-400`}
                  placeholder="e.g. LotceWieth Store"
                />
                {errors.bankAccountName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">•</span> {errors.bankAccountName.message}
                  </p>
                )}
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-gray-400" />
                  Account Number
                </label>
                <input
                  {...register('bankAccountNumber')}
                  className={`w-full border ${
                    errors.bankAccountNumber ? 'border-red-500' : 'border-gray-200'
                  } rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent transition-all placeholder:text-gray-400`}
                  placeholder="0123456789"
                />
                {errors.bankAccountNumber && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">•</span> {errors.bankAccountNumber.message}
                  </p>
                )}
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-gray-400" />
                  WhatsApp Number (with country code)
                </label>
                <input
                  {...register('whatsappNumber')}
                  className={`w-full border ${
                    errors.whatsappNumber ? 'border-red-500' : 'border-gray-200'
                  } rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent transition-all placeholder:text-gray-400`}
                  placeholder="+2348000000000"
                />
                {errors.whatsappNumber && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">•</span> {errors.whatsappNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2.5 bg-leaf-green text-white rounded-xl font-medium shadow-lg hover:shadow-leaf-green/30 transition disabled:opacity-60 flex items-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Clear All Confirmation Modal */}
      <ConfirmationModal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        onConfirm={handleClearAll}
        title="Clear All Settings?"
        message="This will remove all saved payment details. Customers will see empty fields during checkout. Are you sure?"
        confirmText="Clear All"
        cancelText="Cancel"
        type="danger"
      />
    </motion.div>
  );
};

export default Settings;