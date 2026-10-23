import { useState } from "react";
import KeyValueEditor from "./KeyValueEditor.jsx";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const TABS = ["Params", "Headers", "Body"];

export default function RequestEditor({ request, onChange, onSend, sending }) {
  const [tab, setTab] = useState("Params");

  function set(field, value) {
    onChange({ ...request, [field]: value });
  }

  return (
    <div className="flex flex-col h-full">
      {/* method + url bar */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <select
          value={request.method}
          onChange={(e) => set("method", e.target.value)}
          className="bg-surface-alt border border-border rounded px-2.5 py-2 text-sm font-mono font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          value={request.url}
          onChange={(e) => set("url", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="https://api.example.com/v1/resource"
          className="flex-1 bg-surface-alt border border-border rounded px-3 py-2 text-sm font-mono text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
        />
        <button
          onClick={onSend}
          disabled={sending || !request.url}
          className="px-4 py-2 rounded bg-accent text-bg text-sm font-semibold hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </div>

      {/* tabs */}
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
            {t === "Params" && request.params?.length > 0 && (
              <span className="ml-1.5 text-text-tertiary">{request.params.length}</span>
            )}
            {t === "Headers" && request.headers?.length > 0 && (
              <span className="ml-1.5 text-text-tertiary">{request.headers.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {tab === "Params" && (
          <KeyValueEditor
            rows={request.params}
            onChange={(rows) => set("params", rows)}
            keyPlaceholder="param"
            valuePlaceholder="value"
          />
        )}
        {tab === "Headers" && (
          <KeyValueEditor
            rows={request.headers}
            onChange={(rows) => set("headers", rows)}
            keyPlaceholder="Header-Name"
            valuePlaceholder="value"
          />
        )}
        {tab === "Body" && (
          <div className="flex flex-col gap-2 h-full">
            <div className="flex gap-1">
              {["none", "json", "raw"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => set("bodyMode", mode)}
                  className={`px-2.5 py-1 text-xs rounded font-mono ${
                    request.bodyMode === mode
                      ? "bg-accent text-bg font-semibold"
                      : "bg-surface-alt text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            {request.bodyMode !== "none" && (
              <textarea
                value={request.bodyMode === "json" ? request.jsonBody : request.rawBody}
                onChange={(e) => set(request.bodyMode === "json" ? "jsonBody" : "rawBody", e.target.value)}
                placeholder={request.bodyMode === "json" ? '{\n  "key": "value"\n}' : "raw request body"}
                spellCheck={false}
                className="flex-1 min-h-[160px] bg-surface-alt border border-border rounded p-3 text-sm font-mono text-text-primary placeholder-text-tertiary resize-none focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
