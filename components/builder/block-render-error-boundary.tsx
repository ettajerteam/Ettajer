"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BlockRenderErrorBoundaryProps {
  children: ReactNode;
  blockId?: string;
  blockName?: string;
  sectionId: string;
  builderMode?: boolean;
}

interface BlockRenderErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Per-block error boundary — isolates render failures so one block cannot crash the page.
 */
export class BlockRenderErrorBoundary extends Component<
  BlockRenderErrorBoundaryProps,
  BlockRenderErrorBoundaryState
> {
  constructor(props: BlockRenderErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): BlockRenderErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps: BlockRenderErrorBoundaryProps) {
    if (
      prevProps.sectionId !== this.props.sectionId ||
      prevProps.blockId !== this.props.blockId
    ) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const { blockName, builderMode } = this.props;
      return (
        <div
          className={cn(
            "flex min-h-[120px] flex-col items-center justify-center gap-2 px-6 py-10 text-center",
            builderMode && "ettajer-builder-section-ghost"
          )}
          role="alert"
          data-block-error={this.props.blockId ?? "unknown"}
          data-section-id={this.props.sectionId}
        >
          <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden />
          <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
            Render error
          </span>
          <p className="text-sm font-medium text-neutral-600">
            {blockName ? `"${blockName}" failed to render` : "This block failed to render"}
          </p>
          {builderMode && this.state.error?.message ? (
            <p className="max-w-xs text-xs text-neutral-400">{this.state.error.message}</p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-1 h-7 text-xs"
            onClick={this.handleRetry}
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
