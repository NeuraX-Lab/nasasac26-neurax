import { Component, Suspense, type ReactNode } from "react";

// A slow/offline visual chunk must never suspend the analysis form or saved run.
export class OptionalVisual extends Component<{ children: ReactNode; fallback: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    const notice = <p role="status" className="notice">{this.props.fallback}</p>;
    return this.state.failed ? notice : <Suspense fallback={notice}>{this.props.children}</Suspense>;
  }
}
