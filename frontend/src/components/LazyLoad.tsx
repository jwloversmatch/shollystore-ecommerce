// src/components/LazyLoad.tsx
import { Suspense, ComponentType, lazy } from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = () => (
  <div className="min-h-screen flex justify-center items-center">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500"
    />
  </div>
);

type LazyLoadComponent = ComponentType<Record<string, unknown>>;

// eslint-disable-next-line react-refresh/only-export-components
export const lazyLoad = (
  importFunc: () => Promise<{ default: LazyLoadComponent }>
) => {
  const LazyComponent = lazy(importFunc);
  
  const WrappedComponent = (props: Record<string, unknown>) => (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyComponent {...props} />
    </Suspense>
  );
  
  WrappedComponent.displayName = 'LazyLoadWrapper';
  
  return WrappedComponent;
};

// Export the LoadingSpinner separately if needed elsewhere
export { LoadingSpinner };