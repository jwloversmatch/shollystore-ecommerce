// src/pages/ReturnPolicy.tsx
import SEO from '../components/SEO';
import { motion } from 'framer-motion';

const ReturnPolicy = () => {
  return (
    <>
      <SEO
        title="Return & Refund Policy"
        description="Learn about Sholex's return and refund policy. We want you to be satisfied with your purchase. Read our guidelines for returns, refunds, and exchanges."
        canonicalUrl="https://sholex.vercel.app/returns"
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
            Return & Refund Policy
          </motion.h1>

          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6">
            <p>
              <strong>Last updated:</strong>{' '}
              {new Date().toLocaleDateString('en-NG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">1. Return Window</h2>
            <p>
              We accept return requests within <strong>7 days</strong> from the date you receive your order. If more than 7 days have passed, unfortunately we cannot offer a refund or exchange.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">2. Eligibility for Return</h2>
            <p>To be eligible for a return, the item must be:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Unused, unwashed, and in the same condition you received it.</li>
              <li>In its original packaging with all tags and labels intact.</li>
              <li>Accompanied by the receipt or proof of purchase.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">3. Non‑Returnable Items</h2>
            <p>
              Certain items cannot be returned for health, hygiene, or safety reasons. These include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Perishable goods (e.g., beverages, food items).</li>
              <li>Personal care products (e.g., cosmetics, underwear).</li>
              <li>Items marked as final sale or clearance.</li>
              <li>Gift cards and downloadable digital products.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">4. How to Initiate a Return</h2>
            <p>To start a return, please follow these steps:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Contact our support team at <a href="mailto:hello@sholex.com" className="text-[#e8622a] underline">hello@sholex.com</a> within the return window.</li>
              <li>Provide your order number, the item(s) you wish to return, and the reason for return.</li>
              <li>Our team will review your request and send you return instructions if approved.</li>
              <li>Pack the item securely and send it back using the provided address.</li>
            </ol>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">5. Refund Process</h2>
            <p>
              Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, the refund will be processed to your original method of payment within{' '}
              <strong>5–10 business days</strong>.
            </p>
            <p>
              Please note that shipping charges are non‑refundable, and you will be responsible for return shipping costs unless the item arrived damaged or incorrect.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">6. Exchanges</h2>
            <p>
              If you need a different size, colour, or a replacement for a defective item, please contact us. We will do our best to arrange an exchange subject to stock availability.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">7. Damaged or Incorrect Items</h2>
            <p>
              If you receive a damaged, defective, or incorrect item, please contact us immediately (within 48 hours of delivery) with photos of the issue. We will arrange a replacement or full refund, including shipping costs.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">8. Contact Us</h2>
            <p>
              For any questions regarding returns or refunds, reach out to us at{' '}
              <a href="mailto:hello@sholex.com" className="text-[#e8622a] underline">
                hello@sholex.com
              </a>{' '}
              or call{' '}
              <a href="tel:+2349012345678" className="text-[#e8622a] underline">
                +234 901 234 5678
              </a>.
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default ReturnPolicy;