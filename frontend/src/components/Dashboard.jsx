import { useEffect, useState, useCallback } from "react";
import { fetchAnalytics } from "../api.js";
import { MethodBadge } from "./StatusBar.jsx";

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-1">
      <span className="text-xs text-text-secondary uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-mono font-semibold text-text-primary">{value}</span>
      {sub && <span className="text-xs text-text-tertiary">{sub}</span>}
    </div>
  );
}

function Bar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 text-xs font-mono text-text-secondary shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-surface-alt rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-xs font-mono text-text-secondary text-right shrink-0">{value}</span>
    </div>
  );
}

const STATUS_COLORS = { "2xx": "bg-success", "3xx": "bg-info", "4xx": "bg-warning", "5xx": "bg-error", error: "bg-error" };
const METHOD_COLORS = { GET: "bg-info", POST: "bg-success", PUT: "bg-warning", PATCH: "bg-cyan", DELETE: "bg-error" };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetchAnalytics()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return <div className="p-6 text-text-tertiary text-sm">Loading analytics…</div>;
  }

  if (!stats || stats.total_requests === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-1 p-6">
        <span className="text-text-secondary text-sm">No requests recorded yet</span>
        <span className="text-text-tertiary text-xs">Send a request in the Tester tab to populate this dashboard</span>
      </div>
    );
  }

  const statusMax = Math.max(...Object.values(stats.status_distribution), 1);
  const methodMax = Math.max(...Object.values(stats.method_distribution), 1);

  return (
    <div className="p-6 flex flex-col gap-6 overflow-y-auto h-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={stats.total_requests} />
        <StatCard label="Success Rate" value={`${stats.success_rate}%`} />
        <StatCard label="Avg Response" value={`${stats.avg_duration_ms} ms`} />
        <StatCard label="Tracked Statuses" value={Object.keys(stats.status_distribution).length} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Status code distribution</h3>
          <div className="flex flex-col gap-2.5">
            {Object.entries(stats.status_distribution).map(([code, count]) => (
              <Bar key={code} label={code} value={count} max={statusMax} color={STATUS_COLORS[code] || "bg-text-tertiary"} />
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Method distribution</h3>
          <div className="flex flex-col gap-2.5">
            {Object.entries(stats.method_distribution).map(([method, count]) => (
              <Bar key={method} label={method} value={count} max={methodMax} color={METHOD_COLORS[method] || "bg-text-tertiary"} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Slowest endpoints</h3>
          <div className="flex flex-col gap-2">
            {stats.slowest.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-mono">
                <MethodBadge method={r.method} />
                <span className="flex-1 truncate text-text-secondary">{r.url}</span>
                <span className="text-error shrink-0">{r.duration_ms} ms</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Fastest endpoints</h3>
          <div className="flex flex-col gap-2">
            {stats.fastest.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-mono">
                <MethodBadge method={r.method} />
                <span className="flex-1 truncate text-text-secondary">{r.url}</span>
                <span className="text-success shrink-0">{r.duration_ms} ms</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
