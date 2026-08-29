import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import {
  Package,
  Truck,
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  Users,
  Award,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  const stats = [
    { icon: Package, value: '5,000+', label: 'Products' },
    { icon: Users, value: '10,000+', label: 'Happy Customers' },
    { icon: Truck, value: '24hr', label: 'Fast Delivery' },
    { icon: Award, value: '4.9/5', label: 'Average Rating' },
  ];

  const values = [
    {
      icon: ShieldCheck,
      title: 'Trust & Quality',
      description:
        'Every product is carefully vetted to ensure it meets our high standards. We partner with trusted suppliers to bring you authentic, quality goods.',
    },
    {
      icon: Truck,
      title: 'Lightning‑Fast Delivery',
      description:
        'We understand you want your orders quickly. Our logistics network ensures your packages arrive on time, every time.',
    },
    {
      icon: HeartHandshake,
      title: 'Customer‑First Service',
      description:
        'Our support team is here for you 24/7. We listen, we care, and we go the extra mile to make your shopping experience seamless.',
    },
    {
      icon: Globe,
      title: 'Nationwide Reach',
      description:
        'From Lagos to Kano, we deliver across Nigeria, bringing the best products right to your doorstep.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  };

  return (
    <>
      <SEO
        title="About Us"
        description="Discover the story behind Sholex – your trusted destination for quality products, fast delivery, and exceptional customer service."
        canonicalUrl="https://sholex.vercel.app/about"
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[#FCFAF5] dark:bg-[#0A0A0B] pb-16 focus:outline-none"
        style={{ paddingTop: 'calc(56px + env(safe-area-inset-top, 0px))' }}
      >
        {/* ─── Hero Section ─── */}
        <section className="relative overflow-hidden py-16 md:py-24">
          {/* Decorative background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#e8622a]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#e8622a]/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight"
            >
              We're <span className="text-[#e8622a]">Sholex</span>.<br />
              <span className="text-xl md:text-3xl font-bold text-gray-600 dark:text-gray-300">
                Your one‑stop shop for everything you love.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400"
            >
              Born from a passion to make quality products accessible to every
              Nigerian, Sholex has grown into a trusted marketplace that
              connects you with the best in fashion, electronics, beverages,
              and more.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 flex flex-wrap justify-center gap-4"
            >
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#e8622a] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:bg-[#c9511f]"
              >
                Shop Now <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ─── Stats Section ─── */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-white dark:bg-[#141414] rounded-2xl p-6 text-center border border-gray-200 dark:border-white/[0.06] shadow-sm"
                >
                  <stat.icon className="w-8 h-8 text-[#e8622a] mx-auto mb-3" />
                  <div className="text-3xl font-black text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── Our Story ─── */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-6"
            >
              Our Story
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-4"
            >
              <p>
                Sholex started with a simple idea: shopping online should be
                easy, fast, and reliable. Frustrated by unreliable delivery
                and a lack of quality options, our founders set out to build a
                platform that Nigerians could trust.
              </p>
              <p>
                Today, we serve thousands of customers across the country,
                offering a curated selection of products that we would proudly
                use ourselves. From the latest fashion trends to everyday
                essentials, we've got you covered.
              </p>
              <p>
                Our mission is to become the most loved online store in
                Nigeria – not just for our products, but for the experience we
                provide. Every order, every interaction, every click matters
                to us.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ─── Core Values ─── */}
        <section className="py-16 bg-gray-50 dark:bg-[#111]">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white text-center mb-12"
            >
              What We Stand For
            </motion.h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-8"
            >
              {values.map((value, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-white dark:bg-[#1c1c1c] rounded-2xl p-8 border border-gray-200 dark:border-white/[0.06] shadow-sm"
                >
                  <value.icon className="w-10 h-10 text-[#e8622a] mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── CTA Section ─── */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-[#e8622a] rounded-3xl p-12 text-white shadow-xl"
            >
              <Sparkles className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-black mb-4">
                Ready to experience the Sholex difference?
              </h2>
              <p className="text-white/90 mb-8 max-w-md mx-auto">
                Join thousands of happy customers who trust us for their
                everyday needs.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#e8622a] rounded-xl font-bold hover:bg-gray-100 transition-colors"
              >
                Start Shopping <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
};

export default About;