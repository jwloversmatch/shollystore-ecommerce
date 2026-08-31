import { useState, useRef } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import {
  useGetAllHeroSlidesQuery,
  useCreateHeroSlideMutation,
  useUpdateHeroSlideMutation,
  useDeleteHeroSlideMutation,
  useUploadImageMutation,
} from "../../features/api/apiSlice";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  X,
  UploadCloud,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmationModal from "../../components/ConfirmationModal";
import { getCloudinaryUrl } from "../../utils/cloudinary";
import { useTheme } from "../../context/ThemeContext";

// ─── Constants ─────────────────────────────────────────────────────────────────
const ACCENT = "#e8622a";

// ─── Interfaces ────────────────────────────────────────────────────────────────
interface HeroSlide {
  _id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  order: number;
  isActive: boolean;
}

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/150";

const HeroSlides = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: slides, isLoading, refetch } = useGetAllHeroSlidesQuery({});
  const [createSlide] = useCreateHeroSlideMutation();
  const [updateSlide] = useUpdateHeroSlideMutation();
  const [deleteSlide] = useDeleteHeroSlideMutation();
  const [uploadImage] = useUploadImageMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    isActive: true,
    order: 0,
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<string | null>(null);

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
  const modalBg = isDark ? "#141414" : "#fff";
  const modalBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const overlayBg = isDark ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0.4)";

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSlide(null);
    setFile(null);
  };

  useFocusTrap(modalRef, isModalOpen, handleCloseModal);

  const handleOpenModal = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        title: slide.title,
        subtitle: slide.subtitle,
        imageUrl: slide.imageUrl,
        isActive: slide.isActive,
        order: slide.order,
      });
    } else {
      setEditingSlide(null);
      setFormData({
        title: "",
        subtitle: "",
        imageUrl: "",
        isActive: true,
        order: 0,
      });
    }
    setFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = formData.imageUrl;
      if (file) {
        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append("image", file);
        const uploadRes = await uploadImage(formDataUpload).unwrap();
        imageUrl = uploadRes.url;
        setUploading(false);
      }
      const slideData = {
        ...formData,
        imageUrl,
        order: Number(formData.order),
      };
      if (editingSlide) {
        await updateSlide({ id: editingSlide._id, ...slideData }).unwrap();
        toast.success("Slide updated!");
      } else {
        await createSlide(slideData).unwrap();
        toast.success("Slide created!");
      }
      refetch();
      handleCloseModal();
    } catch {
      toast.error("Failed to save slide.");
    }
  };

  const handleDeleteClick = (id: string) => {
    setSlideToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!slideToDelete) return;
    await deleteSlide(slideToDelete);
    refetch();
    setDeleteModalOpen(false);
    setSlideToDelete(null);
  };

  const moveSlide = async (id: string, direction: "up" | "down") => {
    const index = slides.findIndex((s: HeroSlide) => s._id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === slides.length - 1)
    )
      return;
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const current = slides[index];
    const neighbour = slides[swapIndex];
    await Promise.all([
      updateSlide({
        id: current._id,
        ...current,
        order: neighbour.order,
      }).unwrap(),
      updateSlide({
        id: neighbour._id,
        ...neighbour,
        order: current.order,
      }).unwrap(),
    ]);
    refetch();
  };

  // ══════ LOADING ═════════════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto space-y-6 focus:outline-none pt-[calc(56px_+_env(safe-area-inset-top,0px))] md:pt-[calc(80px_+_env(safe-area-inset-top,0px))] lg:pt-[calc(88px_+_env(safe-area-inset-top,0px))]"
        style={{ background: bg }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-5 w-32 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
              <div className="h-3 w-48 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
            </div>
          </div>
          <div className="h-10 w-28 rounded-xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
        </div>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        >
          <div
            className="overflow-x-auto"
            role="status"
            aria-label="Loading hero slides"
          >
            <span className="sr-only">Loading...</span>
            <table className="w-full text-left">
              <thead style={{ background: theadBg }}>
                <tr>
                  {[
                    "Image",
                    "Title",
                    "Subtitle",
                    "Active",
                    "Order",
                    "Actions",
                  ].map((h) => (
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
                  <tr
                    key={idx}
                    className="border-t"
                    style={{ borderColor: tableBorder }}
                  >
                    {Array.from({ length: 6 }).map((_, c) => (
                      <td key={c} className="px-4 sm:px-6 py-3">
                        <div
                          className="h-4 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse"
                          style={{ width: c === 0 ? "3rem" : "80%" }}
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

  // ══════ MAIN PAGE ════════════════════════════════════════════════════════════
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto space-y-6 focus:outline-none pt-[calc(56px_+_env(safe-area-inset-top,0px))] md:pt-[calc(80px_+_env(safe-area-inset-top,0px))] lg:pt-[calc(88px_+_env(safe-area-inset-top,0px))]"
      style={{ background: bg }}
    >
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Slide"
        message="Are you sure you want to delete this hero slide? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                <ToggleRight
                  className="w-3 h-3"
                  style={{ color: ACCENT }}
                  aria-hidden="true"
                />
              </div>
              <p
                className="text-[10px] font-extrabold uppercase tracking-[0.2em]"
                style={{ color: ACCENT }}
              >
                Admin
              </p>
            </div>
            <h1
              className="text-2xl md:text-3xl font-black leading-none"
              style={{ color: textPrimary }}
            >
              Hero Slides
            </h1>
            <p className="text-sm mt-0.5" style={{ color: textMuted }}>
              Manage homepage hero carousel slides
            </p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm"
          style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }}
          aria-label="Add new hero slide"
        >
          <Plus className="w-4 h-4" aria-hidden="true" /> Add Slide
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
          <table className="w-full text-left" aria-label="Hero slides list">
            <caption className="sr-only">
              List of hero slides with their details and actions
            </caption>
            <thead style={{ background: theadBg }}>
              <tr>
                {[
                  "Image",
                  "Title",
                  "Subtitle",
                  "Active",
                  "Order",
                  "Actions",
                ].map((h) => (
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
              {slides.map((slide: HeroSlide) => (
                <tr
                  key={slide._id}
                  className="border-t transition-colors"
                  style={{ borderColor: tableBorder }}
                >
                  <td className="px-4 sm:px-6 py-3">
                    <img
                      src={getCloudinaryUrl(
                        slide.imageUrl || PLACEHOLDER_IMAGE,
                        150,
                      )}
                      alt={slide.title}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                      }}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border"
                      style={{ borderColor: inputBorder }}
                    />
                  </td>
                  <td
                    className="px-4 sm:px-6 py-3 font-semibold text-sm"
                    style={{ color: textPrimary }}
                  >
                    {slide.title}
                  </td>
                  <td
                    className="px-4 sm:px-6 py-3 text-sm"
                    style={{ color: textSecondary }}
                  >
                    {slide.subtitle}
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold"
                      style={
                        slide.isActive
                          ? {
                              background: `${ACCENT}15`,
                              color: ACCENT,
                              border: `1px solid ${ACCENT}30`,
                            }
                          : {
                              background: isDark
                                ? "rgba(255,255,255,0.06)"
                                : "rgba(0,0,0,0.05)",
                              color: textMuted,
                              border: inputBorder,
                            }
                      }
                    >
                      {slide.isActive ? (
                        <ToggleRight
                          className="w-3.5 h-3.5"
                          aria-hidden="true"
                        />
                      ) : (
                        <ToggleLeft
                          className="w-3.5 h-3.5"
                          aria-hidden="true"
                        />
                      )}
                      {slide.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td
                    className="px-4 sm:px-6 py-3 text-sm"
                    style={{ color: textSecondary }}
                  >
                    {slide.order}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => moveSlide(slide._id, "up")}
                        className="p-1.5 rounded-lg transition"
                        style={{ color: textMuted }}
                        aria-label={`Move ${slide.title} up`}
                      >
                        <ArrowUp className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => moveSlide(slide._id, "down")}
                        className="p-1.5 rounded-lg transition"
                        style={{ color: textMuted }}
                        aria-label={`Move ${slide.title} down`}
                      >
                        <ArrowDown className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(slide)}
                        className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 transition"
                        aria-label={`Edit ${slide.title}`}
                      >
                        <Edit className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(slide._id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition"
                        aria-label={`Delete ${slide.title}`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {slides.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 sm:px-6 py-12 text-center text-sm"
                    style={{ color: textMuted }}
                  >
                    No slides found. Create your first hero slide to get
                    started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <div
              className="fixed inset-0 z-50"
              style={{ background: overlayBg, backdropFilter: "blur(8px)" }}
              onClick={handleCloseModal}
              role="presentation"
              aria-hidden="true"
            />
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="slide-modal-title"
            >
              <div
                ref={modalRef}
                className="rounded-2xl p-6 max-w-lg w-full border"
                style={{
                  background: modalBg,
                  border: `1px solid ${modalBorder}`,
                  boxShadow: isDark
                    ? "0 40px 90px rgba(0,0,0,0.65)"
                    : "0 20px 50px rgba(0,0,0,0.15)",
                }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2
                    id="slide-modal-title"
                    className="text-xl font-black"
                    style={{ color: textPrimary }}
                  >
                    {editingSlide ? "Edit Slide" : "Add New Slide"}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 rounded-xl hover:bg-white/5 transition"
                    style={{ color: textMuted }}
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  aria-label={
                    editingSlide ? "Edit slide form" : "Create slide form"
                  }
                >
                  <div>
                    <label
                      htmlFor="slide-title"
                      className="block text-[10px] font-extrabold uppercase tracking-widest mb-2"
                      style={{ color: textMuted }}
                    >
                      Title
                    </label>
                    <input
                      id="slide-title"
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
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
                      htmlFor="slide-subtitle"
                      className="block text-[10px] font-extrabold uppercase tracking-widest mb-2"
                      style={{ color: textMuted }}
                    >
                      Subtitle
                    </label>
                    <input
                      id="slide-subtitle"
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) =>
                        setFormData({ ...formData, subtitle: e.target.value })
                      }
                      className="w-full px-4 py-3.5 rounded-xl text-sm outline-none border transition-all"
                      style={{
                        background: inputBg,
                        borderColor: inputBorder,
                        color: textPrimary,
                      }}
                    />
                  </div>
                  <div>
                    <span
                      className="block text-[10px] font-extrabold uppercase tracking-widest mb-2"
                      style={{ color: textMuted }}
                      id="slide-image-label"
                    >
                      Image
                    </span>
                    <div className="flex items-center gap-4">
                      <label
                        className="flex-1 cursor-pointer"
                        aria-labelledby="slide-image-label"
                      >
                        <div
                          className="flex items-center gap-2 px-4 py-3 border border-dashed rounded-xl transition text-sm"
                          style={{ borderColor: inputBorder, color: textMuted }}
                        >
                          <UploadCloud className="w-5 h-5" aria-hidden="true" />
                          {file ? file.name : "Click to upload image"}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          className="sr-only"
                        />
                      </label>
                      {(formData.imageUrl || file) && (
                        <img
                          src={
                            file
                              ? URL.createObjectURL(file)
                              : getCloudinaryUrl(formData.imageUrl, 150)
                          }
                          alt="Preview"
                          className="w-14 h-14 rounded-lg object-cover border"
                          style={{ borderColor: inputBorder }}
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="slide-order"
                      className="block text-[10px] font-extrabold uppercase tracking-widest mb-2"
                      style={{ color: textMuted }}
                    >
                      Order
                    </label>
                    <input
                      id="slide-order"
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3.5 rounded-xl text-sm outline-none border transition-all"
                      style={{
                        background: inputBg,
                        borderColor: inputBorder,
                        color: textPrimary,
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          isActive: !formData.isActive,
                        })
                      }
                      className="relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0"
                      style={{
                        background: formData.isActive ? ACCENT : "#2d2d2d",
                      }}
                      role="switch"
                      aria-checked={formData.isActive}
                      aria-label="Toggle slide active status"
                    >
                      <span
                        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300"
                        style={{
                          transform: formData.isActive
                            ? "translateX(20px)"
                            : "translateX(0)",
                        }}
                      />
                    </button>
                    <span
                      className="text-sm font-bold"
                      style={{ color: textPrimary }}
                    >
                      {formData.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div
                    className="flex justify-end gap-3 pt-4 border-t"
                    style={{ borderColor: inputBorder }}
                  >
                    <button
                      type="button"
                      onClick={handleCloseModal}
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
                      disabled={uploading}
                      className="px-5 py-3 rounded-xl font-black text-white text-sm flex items-center gap-2 transition-all disabled:opacity-55"
                      style={{
                        background: ACCENT,
                        boxShadow: `0 6px 18px ${ACCENT}44`,
                      }}
                    >
                      {uploading ? (
                        <>
                          <Loader2
                            className="w-4 h-4 animate-spin"
                            aria-hidden="true"
                          />{" "}
                          Uploading...
                        </>
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
};

export default HeroSlides;