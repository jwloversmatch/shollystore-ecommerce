import { Component, ErrorInfo, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  resetKey?: string;
}

interface State {
  hasError: boolean;
}

class ErrorBoundaryBase extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('ErrorBoundary caught an error', {
      error,
      componentStack: info.componentStack,
    });
  }

  componentDidUpdate(prevProps: Props): void {
    // Auto-recover on navigation — without this, hasError stays true
    // forever after the first error, freezing every future route.
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <main
          id="main-content"
          tabIndex={-1}
          className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50 dark:bg-[#0A0A0B] text-gray-900 dark:text-white"
          role="alert"
        >
          <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
            We encountered an unexpected error. Please try refreshing the page or return home.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-[#e8622a] text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Refresh page
            </button>
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-white/20 font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Go home
            </Link>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

// Small functional wrapper: class components can't call hooks directly,
// so this grabs the current pathname and feeds it in as resetKey.
const ErrorBoundary = ({ children, fallback }: Omit<Props, 'resetKey'>) => {
  const location = useLocation();
  return (
    <ErrorBoundaryBase resetKey={location.pathname} fallback={fallback}>
      {children}
    </ErrorBoundaryBase>
  );
};

export default ErrorBoundary;