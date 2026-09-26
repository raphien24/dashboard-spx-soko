import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      componentName: props.componentName || 'Unknown Component'
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Error in ${this.state.componentName}:`, error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 m-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Component Error: {this.state.componentName}
              </h3>
              <div className="text-sm text-red-700 space-y-2">
                <p className="font-medium">Error Message:</p>
                <pre className="bg-red-100 p-2 rounded text-xs overflow-x-auto">
                  {this.state.error && this.state.error.toString()}
                </pre>
                
                {this.state.errorInfo && (
                  <>
                    <p className="font-medium mt-3">Stack Trace:</p>
                    <pre className="bg-red-100 p-2 rounded text-xs overflow-x-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
              
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
