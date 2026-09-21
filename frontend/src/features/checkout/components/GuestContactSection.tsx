import { Mail, User, Phone } from "lucide-react";

interface Props {
  email: string;
  name: string;
  phone: string;
  onEmailChange: (v: string) => void;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
}

const inputCls =
  "w-full pl-11 pr-4 py-3.5 rounded-xl text-sm bg-gray-100 dark:bg-[#1F2123] border border-gray-300 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15 outline-none";

const labelCls =
  "block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2";

const GuestContactSection = ({
  email,
  name,
  phone,
  onEmailChange,
  onNameChange,
  onPhoneChange,
}: Props) => (
  <fieldset className="rounded-2xl p-5 md:p-6 space-y-4 bg-white dark:bg-[#17181A] border border-gray-200 dark:border-white/[0.07]">
    <legend className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-4">
      Contact Information
    </legend>
    <div>
      <label htmlFor="guest-email" className={labelCls}>
        Email Address *
      </label>
      <div className="relative">
        <Mail
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400"
          aria-hidden="true"
        />
        <input
          type="email"
          id="guest-email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          className={inputCls}
          placeholder="you@example.com"
        />
      </div>
    </div>
    <div>
      <label htmlFor="guest-name" className={labelCls}>
        Full Name (optional)
      </label>
      <div className="relative">
        <User
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400"
          aria-hidden="true"
        />
        <input
          type="text"
          id="guest-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className={inputCls}
          placeholder="John Doe"
        />
      </div>
    </div>
    <div>
      <label htmlFor="guest-phone" className={labelCls}>
        Phone (optional)
      </label>
      <div className="relative">
        <Phone
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400"
          aria-hidden="true"
        />
        <input
          type="tel"
          id="guest-phone"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          className={inputCls}
          placeholder="+2348012345678"
        />
      </div>
    </div>
  </fieldset>
);

export default GuestContactSection;