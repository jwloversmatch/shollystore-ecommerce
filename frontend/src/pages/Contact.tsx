import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  ChevronDown,
} from 'lucide-react';
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from 'react-icons/fa';

const contactInfo = {
  address: 'Lagos, Nigeria',
  phone: '+2349012345678',
  phoneDisplay: '+234 901 234 5678',
  email: 'hello@sholex.com',
};

const socialLinks = [
  { platform: 'Facebook', url: 'https://facebook.com/Sholex', icon: FaFacebook },
  { platform: 'Instagram', url: 'https://instagram.com/Sholex', icon: FaInstagram },
  { platform: 'Twitter', url: 'https://twitter.com/Sholex', icon: FaTwitter },
  { platform: 'YouTube', url: 'https://youtube.com/@Sholex', icon: FaYoutube },
];

const faqs = [
  {
    question: 'How fast is delivery?',
    answer:
      'We deliver within 24–72 hours across major cities in Nigeria. Remote areas may take a little longer.',
  },
  {
    question: 'What is your return policy?',
    answer:
      'You can return most items within 7 days of delivery, provided they are unused and in original packaging.',
  },
  {
    question: 'Do you offer customer support on weekends?',
    answer:
      'Yes! Our support team is available 7 days a week from 9am to 9pm WAT.',
  },
  {
    question: 'How do I track my order?',
    answer:
      'Once your order ships, you’ll receive a tracking number via email and SMS. You can also track it in your account dashboard.',
  },
];

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to send message');

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <>
      <SEO
        title="Contact Us"
        description="Get in touch with Sholex. We're here to help with any questions, orders, or feedback."
        canonicalUrl="https://sholex.vercel.app/contact"
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[#FCFAF5] dark:bg-[#0A0A0B] pb-16 focus:outline-none"
        style={{ paddingTop: 'calc(56px + env(safe-area-inset-top, 0px))' }}
      >
        {/* ─── Hero ─── */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white"
            >
              Get in <span className="text-[#e8622a]">Touch</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-4 max-w-xl mx-auto text-lg text-gray-600 dark:text-gray-400"
            >
              Questions, feedback, or just want to say hello? We'd love to hear from you.
            </motion.p>
          </div>
        </section>

        {/* ─── Main Content ─── */}
        <section className="px-4 pb-12">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Left: Contact Info & Social */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Contact cards */}
              <div className="bg-white dark:bg-[#141414] rounded-2xl p-6 border border-gray-200 dark:border-white/[0.06] shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#e8622a]" />
                  Contact Information
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#e8622a] mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {contactInfo.address}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[#e8622a] mt-0.5" />
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="text-gray-600 dark:text-gray-300 hover:text-[#e8622a] transition-colors"
                    >
                      {contactInfo.phoneDisplay}
                    </a>
                  </li>
                  <li className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#e8622a] mt-0.5" />
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-gray-600 dark:text-gray-300 hover:text-[#e8622a] transition-colors"
                    >
                      {contactInfo.email}
                    </a>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#e8622a] mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Mon – Sun: 9:00 AM – 9:00 PM WAT
                    </span>
                  </li>
                </ul>
              </div>

              {/* Social links */}
              <div className="bg-white dark:bg-[#141414] rounded-2xl p-6 border border-gray-200 dark:border-white/[0.06] shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Follow Us
                </h3>
                <div className="flex gap-4">
                  {socialLinks.map(({ platform, url, icon: Icon }) => (
                    <motion.a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 rounded-full border border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-[#e8622a] hover:border-[#e8622a]/50 transition-all"
                      aria-label={`Follow on ${platform}`}
                    >
                      <Icon size={20} />
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* FAQ quick links */}
              <div className="bg-white dark:bg-[#141414] rounded-2xl p-6 border border-gray-200 dark:border-white/[0.06] shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Quick Answers
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Find answers to common questions below or send us a message.
                </p>
              </div>
            </motion.div>

            {/* Right: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-[#141414] rounded-2xl p-8 border border-gray-200 dark:border-white/[0.06] shadow-sm"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Send a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={status === 'loading'}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e8622a] disabled:opacity-60"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={status === 'loading'}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e8622a] disabled:opacity-60"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    disabled={status === 'loading'}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e8622a] disabled:opacity-60"
                    placeholder="Order inquiry, feedback, etc."
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    disabled={status === 'loading'}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e8622a] disabled:opacity-60 resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={status === 'loading'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#e8622a] text-white rounded-xl font-semibold shadow-lg hover:bg-[#c9511f] transition-colors disabled:opacity-70"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message
                    </>
                  )}
                </motion.button>

                <AnimatePresence>
                  {status === 'success' && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-green-600 dark:text-green-400 flex items-center gap-2 text-sm"
                      role="status"
                    >
                      <CheckCircle2 size={16} />
                      Message sent successfully! We'll reply soon.
                    </motion.p>
                  )}
                  {status === 'error' && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-600 dark:text-red-400 flex items-center gap-2 text-sm"
                      role="alert"
                    >
                      <XCircle size={16} />
                      Something went wrong. Please try again.
                    </motion.p>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          </div>
        </section>

        {/* ─── FAQ Section ─── */}
        <section className="px-4 pb-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-white/[0.06] shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left"
                    aria-expanded={openFaq === idx}
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#e8622a] transition-transform ${
                        openFaq === idx ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 pb-5 text-gray-600 dark:text-gray-400"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Contact;