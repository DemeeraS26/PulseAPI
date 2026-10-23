import { useRef, useState } from "react";
import { MethodBadge } from "./StatusBar.jsx";
import { deleteSavedRequest, exportSavedRequests, importSavedRequests } from "../storage.js";

export default function SavedRequests({ requests, onRefresh, onLoad }) {
  const [query, setQuery] = useState("");
  const fileInputRef = useRef(null);

  const filtered = requests.filter(
    (r) =>
      r.name?.toLowerCase().includes(query.toLowerCase()) ||
      r.url?.toLowerCase().includes(query.toLowerCase())
  );

  function handleDelete(id) {
    deleteSavedRequest(id);
    onRefresh();
  }

  function handleExport() {
    const blob = new Blob([exportSavedRequests()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulse-api-collection-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importSavedRequests(reader.result);
        onRefresh();
      } catch (err) {
        alert(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="p-6 flex flex-col gap-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search saved requests…"
          className="flex-1 max-w-sm bg-surface-alt border border-border rounded px-3 py-2 text-sm font-mono text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleImportClick}
            className="px-3 py-2 rounded border border-border text-text-secondary text-sm hover:text-text-primary hover:bg-surface-alt transition-colors"
          >
            Import
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
          <button
            onClick={handleExport}
            disabled={requests.length === 0}
            className="px-3 py-2 rounded border border-border text-text-secondary text-sm hover:text-text-primary hover:bg-surface-alt transition-colors disabled:opacity-40"
          >
            Export all
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-1 text-text-tertiary text-sm">
          <span>{requests.length === 0 ? "No saved requests yet" : "No matches"}</span>
          <span className="text-xs">
            {requests.length === 0 ? 'Save one from the Tester tab with "Save request"' : "Try a different search term"}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 bg-surface border border-border rounded-lg px-4 py-3 hover:border-border-light transition-colors group"
            >
              <MethodBadge method={r.method} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary truncate">{r.name || r.url}</div>
                <div className="text-xs font-mono text-text-tertiary truncate">{r.url}</div>
              </div>
              <button
                onClick={() => onLoad(r)}
                className="px-3 py-1.5 rounded text-xs font-medium text-accent border border-accent/30 hover:bg-accent/10 transition-colors shrink-0"
              >
                Load
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                className="w-7 h-7 flex items-center justify-center rounded text-text-tertiary hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                aria-label="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
