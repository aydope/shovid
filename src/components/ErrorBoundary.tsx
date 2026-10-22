import { Component, type ErrorInfo, type ReactNode } from "react";

interface State { failed: boolean }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State { return { failed: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Page crashed", error, info.componentStack); }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section role="alert" className="mx-auto max-w-xl px-6 py-32 text-center">
        <h1 className="font-display text-4xl">Something went wrong</h1>
        <p className="mt-3 text-ink/70">This page could not be shown. Your bag and account are safe. Reload the page, or go back to the shop.</p>
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={() => window.location.reload()} className="h-12 cursor-pointer rounded-full bg-ink px-7 text-sm font-medium text-white">Reload</button>
          <a href="/" className="inline-flex h-12 items-center rounded-full border border-ink/20 px-7 text-sm font-medium">Home</a>
        </div>
      </section>
    );
  }
}
