const METHOD_COLORS = {
  GET: "text-info bg-info/10 border-info/30",
  POST: "text-success bg-success/10 border-success/30",
  PUT: "text-warning bg-warning/10 border-warning/30",
  PATCH: "text-cyan bg-cyan/10 border-cyan/30",
  DELETE: "text-error bg-error/10 border-error/30",
  HEAD: "text-text-secondary bg-surface-alt border-border",
  OPTIONS: "text-text-secondary bg-surface-alt border-border",
};

export function MethodBadge({ method }) {
  const cls = METHOD_COLORS[method] || METHOD_COLORS.GET;
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold border ${cls}`}>
      {method}
    </span>
  );
}

function statusColor(status) {
  if (!status) return "text-error bg-error/10 border-error/30";
  if (status < 300) return "text-success bg-success/10 border-success/30";
  if (status < 400) return "text-info bg-info/10 border-info/30";
  if (status < 500) return "text-warning bg-warning/10 border-warning/30";
  return "text-error bg-error/10 border-error/30";
}

export function StatusBadge({ status, statusText }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold border ${statusColor(status)}`}>
      {status ? `${status} ${statusText || ""}`.trim() : "ERROR"}
    </span>
  );
}

export function ResponseMeta({ duration, size }) {
  const formattedSize =
    size < 1024 ? `${size} B` : size < 1024 * 1024 ? `${(size / 1024).toFixed(1)} KB` : `${(size / 1024 / 1024).toFixed(2)} MB`;
  return (
    <div className="flex items-center gap-3 text-xs font-mono text-text-secondary">
      <span>{duration.toFixed(0)} ms</span>
      <span className="text-text-tertiary">·</span>
      <span>{formattedSize}</span>
    </div>
  );
}
