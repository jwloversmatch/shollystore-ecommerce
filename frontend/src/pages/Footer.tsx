import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

// ---------- Animation Variants ----------
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
  hover: { x: 4, color: '#4a8f29', transition: { duration: 0.2 } },
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

  // Quick links data
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
      className="relative mt-20 bg-gray-900/90 backdrop-blur-xl border-t border-white/10 shadow-2xl overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <motion.div
          animate={{ x: ['-10%', '10%', '-10%'], y: ['-5%', '5%', '-5%'] }}
          transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
          className="absolute top-0 -left-20 w-72 h-72 bg-leaf-green/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: ['10%', '-10%', '10%'], y: ['10%', '-10%', '10%'] }}
          transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
          className="absolute bottom-0 -right-20 w-96 h-96 bg-blob-orange/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <motion.div variants={columnVariants} className="space-y-4">
            <Link to="/" className="text-2xl font-bold text-white tracking-tight">
              Lotce<span className="text-leaf-green">Wieth</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Bringing the coldest, most refreshing beverages straight to your
              doorstep across Nigeria. Stay refreshed, stay chilled.
            </p>
            <div className="flex gap-3 pt-2">
              <SocialIcon href="https://facebook.com" icon={<FaFacebook size={20} />} />
              <SocialIcon href="https://instagram.com" icon={<FaInstagram size={20} />} />
              <SocialIcon href="https://twitter.com" icon={<FaTwitter size={20} />} />
              <SocialIcon href="https://youtube.com" icon={<FaYoutube size={20} />} />
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={columnVariants}>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {quickLinks.map((item) => (
                <motion.li
                  key={item.name}
                  variants={linkHover}
                  initial="rest"
                  whileHover="hover"
                >
                  <Link
                    to={item.path}
                    className="block hover:text-leaf-green transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={columnVariants}>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-3">
                <MapPin size={18} className="text-leaf-green" />
                <span>Lagos, Nigeria</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-leaf-green" />
                <a
                  href="tel:+2348000000000"
                  className="hover:text-leaf-green transition-colors"
                >
                  +234 800 000 0000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-leaf-green" />
                <a
                  href="mailto:hello@lotcewieth.com"
                  className="hover:text-leaf-green transition-colors"
                >
                  hello@lotcewieth.com
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={columnVariants} className="md:col-span-2">
            <h4 className="font-semibold text-white mb-4">Stay Fresh</h4>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to get updates on new arrivals and exclusive offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 w-full">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 min-w-[160px] px-5 py-3.5 text-base bg-white rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-leaf-green placeholder:text-gray-500 text-gray-800"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03, boxShadow: '0 8px 20px rgba(74, 143, 41, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3.5 text-base bg-leaf-green text-white rounded-xl font-medium hover:bg-green-700 transition-colors whitespace-nowrap shrink-0"
              >
                Subscribe
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          variants={columnVariants}
          className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500"
        >
          <span>&copy; {currentYear} LotceWieth. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-leaf-green transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-leaf-green transition-colors">
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

// Helper component for social icons
const SocialIcon = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    variants={socialIconSpring}
    initial="rest"
    whileHover="hover"
    className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-gray-400 hover:text-leaf-green hover:border-leaf-green/50 transition-all duration-200"
  >
    {icon}
  </motion.a>
);

export default Footer;