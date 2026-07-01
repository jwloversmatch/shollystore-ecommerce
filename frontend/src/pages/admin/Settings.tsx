import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ works now
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../features/api/apiSlice';
import { ArrowLeft, Banknote, MessageCircle, Building, Pencil, Trash2 } from 'lucide-react';
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
  const navigate = useNavigate(); // ✅ now safely inside Router
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
      // ✅ Added pt-20 md:pt-24 to create distance from the sticky navbar
      className="p-6 pt-15 md:pt-20 max-w-3xl mx-auto"
    >
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Store Settings</h1>
      </div>

      {/* Current Settings Preview */}
      {!isEditing && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Current Payment Details</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              {hasSettings && (
                <button
                  onClick={() => setClearModalOpen(true)}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {hasSettings ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">Bank Name</span>
                <span className="font-medium text-gray-800">{settings?.bankName || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Account Name</span>
                <span className="font-medium text-gray-800">{settings?.bankAccountName || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Account Number</span>
                <span className="font-medium text-gray-800">{settings?.bankAccountNumber || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">WhatsApp Number</span>
                <span className="font-medium text-gray-800">{settings?.whatsappNumber || '—'}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No payment details configured yet. Click Edit to add them.</p>
          )}
        </div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Edit Payment Details</h2>
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                } rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent`}
                placeholder="e.g. GTBank"
              />
              {errors.bankName && (
                <p className="mt-1 text-sm text-red-500">{errors.bankName.message}</p>
              )}
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
              <input
                {...register('bankAccountName')}
                className={`w-full border ${
                  errors.bankAccountName ? 'border-red-500' : 'border-gray-200'
                } rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent`}
                placeholder="e.g. LotceWieth Store"
              />
              {errors.bankAccountName && (
                <p className="mt-1 text-sm text-red-500">{errors.bankAccountName.message}</p>
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
                } rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent`}
                placeholder="0123456789"
              />
              {errors.bankAccountNumber && (
                <p className="mt-1 text-sm text-red-500">{errors.bankAccountNumber.message}</p>
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
                } rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent`}
                placeholder="+2348000000000"
              />
              {errors.whatsappNumber && (
                <p className="mt-1 text-sm text-red-500">{errors.whatsappNumber.message}</p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2.5 bg-leaf-green text-white rounded-xl font-medium shadow-lg hover:shadow-leaf-green/30 transition disabled:opacity-60"
              >
                {updating ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
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