// src/pages/ReturnPolicy.tsx
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { useGetLegalPageQuery } from '../features/api/apiSlice';
import { Loader2, AlertCircle } from 'lucide-react';

const ReturnPolicy = () => {
  const { data, isLoading, isError } = useGetLegalPageQuery('returns');

  const page = data?.page;
  const title = page?.title || 'Return & Refund Policy';
  const content = page?.content || '';

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] dark:bg-[#0F1011]">
        <Loader2 className="w-10 h-10 animate-spin text-[#e8622a]" />
      </main>
    );
  }

  if (isError || !page) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] dark:bg-[#0F1011] px-4">
        <div className="text-red-500 text-center">
          <AlertCircle className="w-10 h-10 mx-auto mb-4" />
          <p className="text-lg font-semibold">
            Failed to load return policy. Please try again later.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <SEO
        title={title}
        description={
          page?.title
            ? `Read our ${page.title.toLowerCase()}.`
            : "Learn about Sholex's return and refund policy."
        }
        canonicalUrl="https://sholex.vercel.app/returns"
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[#FCFAF5] dark:bg-[#0F1011] pb-16"
        style={{ paddingTop: 'calc(56px + env(safe-area-inset-top, 0px))' }}
      >
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-8"
          >
            {title}
          </motion.h1>

          <div
            className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </main>
    </>
  );
};

export default ReturnPolicy;