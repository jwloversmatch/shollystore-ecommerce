import { useState, useRef, useEffect } from "react";
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

// ─── Constants ─────────────────────────────────────────────────────────────────
const ACCENT = "#e8622a";
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSlide(null);
    setFile(null);
  };

  // Focus trap: add/edit slide modal
  useEffect(() => {
    if (!isModalOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = modalRef.current;
    const focusable = dialog
      ? Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      : [];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseModal();
        return;
      }
      if (e.key === "Tab" && focusable.length > 0) {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isModalOpen]);

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
        className="min-h-screen p-4 md:p-6 pt-20 md:pt-24 max-w-7xl mx-auto space-y-6 focus:outline-none"
        style={{ background: "#0A0A0B" }}
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
          style={{
            background: "#141414",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            className="overflow-x-auto"
            role="status"
            aria-label="Loading hero slides"
          >
            <span className="sr-only">Loading...</span>
            <table className="w-full text-left">
              <thead style={{ background: "rgba(255,255,255,0.03)" }}>
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
                      className="px-4 sm:px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-600"
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
                    style={{ borderColor: "rgba(255,255,255,0.05)" }}
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
      className="min-h-screen p-4 md:p-6 pt-20 md:pt-24 max-w-7xl mx-auto space-y-6 focus:outline-none"
      style={{ background: "#0A0A0B" }}
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
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors shrink-0"
            style={{
              background: "#1c1c1c",
              border: "1px solid rgba(255,255,255,0.08)",
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
            <h1 className="text-2xl md:text-3xl font-black text-white leading-none">
              Hero Slides
            </h1>
            <p className="text-gray-600 text-sm mt-0.5">
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
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left" aria-label="Hero slides list">
            <caption className="sr-only">
              List of hero slides with their details and actions
            </caption>
            <thead style={{ background: "rgba(255,255,255,0.03)" }}>
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
                    className="px-4 sm:px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-600"
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
                  className="border-t transition-colors hover:bg-white/[0.015]"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}
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
                      style={{ borderColor: "rgba(255,255,255,0.08)" }}
                    />
                  </td>
                  <td className="px-4 sm:px-6 py-3 font-semibold text-sm text-white">
                    {slide.title}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm text-gray-400">
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
                              background: "rgba(255,255,255,0.06)",
                              color: "#6b7280",
                              border: "1px solid rgba(255,255,255,0.08)",
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
                  <td className="px-4 sm:px-6 py-3 text-sm text-gray-400">
                    {slide.order}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => moveSlide(slide._id, "up")}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-white transition"
                        aria-label={`Move ${slide.title} up`}
                      >
                        <ArrowUp className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => moveSlide(slide._id, "down")}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-white transition"
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
                    className="px-4 sm:px-6 py-12 text-center text-gray-500 text-sm"
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
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
                  background: "#141414",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 40px 90px rgba(0,0,0,0.65)",
                }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2
                    id="slide-modal-title"
                    className="text-xl font-black text-white"
                  >
                    {editingSlide ? "Edit Slide" : "Add New Slide"}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 rounded-xl hover:bg-white/5 transition text-gray-500 hover:text-white"
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
                  {/* Title */}
                  <div>
                    <label
                      htmlFor="slide-title"
                      className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2"
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
                      className="w-full px-4 py-3.5 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none border border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15 transition-all"
                    />
                  </div>
                  {/* Subtitle */}
                  <div>
                    <label
                      htmlFor="slide-subtitle"
                      className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2"
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
                      className="w-full px-4 py-3.5 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none border border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15 transition-all"
                    />
                  </div>
                  {/* Image upload */}
                  <div>
                    <span
                      className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2"
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
                          className="flex items-center gap-2 px-4 py-3 border border-dashed rounded-xl transition text-sm text-gray-500 hover:text-gray-300"
                          style={{ borderColor: "rgba(255,255,255,0.1)" }}
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
                          alt="Preview of selected image"
                          className="w-14 h-14 rounded-lg object-cover border"
                          style={{ borderColor: "rgba(255,255,255,0.08)" }}
                        />
                      )}
                    </div>
                  </div>
                  {/* Order */}
                  <div>
                    <label
                      htmlFor="slide-order"
                      className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2"
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
                      className="w-full px-4 py-3.5 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none border border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15 transition-all"
                    />
                  </div>
                  {/* Active toggle */}
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
                        boxShadow: formData.isActive
                          ? `0 0 10px ${ACCENT}55`
                          : "none",
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
                    <span className="text-sm font-bold text-white">
                      {formData.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {/* Actions */}
                  <div
                    className="flex justify-end gap-3 pt-4 border-t"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-5 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-white transition-colors"
                      style={{
                        background: "#1c1c1c",
                        border: "1px solid rgba(255,255,255,0.08)",
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
