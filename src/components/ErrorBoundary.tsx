'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-red-200 bg-red-50 p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-red-800">Something went wrong</h2>
          <p className="mb-6 max-w-md text-red-600">
            An error occurred while rendering this component. This could be due to missing data or a temporary glitch.
          </p>
          <div className="flex gap-3">
            <Button 
              onClick={() => this.setState({ hasError: false })}
              className="bg-red-600 hover:bg-red-700"
            >
              <RotateCcw className="me-2 h-4 w-4" />
              Try Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-8 overflow-auto rounded bg-red-100 p-4 text-left text-xs text-red-900 max-w-full">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
