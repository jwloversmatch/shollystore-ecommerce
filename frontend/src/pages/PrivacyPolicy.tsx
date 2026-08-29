// src/pages/PrivacyPolicy.tsx
import SEO from '../components/SEO';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <>
      <SEO
        title="Privacy Policy"
        description="Learn how Sholex collects, uses, and protects your personal information."
        canonicalUrl="https://sholex.vercel.app/privacy"
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[#FCFAF5] dark:bg-[#0A0A0B] pb-16"
        style={{ paddingTop: 'calc(56px + env(safe-area-inset-top, 0px))' }}
      >
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-8"
          >
            Privacy Policy
          </motion.h1>

          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6">
            <p>
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">1. Introduction</h2>
            <p>At Sholex, we value your privacy. This policy explains how we collect, use, store, and protect your personal information when you use our website and services.</p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">2. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, phone number, and password when you create an account.</li>
              <li><strong>Order Information:</strong> Shipping address, billing address, and purchase history.</li>
              <li><strong>Payment Details:</strong> We do not store full credit card numbers; payments are processed securely by our payment partners.</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent, and device information to improve our services.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To process and deliver your orders.</li>
              <li>To send order updates and account notifications.</li>
              <li>To personalise your shopping experience.</li>
              <li>To improve our website, products, and customer service.</li>
              <li>To send marketing emails if you have opted in.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">4. Data Sharing</h2>
            <p>We do not sell your personal data. We may share your information with trusted third parties who assist us in operating our website, processing payments, and delivering orders. These partners are obligated to keep your data confidential.</p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">5. Data Security</h2>
            <p>We implement industry‑standard security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">6. Cookies</h2>
            <p>We use cookies to remember your preferences, keep you logged in, and analyse site traffic. You can control cookies through your browser settings.</p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">7. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. You may also withdraw consent for marketing at any time. To exercise these rights, contact us at <a href="mailto:hello@sholex.com" className="text-[#e8622a] underline">hello@sholex.com</a>.</p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page.</p>
          </div>
        </div>
      </main>
    </>
  );
};

export default PrivacyPolicy;