"use client";

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Keeps a single child failure from blanking the whole portfolio. */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("UI error caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[40vh] items-center justify-center px-4 text-center">
            <p className="text-[var(--text-color)]">
              Something went wrong loading this part of the page.{" "}
              <button
                type="button"
                className="text-[var(--first-color)] underline underline-offset-2"
                onClick={() => this.setState({ hasError: false })}
              >
                Try again
              </button>
            </p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
