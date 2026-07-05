import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetSettingsChangesQuery,
} from "../../features/api/apiSlice";
import {
  ArrowLeft,
  Banknote,
  MessageCircle,
  Building,
  Pencil,
  Trash2,
  Check,
  Home,
  History,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";   // ← added toggle icons
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../../components/ConfirmationModal";

// ---------- Zod Schema (still required for the full edit form) ----------
const settingsSchema = z.object({
  bankAccountName: z.string().min(1, "Account name is required"),
  bankAccountNumber: z.string().min(1, "Account number is required"),
  bankName: z.string().min(1, "Bank name is required"),
  whatsappNumber: z.string().min(1, "WhatsApp number is required"),
  heroTagline: z.string().optional(),
  heroTitle: z.string().optional(),
  heroDescription: z.string().optional(),
  specialOfferTitle: z.string().optional(),
  specialOfferText: z.string().optional(),
  landingMode: z.boolean().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

// ---------- Audit log item type ----------
interface ChangeLogItem {
  _id: string;
  field: string;
  oldValue: string;
  newValue: string;
  adminEmail: string;
  changedAt: string;
}

const Settings = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [showChanges, setShowChanges] = useState(false);

  const { data: settings, isLoading, refetch } = useGetSettingsQuery({});
  const [updateSettings, { isLoading: updating }] = useUpdateSettingsMutation();
  const { data: changeLogs = [] } = useGetSettingsChangesQuery({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  // Pre‑fill form when settings load
  useEffect(() => {
    if (settings) {
      reset({
        bankAccountName: settings.bankAccountName || "",
        bankAccountNumber: settings.bankAccountNumber || "",
        bankName: settings.bankName || "",
        whatsappNumber: settings.whatsappNumber || "",
        heroTagline: settings.heroTagline || "",
        heroTitle: settings.heroTitle || "",
        heroDescription: settings.heroDescription || "",
        specialOfferTitle: settings.specialOfferTitle || "",
        specialOfferText: settings.specialOfferText || "",
        landingMode: settings.landingMode || false,
      });
    }
  }, [settings, reset]);

  // ---------- Form submit for the full edit mode ----------
  const onSubmit = async (data: SettingsFormData) => {
    try {
      await updateSettings(data).unwrap();
      toast.success("Settings updated successfully!");
      refetch();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error("Failed to update settings.");
    }
  };

  // ---------- Independent Landing Mode toggle ----------
  const toggleLandingMode = async () => {
    const current = settings?.landingMode ?? false;
    try {
      await updateSettings({ landingMode: !current }).unwrap();
      toast.success(`Landing mode ${!current ? "enabled" : "disabled"}`);
      refetch();
    } catch (error) {
      console.error("Failed to toggle landing mode:", error);
      toast.error("Failed to toggle landing mode.");
    }
  };

  // ---------- Clear all settings ----------
  const handleClearAll = async () => {
    try {
      await updateSettings({
        bankAccountName: "",
        bankAccountNumber: "",
        bankName: "",
        whatsappNumber: "",
        heroTagline: "",
        heroTitle: "",
        heroDescription: "",
        specialOfferTitle: "",
        specialOfferText: "",
        landingMode: false,
      }).unwrap();
      toast.success("Settings cleared!");
      refetch();
      setIsEditing(false);
      setClearModalOpen(false);
    } catch (error) {
      console.error("Failed to clear settings:", error);
      toast.error("Failed to clear settings.");
    }
  };

  // ---------- Loading skeleton ----------
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 pt-20 md:pt-24 max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-64 bg-white/80 rounded-2xl border border-gray-100" />
          <div className="h-64 bg-white/80 rounded-2xl border border-gray-100" />
        </div>
      </div>
    );
  }

  const hasSettings =
    settings?.bankAccountName ||
    settings?.bankAccountNumber ||
    settings?.bankName ||
    settings?.whatsappNumber;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6 pt-20 md:pt-24 max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate("/admin")}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Store Settings
        </h1>
      </div>

      {/* -------- VIEW MODE (not editing) -------- */}
      {!isEditing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Homepage Content Preview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Home className="w-5 h-5 text-leaf-green" />
                Homepage Content
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  Tagline
                </span>
                <p className="font-medium text-gray-800">
                  {settings?.heroTagline || "—"}
                </p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  Title
                </span>
                <p className="font-medium text-gray-800">
                  {settings?.heroTitle || "—"}
                </p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  Description
                </span>
                <p className="font-medium text-gray-800">
                  {settings?.heroDescription || "—"}
                </p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  Special Offer Title
                </span>
                <p className="font-medium text-gray-800">
                  {settings?.specialOfferTitle || "—"}
                </p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  Special Offer Text
                </span>
                <p className="font-medium text-gray-800">
                  {settings?.specialOfferText || "—"}
                </p>
              </div>

              {/* ✅ Landing Mode with dedicated toggle (works instantly) */}
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  Landing Mode
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <p className="font-medium text-gray-800">
                    {settings?.landingMode ? "Yes" : "No"}
                  </p>
                  <button
                    onClick={toggleLandingMode}
                    className="text-leaf-green hover:text-green-700 transition-colors"
                    title="Toggle landing mode"
                  >
                    {settings?.landingMode ? (
                      <ToggleRight className="w-6 h-6" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Preview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Banknote className="w-5 h-5 text-leaf-green" />
                Payment Details
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-200"
                >
                  <Pencil className="w-4 h-4" />
                  Edit All Settings
                </button>
                {hasSettings && (
                  <button
                    onClick={() => setClearModalOpen(true)}
                    className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {hasSettings ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <Building className="w-5 h-5 text-leaf-green shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Bank
                    </p>
                    <p className="font-medium text-gray-800">
                      {settings?.bankName || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <Banknote className="w-5 h-5 text-leaf-green shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Account Name
                    </p>
                    <p className="font-medium text-gray-800">
                      {settings?.bankAccountName || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <Banknote className="w-5 h-5 text-leaf-green shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Account Number
                    </p>
                    <p className="font-medium text-gray-800 font-mono">
                      {settings?.bankAccountNumber || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <MessageCircle className="w-5 h-5 text-leaf-green shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      WhatsApp
                    </p>
                    <p className="font-medium text-gray-800">
                      {settings?.whatsappNumber || "—"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl text-gray-500">
                <span className="text-sm">
                  No payment details configured yet.
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* -------- EDIT MODE (full form with bank details required) -------- */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Homepage Content Form (still includes landingMode checkbox but optional here) */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Home className="w-5 h-5 text-leaf-green" />
                Homepage Content
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hero Tagline
                  </label>
                  <input
                    {...register("heroTagline")}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-leaf-green transition-all placeholder:text-gray-400"
                    placeholder="e.g. 📦 Bulk Beverage Store"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hero Title
                    <span className="text-xs text-gray-400 ml-1">
                      (Use " | " to make the second part green)
                    </span>
                  </label>
                  <input
                    {...register("heroTitle")}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-leaf-green transition-all placeholder:text-gray-400"
                    placeholder="e.g. Your Everyday | Drink Superstore"
                  />
                </div>
                {/* Landing Mode checkbox inside edit mode as well (optional) */}
                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="landingMode"
                    {...register("landingMode")}
                    className="w-4 h-4 text-leaf-green focus:ring-leaf-green rounded"
                  />
                  <label
                    htmlFor="landingMode"
                    className="text-sm text-gray-700 font-medium"
                  >
                    Use landing page layout (full‑screen hero)
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hero Description
                  </label>
                  <textarea
                    {...register("heroDescription")}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-leaf-green transition-all placeholder:text-gray-400 resize-none"
                    placeholder="A short description of your store..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Offer Title
                  </label>
                  <input
                    {...register("specialOfferTitle")}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-leaf-green transition-all placeholder:text-gray-400"
                    placeholder="e.g. Stock Up & Save"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Offer Text
                  </label>
                  <textarea
                    {...register("specialOfferText")}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-leaf-green transition-all placeholder:text-gray-400 resize-none"
                    placeholder="e.g. Get ₦500 off your first bulk order..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Details Form (required fields still validated) */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Banknote className="w-5 h-5 text-leaf-green" />
                Payment Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    {...register("bankName")}
                    className={`w-full border ${errors.bankName ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-leaf-green transition-all placeholder:text-gray-400`}
                    placeholder="e.g. GTBank"
                  />
                  {errors.bankName && (
                    <p className="mt-1 text-sm text-red-600">
                      • {errors.bankName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name
                  </label>
                  <input
                    {...register("bankAccountName")}
                    className={`w-full border ${errors.bankAccountName ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-leaf-green transition-all placeholder:text-gray-400`}
                    placeholder="e.g. LotceWieth Store"
                  />
                  {errors.bankAccountName && (
                    <p className="mt-1 text-sm text-red-600">
                      • {errors.bankAccountName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    {...register("bankAccountNumber")}
                    className={`w-full border ${errors.bankAccountNumber ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-leaf-green transition-all placeholder:text-gray-400`}
                    placeholder="0123456789"
                  />
                  {errors.bankAccountNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      • {errors.bankAccountNumber.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    {...register("whatsappNumber")}
                    className={`w-full border ${errors.whatsappNumber ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-leaf-green transition-all placeholder:text-gray-400`}
                    placeholder="+2348000000000"
                  />
                  {errors.whatsappNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      • {errors.whatsappNumber.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
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
                    Save All Settings
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audit Log */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6">
        <button
          onClick={() => setShowChanges(!showChanges)}
          className="flex items-center gap-2 text-sm font-medium text-leaf-green hover:underline mb-4"
        >
          <History className="w-4 h-4" />
          {showChanges ? "Hide Recent Changes" : "Show Recent Changes"}
        </button>
        {showChanges && (
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase">
                    Field
                  </th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase">
                    Old
                  </th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase">
                    New
                  </th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase">
                    Admin
                  </th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {changeLogs.map((log: ChangeLogItem) => (
                  <tr key={log._id}>
                    <td className="px-3 py-2 font-medium">{log.field}</td>
                    <td className="px-3 py-2 text-gray-500 max-w-[150px] truncate">
                      {log.oldValue}
                    </td>
                    <td className="px-3 py-2 text-gray-500 max-w-[150px] truncate">
                      {log.newValue}
                    </td>
                    <td className="px-3 py-2">{log.adminEmail}</td>
                    <td className="px-3 py-2 text-gray-400">
                      {new Date(log.changedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Clear All Modal */}
      <ConfirmationModal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        onConfirm={handleClearAll}
        title="Clear All Settings?"
        message="This will remove all payment details and homepage content. Are you sure?"
        confirmText="Clear All"
        cancelText="Cancel"
        type="danger"
      />
    </motion.div>
  );
};

export default Settings;