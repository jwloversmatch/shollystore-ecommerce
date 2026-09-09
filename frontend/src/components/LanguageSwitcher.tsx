import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <select
      value={i18n.language}
      onChange={(e) => changeLanguage(e.target.value)}
      className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10 text-sm"
    >
      <option value="en">English</option>
      <option value="pcm">Pidgin</option>
    </select>
  );
};

export default LanguageSwitcher;