"use client";

import React, { ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 border border-red-200 rounded-lg bg-red-50">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
          <p className="text-red-600 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = (error: Error | string, context?: string) => {
    const errorMessage = error instanceof Error ? error.message : error;
    const contextMessage = context ? ` in ${context}` : '';
    
    console.error(`Error${contextMessage}:`, errorMessage);
    
    toast({
      title: "Error",
      description: `An error occurred${contextMessage}. Please try again.`,
      variant: "destructive",
    });
  };

  const handleAsyncError = async <T,>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, context);
      return null;
    }
  };

  const handleNetworkError = (response: Response, context?: string) => {
    const errorMessage = `Network error (${response.status}): ${response.statusText}`;
    handleError(new Error(errorMessage), context);
  };

  return {
    handleError,
    handleAsyncError,
    handleNetworkError,
  };
};

export const withErrorHandling = <P extends object>(
  Component: React.ComponentType<P>,
  context?: string
) => {
  return (props: P) => {
    const { handleError } = useErrorHandler();
    
    return (
      <ErrorBoundary>
        <Component 
          {...props} 
          onError={(error: Error) => handleError(error, context)} 
        />
      </ErrorBoundary>
    );
  };
};