import { useEffect, useState } from 'react';

export function useErrorLogger() {
  const [logs, setLogs] = useState<string[]>([]);
  const addLog = (msg: string) => setLogs((l) => [...l, msg]);

  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      addLog(`Error: ${e.message}`);
    };
    const handleRejection = (e: PromiseRejectionEvent) => {
      addLog(`Unhandled Rejection: ${e.reason}`);
    };
    const origConsoleError = console.error;
    console.error = (...args: any[]) => {
      addLog(args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
      origConsoleError(...args);
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      console.error = origConsoleError;
    };
  }, []);

  return { logs, addLog };
}
