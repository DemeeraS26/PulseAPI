import { useState } from "react";
import { StatusBadge, ResponseMeta } from "./StatusBar.jsx";
import JsonViewer from "./JsonViewer.jsx";

const TABS = ["Body", "Headers"];

export default function ResponseViewer({ response, loading }) {
  const [tab, setTab] = useState("Body");
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-tertiary text-sm">
        <span className="inline-block w-2 h-2 rounded-full bg-accent pulse-dot mr-2" />
        Waiting for response…
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-text-tertiary text-sm gap-1">
        <span>No response yet</span>
        <span className="text-xs text-text-tertiary/70">Send a request to see it here</span>
      </div>
    );
  }

  function copyBody() {
    navigator.clipboard.writeText(response.body || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadBody() {
    const blob = new Blob([response.body || ""], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `response-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (response.error && !response.status_code) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 p-6">
        <StatusBadge status={null} />
        <p className="text-sm text-error max-w-sm">{response.error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-3">
          <StatusBadge status={response.status_code} statusText={response.status_text} />
          <ResponseMeta duration={response.duration_ms} size={response.size_bytes} />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={copyBody}
            className="px-2.5 py-1 text-xs rounded text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
          <button
            onClick={downloadBody}
            className="px-2.5 py-1 text-xs rounded text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors"
          >
            Download
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 px-3 pt-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs font-medium rounded-t border-b-2 transition-colors ${
              tab === t
                ? "text-accent border-accent"
                : "text-text-secondary border-transparent hover:text-text-primary"
            }`}
          >
            {t}
            {t === "Headers" && (
              <span className="ml-1.5 text-text-tertiary">{Object.keys(response.headers || {}).length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {tab === "Body" && <JsonViewer raw={response.body} />}
        {tab === "Headers" && (
          <div className="flex flex-col gap-1">
            {Object.entries(response.headers || {}).map(([k, v]) => (
              <div key={k} className="flex gap-2 text-sm font-mono py-1 border-b border-border/50">
                <span className="text-info shrink-0">{k}:</span>
                <span className="text-text-secondary break-all">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
