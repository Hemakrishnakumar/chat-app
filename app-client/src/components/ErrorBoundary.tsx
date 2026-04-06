import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

/**
 * Class-based Error Boundary (traditional React approach)
 * 
 * This component catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 * 
 * @class ErrorBoundaryClass
 * @extends {Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean; error: Error | null }>}
 * 
 * @example
 * // Usage example
 * <ErrorBoundaryClass fallback={<div>Custom fallback UI</div>}>
 *   <ErrorProneComponent />
 * </ErrorBoundaryClass>
 */
class ErrorBoundaryClass extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: ReactNode; fallback?: ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can log the error to an error reporting service here
        // eslint-disable-next-line no-console
        console.log("ErrorBoundary caught an error:", error, errorInfo);
    
    // Log to error reporting service (example)
    // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
      
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Something went wrong
                            </h1>
                            <p className="text-gray-600 mb-6">
                An unexpected error occurred. Please try refreshing the page.
                            </p>
                            <button
                                onClick={this.handleReset}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Export both implementations
export { ErrorBoundaryClass };