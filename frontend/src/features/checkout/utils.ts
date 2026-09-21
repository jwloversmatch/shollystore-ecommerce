export const buildInputCls = (hasError: boolean) =>
  [
    "w-full pl-11 pr-4 py-3.5 rounded-xl text-sm bg-gray-100 dark:bg-[#1F2123] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 outline-none transition-all duration-200",
    hasError
      ? "border border-red-500/50 ring-2 ring-red-500/10"
      : "border border-gray-300 dark:border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15",
  ].join(" ");