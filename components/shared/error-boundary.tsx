"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type FallbackRender = (ctx: { error?: Error; reset: () => void }) => ReactNode;

interface Props {
  children: ReactNode;
  /** Static node or render fn with reset — custom fallbacks always get a Try again path. */
  fallback?: ReactNode | FallbackRender;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      if (typeof fallback === "function") {
        return fallback({ error: this.state.error, reset: this.reset });
      }
      if (fallback) {
        return (
          <div className="flex flex-col gap-3 p-4">
            {fallback}
            <Button
              type="button"
              onClick={this.reset}
              variant="outline"
              size="sm"
              className="w-fit"
            >
              Try again
            </Button>
          </div>
        );
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="rounded-2xl glass max-w-md p-8">
            <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {this.state.error?.message ?? "An unexpected error occurred."}
            </p>
            <Button onClick={this.reset} variant="outline">
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
