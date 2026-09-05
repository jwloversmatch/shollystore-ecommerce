import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Loader2,
  CheckCircle2,
  XCircle,
  Building2,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import PaystackLogo from "../components/PaystackLogo";
import WhatsAppLogo from "../components/WhatsAppLogo";

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
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const linkHover = {
  rest: { x: 0 },
  hover: { x: 4, color: "#e8622a", transition: { duration: 0.2 } },
};

const socialIconSpring = {
  rest: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.2,
    rotate: [0, -8, 8, 0],
    transition: {
      scale: { type: "spring" as const, stiffness: 400 },
      rotate: { duration: 0.4, ease: "easeInOut" as const },
    },
  },
};

const BRAND_NAME = "Sholex";

const contactInfo = {
  address: "Lagos, Nigeria",
  phone: "+2349012345678",
  phoneDisplay: "+234 901 234 5678",
  email: "hello@Sholex.com",
};

const socialLinks = [
  {
    platform: "Facebook",
    url: "https://facebook.com/Sholex",
    icon: FaFacebook,
  },
  {
    platform: "Instagram",
    url: "https://instagram.com/Sholex",
    icon: FaInstagram,
  },
  {
    platform: "Twitter",
    url: "https://twitter.com/Sholex",
    icon: FaTwitter,
  },
  {
    platform: "YouTube",
    url: "https://youtube.com/@Sholex",
    icon: FaYoutube,
  },
];

const quickLinks = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "About Us", path: "/about" },
  { name: "Contact", path: "/contact" },
];

type SubscribeStatus = "idle" | "loading" | "success" | "error";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubscribeStatus>("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Subscription failed");

      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <motion.footer
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      className="relative mt-20 border-t border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden
        bg-white dark:bg-gray-900/90 backdrop-blur-xl pb-16 md:pb-0"
      style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))" }}
      aria-label="Site footer"
    >
      {/* Subtle background glow – hidden from screen readers */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        aria-hidden="true"
      >
        <motion.div
          animate={{ x: ["-10%", "10%", "-10%"], y: ["-5%", "5%", "-5%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute top-0 -left-20 w-72 h-72 bg-[#e8622a]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: ["10%", "-10%", "10%"], y: ["10%", "-10%", "10%"] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="absolute bottom-0 -right-20 w-96 h-96 bg-[#e8622a]/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <motion.div variants={columnVariants} className="space-y-4">
            <Link
              to="/"
              className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
              aria-label={`${BRAND_NAME} - Home`}
            >
              Sholex
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              Your one‑stop destination for quality products – from fashion to
              beverages, delivered fast and reliably.
            </p>
            <div className="flex gap-3 pt-2" aria-label="Social media links">
              {socialLinks.map(({ platform, url, icon: Icon }) => (
                <SocialIcon
                  key={platform}
                  href={url}
                  icon={<Icon size={20} />}
                  label={platform}
                />
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={columnVariants}>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h4>
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
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li className="flex items-center gap-3">
                <MapPin
                  size={18}
                  className="text-[#e8622a]"
                  aria-hidden="true"
                />
                <span>{contactInfo.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone
                  size={18}
                  className="text-[#e8622a]"
                  aria-hidden="true"
                />
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="hover:text-[#e8622a] transition-colors"
                  aria-label={`Call us at ${contactInfo.phoneDisplay}`}
                >
                  {contactInfo.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#e8622a]" aria-hidden="true" />
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="hover:text-[#e8622a] transition-colors"
                  aria-label={`Email us at ${contactInfo.email}`}
                >
                  {contactInfo.email}
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={columnVariants} className="md:col-span-2">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Stay in the Loop
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Subscribe for exclusive deals, new arrivals, and discounts.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 w-full"
              aria-label="Newsletter subscription"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                disabled={status === "loading"}
                className="flex-1 min-w-[160px] px-5 py-3.5 text-base bg-white dark:bg-white border border-gray-300 dark:border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8622a] placeholder:text-gray-500 text-gray-800 disabled:opacity-60"
              />
              <motion.button
                type="submit"
                disabled={status === "loading"}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 8px 20px rgba(232,98,42,0.3)",
                }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3.5 text-base bg-[#e8622a] text-white rounded-xl font-medium hover:bg-[#c9511f] transition-colors whitespace-nowrap shrink-0 disabled:opacity-70 flex items-center justify-center gap-2"
                aria-label="Subscribe to newsletter"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </motion.button>
            </form>

            {/* Status feedback */}
            {status === "success" && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm text-green-600 dark:text-green-400 flex items-center gap-2"
                role="status"
              >
                <CheckCircle2 size={16} />
                Thanks for subscribing! Check your inbox.
              </motion.p>
            )}
            {status === "error" && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2"
                role="alert"
              >
                <XCircle size={16} />
                Something went wrong. Please try again.
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* Payment Methods */}
        <motion.div
          variants={columnVariants}
          className="mt-10 pt-6 border-t border-gray-200 dark:border-white/10"
        >
          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            We Accept
          </h5>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Paystack */}
            <span className="flex items-center justify-center px-3 py-2 bg-white dark:bg-white/10 rounded-lg border border-gray-200 dark:border-white/20">
              <PaystackLogo className="h-4 w-auto" />
            </span>

            {/* Bank Transfer */}
            <span className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-white/20">
              <Building2 className="w-4 h-4" />
              Bank Transfer
            </span>

            {/* WhatsApp Pay */}
            <span className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-white/20">
              <WhatsAppLogo className="w-4 h-4 text-[#25D366]" />
              WhatsApp Pay
            </span>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          variants={columnVariants}
          className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 dark:text-gray-400"
        >
          <span>
            &copy; {currentYear} {BRAND_NAME}. All rights reserved.
          </span>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="hover:text-[#e8622a] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-[#e8622a] transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

const SocialIcon = ({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    variants={socialIconSpring}
    initial="rest"
    whileHover="hover"
    aria-label={`Follow us on ${label}`}
    className="p-2.5 backdrop-blur-sm rounded-full border border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-[#e8622a] hover:border-[#e8622a]/50 transition-all duration-200"
  >
    {icon}
  </motion.a>
);

export default Footer;
