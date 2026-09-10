import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  useGetAllLegalPagesQuery,
  useUpdateLegalPageMutation,
  LegalPage,
  LegalPageSlug,
} from "../../features/api/apiSlice";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  ArrowLeft,
  FileText,
  Edit2,
  Loader2,
  X,
  Save,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useFocusTrap } from "../../hooks/useFocusTrap";

const ACCENT = "#e8622a";

interface LegalPageFormValues {
  title: string;
  content: string;
}

const LegalPages = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data, isLoading, isError, refetch } = useGetAllLegalPagesQuery();
  const [updateLegalPage, { isLoading: isSaving }] =
    useUpdateLegalPageMutation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<LegalPageSlug | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, reset, setValue } =
    useForm<LegalPageFormValues>();

  // ✅ Memoized pages to avoid re-running effect on every render
  const pages = useMemo(() => data?.pages || [], [data]);

  // ─── Tiptap Editor ───────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setValue("content", html, { shouldValidate: true });
    },
  });

  // When drawer opens with a page, set editor content
  useEffect(() => {
    if (editor && editingSlug) {
      const page = pages.find((p) => p.slug === editingSlug);
      if (page) {
        editor.commands.setContent(page.content);
      }
    }
  }, [editor, editingSlug, pages]);

  // Theme styles (same as before)
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
  const drawerBg = isDark ? "#141414" : "#fff";
  const drawerBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";

  const openDrawer = (page: LegalPage) => {
    setEditingSlug(page.slug);
    reset({
      title: page.title,
      content: page.content,
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingSlug(null);
  };

  useFocusTrap(drawerRef, drawerOpen, closeDrawer);

  const onSubmit = async (data: LegalPageFormValues) => {
    if (!editingSlug) return;
    try {
      await updateLegalPage({
        slug: editingSlug,
        title: data.title,
        content: data.content,
      }).unwrap();
      toast.success("Legal page updated successfully");
      closeDrawer();
      refetch();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to update page");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
          <div className="h-6 w-32 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-6 h-48 bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center text-red-500">
          <AlertCircle className="w-10 h-10 mx-auto mb-4" />
          Failed to load legal pages.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
                <FileText
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
              Legal Pages
            </h1>
          </div>
        </div>
      </header>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page: LegalPage) => (
          <motion.div
            key={page.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl p-6 flex flex-col justify-between"
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              boxShadow: cardShadow,
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-xl font-black capitalize"
                  style={{ color: textPrimary }}
                >
                  {page.slug === "returns" ? "Return Policy" : page.slug}
                </h2>
                <button
                  onClick={() => openDrawer(page)}
                  className="p-2 rounded-lg text-blue-400 hover:text-blue-300 transition-colors hover:bg-blue-500/10"
                  aria-label={`Edit ${page.slug}`}
                >
                  <Edit2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <div
                className="prose prose-sm max-w-none line-clamp-5 overflow-hidden"
                style={{ color: textSecondary }}
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </div>
            <div className="mt-4 text-xs font-semibold" style={{ color: textMuted }}>
              Last updated:{" "}
              {page.updatedAt
                ? new Date(page.updatedAt).toLocaleDateString()
                : "—"}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Slide‑in Drawer for Editing */}
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
              className="fixed right-0 top-0 h-full w-full max-w-full sm:max-w-xl shadow-2xl z-50 overflow-y-auto p-6"
              style={{
                background: drawerBg,
                borderLeft: `1px solid ${drawerBorder}`,
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="drawer-title"
            >
              <div className="flex justify-between items-center mb-6">
                <h2
                  id="drawer-title"
                  className="text-xl font-black"
                  style={{ color: textPrimary }}
                >
                  Edit {editingSlug === "returns" ? "Return Policy" : editingSlug}
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label
                    htmlFor="legal-title"
                    className="block text-[10px] font-extrabold uppercase tracking-widest mb-2"
                    style={{ color: textMuted }}
                  >
                    Title
                  </label>
                  <input
                    id="legal-title"
                    {...register("title", { required: true })}
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
                    htmlFor="legal-content"
                    className="block text-[10px] font-extrabold uppercase tracking-widest mb-2"
                    style={{ color: textMuted }}
                  >
                    Content
                  </label>
                  <EditorContent
                    editor={editor}
                    className="min-h-[200px] prose prose-sm max-w-none"
                  />
                </div>
                <div
                  className="flex justify-end gap-3 pt-4 border-t"
                  style={{ borderColor: inputBorder }}
                >
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
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-black text-white text-sm transition-all disabled:opacity-55"
                    style={{
                      background: ACCENT,
                      boxShadow: `0 6px 18px ${ACCENT}44`,
                    }}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LegalPages;