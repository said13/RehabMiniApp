export function DebugConsole({ logs }: { logs: string[] }) {
  return (
    <div className="px-4 pt-4 text-xs font-mono whitespace-pre-wrap">
      {logs.length ? logs.map((l, i) => <div key={i}>{l}</div>) : <div>No errors logged.</div>}
    </div>
  );
}
