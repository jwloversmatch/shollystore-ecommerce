const HomePromoBanners = () => {
  return (
    <section
      className="max-w-7xl mx-auto px-4 md:px-6 py-10"
      aria-labelledby="promo-banners-heading"
    >
      {/* Hidden heading — establishes a valid H2 for this section so the H3s pass */}
      <h2 id="promo-banners-heading" className="sr-only">
        Current Promotions
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-6 bg-gradient-to-r from-[#e8622a] to-[#f59e0b] text-white">
          <h3 className="text-2xl font-black">Free Shipping</h3>
          <p className="mt-2">On orders over ₦50,000 across Nigeria.</p>
        </div>
        <div className="rounded-2xl p-6 bg-gradient-to-r from-[#10b981] to-[#34d399] text-white">
          <h3 className="text-2xl font-black">Bulk Discounts</h3>
          <p className="mt-2">Save up to 15% when you buy in bulk.</p>
        </div>
      </div>
    </section>
  );
};

export default HomePromoBanners;