import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

const footerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const columnVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

const linkHover = {
  rest: { x: 0 },
  hover: { x: 4, color: '#e8622a', transition: { duration: 0.2 } },
};

const socialIconSpring = {
  rest: { scale: 1 },
  hover: {
    scale: 1.2,
    rotate: [0, -8, 8, 0],
    transition: { type: 'spring' as const, stiffness: 400 },
  },
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <motion.footer
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20px' }}
      className="relative mt-20 border-t border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden
        bg-white dark:bg-gray-900/90 backdrop-blur-xl"
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <motion.div
          animate={{ x: ['-10%', '10%', '-10%'], y: ['-5%', '5%', '-5%'] }}
          transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
          className="absolute top-0 -left-20 w-72 h-72 bg-[#e8622a]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: ['10%', '-10%', '10%'], y: ['10%', '-10%', '10%'] }}
          transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
          className="absolute bottom-0 -right-20 w-96 h-96 bg-[#e8622a]/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <motion.div variants={columnVariants} className="space-y-4">
            <Link to="/" className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Sholly<span className="text-[#e8622a]">Store</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              Your one‑stop destination for quality products – from fashion to beverages, delivered fast and reliably.
            </p>
            <div className="flex gap-3 pt-2">
              <SocialIcon href="https://facebook.com/shollystore" icon={<FaFacebook size={20} />} />
              <SocialIcon href="https://instagram.com/shollystore" icon={<FaInstagram size={20} />} />
              <SocialIcon href="https://twitter.com/shollystore" icon={<FaTwitter size={20} />} />
              <SocialIcon href="https://youtube.com/@shollystore" icon={<FaYoutube size={20} />} />
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={columnVariants}>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              {quickLinks.map((item) => (
                <motion.li
                  key={item.name}
                  variants={linkHover}
                  initial="rest"
                  whileHover="hover"
                >
                  <Link
                    to={item.path}
                    className="block hover:text-[#e8622a] transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={columnVariants}>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li className="flex items-center gap-3">
                <MapPin size={18} className="text-[#e8622a]" />
                <span>Lagos, Nigeria</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#e8622a]" />
                <a href="tel:+2349012345678" className="hover:text-[#e8622a] transition-colors">
                  +234 901 234 5678
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#e8622a]" />
                <a href="mailto:hello@shollystore.com" className="hover:text-[#e8622a] transition-colors">
                  hello@shollystore.com
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={columnVariants} className="md:col-span-2">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Stay in the Loop</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Subscribe for exclusive deals, new arrivals, and discounts.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 w-full">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 min-w-[160px] px-5 py-3.5 text-base bg-white dark:bg-white border border-gray-300 dark:border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8622a] placeholder:text-gray-500 text-gray-800"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03, boxShadow: '0 8px 20px rgba(232,98,42,0.3)' }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3.5 text-base bg-[#e8622a] text-white rounded-xl font-medium hover:bg-[#c9511f] transition-colors whitespace-nowrap shrink-0"
              >
                Subscribe
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          variants={columnVariants}
          className="mt-12 pt-6 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 dark:text-gray-400"
        >
          <span>&copy; {currentYear} ShollyStore. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-[#e8622a] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#e8622a] transition-colors">
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

const SocialIcon = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    variants={socialIconSpring}
    initial="rest"
    whileHover="hover"
    className="p-2.5 backdrop-blur-sm rounded-full border border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-[#e8622a] hover:border-[#e8622a]/50 transition-all duration-200"
  >
    {icon}
  </motion.a>
);

export default Footer;