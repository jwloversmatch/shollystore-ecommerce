// src/pages/TermsOfUse.tsx
import SEO from '../components/SEO';
import { motion } from 'framer-motion';

const TermsOfUse = () => {
  return (
    <>
      <SEO
        title="Terms of Use"
        description="These terms govern your use of Sholex. Please read them carefully before using our services."
        canonicalUrl="https://sholex.vercel.app/terms"
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
            Terms of Use
          </motion.h1>

          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6">
            <p>
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
            <p>By accessing or using Sholex, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree, please do not use our services.</p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">2. Use of the Website</h2>
            <p>You may use our website for lawful purposes only. You must not misuse the site by introducing viruses, attempting unauthorised access, or engaging in fraudulent activity.</p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">3. Account Responsibility</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorised use.</p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">4. Product Information & Pricing</h2>
            <p>We strive to display accurate product information, but errors may occur. We reserve the right to correct any inaccuracies, change prices, or discontinue products without prior notice.</p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">5. Orders & Payment</h2>
            <p>All orders are subject to acceptance and availability. Payment must be made in full at the time of order. We accept the payment methods listed during checkout.</p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">6. Shipping & Returns</h2>
            <p>Shipping and return policies are described on our website and form part of these Terms. Please review them before placing an order.</p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">7. Intellectual Property</h2>
            <p>All content on this site, including logos, text, graphics, and images, is the property of Sholex or its licensors and is protected by copyright and trademark laws.</p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">8. Limitation of Liability</h2>
            <p>Sholex shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our total liability shall not exceed the amount paid for the product in question.</p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">9. Governing Law</h2>
            <p>These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be subject to the exclusive jurisdiction of the Nigerian courts.</p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">10. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at <a href="mailto:hello@sholex.com" className="text-[#e8622a] underline">hello@sholex.com</a>.</p>
          </div>
        </div>
      </main>
    </>
  );
};

export default TermsOfUse;