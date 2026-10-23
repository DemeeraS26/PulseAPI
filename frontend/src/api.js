// Thin wrapper around the backend proxy. Every outbound HTTP call the UI
// makes to a third-party API goes through /api/proxy so the browser never
// has to fight CORS directly.

const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

export function sendProxiedRequest(payload) {
  return request("/proxy", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchHistory(limit = 100) {
  return request(`/history?limit=${limit}`);
}

export function clearHistory() {
  return request("/history", { method: "DELETE" });
}

export function fetchAnalytics() {
  return request("/analytics");
}

export function fetchReportSummary() {
  return request("/reports/summary");
}
