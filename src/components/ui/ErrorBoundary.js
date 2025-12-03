import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Form Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="bg-red-50 border-red-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6" />
              <CardTitle>Form Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                Something went wrong with the MEDEVAC form. This is usually a temporary issue.
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-700 mb-2">Error Details:</h4>
                <p className="text-sm text-red-600 font-mono">
                  {this.state.error && this.state.error.toString()}
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={this.handleRetry}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Reload Page
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 pt-4 border-t">
                <p>If this problem persists, please contact IT support with the error details above.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;