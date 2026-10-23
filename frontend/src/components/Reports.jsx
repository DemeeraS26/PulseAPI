import { useState } from "react";
import { fetchReportSummary } from "../api.js";

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReportSummary();
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 flex flex-col gap-5 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Reports</h2>
          <p className="text-sm text-text-secondary">A point-in-time snapshot of performance and errors, ready to export.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={generate}
            disabled={loading}
            className="px-4 py-2 rounded bg-accent text-bg text-sm font-semibold hover:bg-accent/90 disabled:opacity-40 transition-colors"
          >
            {loading ? "Generating…" : "Generate report"}
          </button>
          {report && (
            <button
              onClick={() => downloadJson(report, `pulse-api-report-${Date.now()}.json`)}
              className="px-4 py-2 rounded border border-border text-text-secondary text-sm hover:text-text-primary hover:bg-surface-alt transition-colors"
            >
              Export JSON
            </button>
          )}
        </div>
      </div>

      {error && <div className="text-sm text-error">{error}</div>}

      {!report && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-1 text-text-tertiary text-sm">
          <span>No report generated yet</span>
          <span className="text-xs">Click "Generate report" to summarize everything recorded so far</span>
        </div>
      )}

      {report && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface border border-border rounded-lg p-4">
              <span className="text-xs text-text-secondary uppercase">Total requests</span>
              <div className="text-2xl font-mono font-semibold mt-1">{report.performance.total_requests}</div>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <span className="text-xs text-text-secondary uppercase">Success rate</span>
              <div className="text-2xl font-mono font-semibold mt-1">{report.performance.success_rate}%</div>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <span className="text-xs text-text-secondary uppercase">Avg duration</span>
              <div className="text-2xl font-mono font-semibold mt-1">{report.performance.avg_duration_ms} ms</div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              Error summary ({report.errors.length})
            </h3>
            {report.errors.length === 0 ? (
              <p className="text-sm text-text-tertiary">No errors recorded. Clean run.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {report.errors.map((e, i) => (
                  <div key={i} className="text-xs font-mono border-b border-border/50 pb-2">
                    <div className="flex gap-2">
                      <span className="text-error shrink-0">{e.method}</span>
                      <span className="text-text-secondary truncate">{e.url}</span>
                    </div>
                    <div className="text-text-tertiary mt-0.5">{e.error || `Status ${e.status_code}`}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-xs text-text-tertiary font-mono">
            Generated at {new Date(report.generated_at).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
