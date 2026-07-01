import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative mt-20 bg-gray-900/80 backdrop-blur-xl border-t border-white/10 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand - Updated to beverage-only description */}
          <div className="space-y-4">
            <Link
              to="/"
              className="text-2xl font-bold text-white tracking-tight"
            >
              Lotce<span className="text-leaf-green">Wieth</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Bringing the coldest, most refreshing beverages straight to your
              doorstep across Nigeria. Stay refreshed, stay chilled.
            </p>
            <div className="flex gap-3 pt-2">
              <SocialIcon
                href="https://facebook.com"
                icon={<FaFacebook size={20} />}
              />
              <SocialIcon
                href="https://instagram.com"
                icon={<FaInstagram size={20} />}
              />
              <SocialIcon
                href="https://twitter.com"
                icon={<FaTwitter size={20} />}
              />
              <SocialIcon
                href="https://youtube.com"
                icon={<FaYoutube size={20} />}
              />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link
                  to="/"
                  className="hover:text-leaf-green transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="hover:text-leaf-green transition-colors duration-200"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-leaf-green transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-leaf-green transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
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
          </div>

          {/* Newsletter – Wider column, bigger inputs */}
          <div className="md:col-span-2">
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
              <button
                type="submit"
                className="px-8 py-3.5 text-base bg-leaf-green text-white rounded-xl font-medium hover:bg-green-700 transition-colors whitespace-nowrap shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <span>&copy; {currentYear} LotceWieth. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-leaf-green transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-leaf-green transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

// Helper component for social icons
const SocialIcon = ({
  href,
  icon,
}: {
  href: string;
  icon: React.ReactNode;
}) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.15 }}
    whileTap={{ scale: 0.95 }}
    className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-gray-400 hover:text-leaf-green hover:border-leaf-green/50 transition-all duration-200"
  >
    {icon}
  </motion.a>
);

export default Footer;