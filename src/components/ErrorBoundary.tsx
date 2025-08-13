import React from 'react';

export class ErrorBoundary extends React.Component<{ addLog: (msg: string) => void; children: React.ReactNode }> {
  componentDidCatch(error: Error) {
    this.props.addLog(`React Error: ${error.message}`);
  }

  render() {
    return this.props.children;
  }
}
