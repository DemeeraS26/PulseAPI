import { useEffect, useState, useCallback } from "react";
import RequestEditor from "./RequestEditor.jsx";
import ResponseViewer from "./ResponseViewer.jsx";
import { MethodBadge } from "./StatusBar.jsx";
import { sendProxiedRequest, fetchHistory } from "../api.js";
import { saveRequest, getEnvironments, getActiveEnvironmentId, setActiveEnvironmentId, applyEnvironment } from "../storage.js";

function emptyRequest() {
  return {
    method: "GET",
    url: "",
    params: [{ key: "", value: "", enabled: true }],
    headers: [{ key: "", value: "", enabled: true }],
    bodyMode: "none",
    jsonBody: "",
    rawBody: "",
  };
}

function rowsToObject(rows) {
  return Object.fromEntries((rows || []).filter((r) => r.enabled && r.key.trim() !== "").map((r) => [r.key, r.value]));
}

export default function Tester({ pendingLoad, onConsumeLoad, notify }) {
  const [request, setRequest] = useState(emptyRequest());
  const [response, setResponse] = useState(null);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [envs] = useState(getEnvironments());
  const [activeEnvId, setActiveEnvId] = useState(getActiveEnvironmentId());

  const activeEnv = envs.find((e) => e.id === activeEnvId) || envs[0];

  const refreshHistory = useCallback(() => {
    fetchHistory(20).then(setHistory).catch(() => {});
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  useEffect(() => {
    if (pendingLoad) {
      setRequest({ ...emptyRequest(), ...pendingLoad });
      onConsumeLoad();
    }
  }, [pendingLoad, onConsumeLoad]);

  // Cmd/Ctrl+Enter to send from anywhere in the tester
  useEffect(() => {
    function handler(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        send();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  async function send() {
    if (!request.url) return;
    setSending(true);
    setResponse(null);
    try {
      const vars = activeEnv?.variables || {};
      const payload = {
        method: request.method,
        url: applyEnvironment(request.url, vars),
        headers: Object.fromEntries(
          Object.entries(rowsToObject(request.headers)).map(([k, v]) => [k, applyEnvironment(v, vars)])
        ),
        params: Object.fromEntries(
          Object.entries(rowsToObject(request.params)).map(([k, v]) => [k, applyEnvironment(v, vars)])
        ),
        body_mode: request.bodyMode,
        json_body: request.bodyMode === "json" && request.jsonBody ? safeParseJson(request.jsonBody) : null,
        raw_body: request.bodyMode === "raw" ? applyEnvironment(request.rawBody, vars) : null,
      };
      const res = await sendProxiedRequest(payload);
      setResponse(res);
      refreshHistory();
      if (res.ok) {
        notify(`${request.method} ${res.status_code} in ${res.duration_ms.toFixed(0)}ms`, "success");
      } else {
        notify(res.error || `Request failed with ${res.status_code}`, "error");
      }
    } catch (err) {
      notify(err.message, "error");
      setResponse({ error: err.message });
    } finally {
      setSending(false);
    }
  }

  function safeParseJson(text) {
    try {
      return JSON.parse(text);
    } catch {
      return text; // let the backend/server complain rather than silently drop the body
    }
  }

  function handleSave() {
    if (!request.url) return;
    const name = window.prompt("Name this request", request.url);
    if (name === null) return;
    saveRequest({ ...request, name });
    notify("Request saved", "success");
  }

  function loadFromHistory(entry) {
    setRequest({ ...emptyRequest(), method: entry.method, url: entry.url });
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-w-0 border-r border-border">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-surface">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <span>Environment</span>
            <select
              value={activeEnvId}
              onChange={(e) => {
                setActiveEnvId(e.target.value);
                setActiveEnvironmentId(e.target.value);
              }}
              className="bg-surface-alt border border-border rounded px-2 py-1 text-xs font-mono text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {envs.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary font-mono hidden sm:inline">⌘/Ctrl + Enter to send</span>
            <button
              onClick={handleSave}
              disabled={!request.url}
              className="px-3 py-1.5 rounded text-xs font-medium text-text-secondary border border-border hover:text-text-primary hover:bg-surface-alt transition-colors disabled:opacity-40"
            >
              Save request
            </button>
          </div>
        </div>

        <div className="flex-1 grid grid-rows-2 min-h-0">
          <div className="border-b border-border min-h-0 overflow-hidden">
            <RequestEditor request={request} onChange={setRequest} onSend={send} sending={sending} />
          </div>
          <div className="min-h-0 overflow-hidden">
            <ResponseViewer response={response} loading={sending} />
          </div>
        </div>
      </div>

      <aside className="w-72 shrink-0 flex flex-col bg-surface">
        <div className="px-3 py-2.5 border-b border-border">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Recent</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {history.length === 0 && (
            <p className="text-xs text-text-tertiary p-2">Requests you send will show up here</p>
          )}
          {history.map((h) => (
            <button
              key={h.id}
              onClick={() => loadFromHistory(h)}
              className="flex flex-col gap-1 text-left px-2.5 py-2 rounded hover:bg-surface-alt transition-colors"
            >
              <div className="flex items-center gap-2">
                <MethodBadge method={h.method} />
                <span
                  className={`text-xs font-mono ${h.ok ? "text-success" : "text-error"}`}
                >
                  {h.status_code || "ERR"}
                </span>
              </div>
              <span className="text-xs font-mono text-text-secondary truncate">{h.url}</span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
