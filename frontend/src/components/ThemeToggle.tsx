import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;

  return (
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      onClick={toggleTheme}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
      style={{
        background: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
        color: theme === 'dark' ? '#9ca3af' : '#4b5563',
      }}
      title={label}
      aria-label={label}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4" aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4" aria-hidden="true" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;