import SEO from "../../../components/SEO";

const CheckoutLoadingView = () => (
  <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] dark:bg-[#0F1011]">
    <SEO title="Checkout" description="Complete your order securely." />
    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
  </main>
);

export default CheckoutLoadingView;