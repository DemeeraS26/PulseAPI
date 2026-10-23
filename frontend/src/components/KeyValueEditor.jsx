import { useState } from "react";

// Generic list-of-{key, value, enabled} editor. Used for both headers and
// query params — they're the same interaction pattern, so one component
// covers both rather than forking into HeaderEditor/ParameterEditor.
export default function KeyValueEditor({ rows, onChange, keyPlaceholder = "Key", valuePlaceholder = "Value" }) {
  const [localRows, setLocalRows] = useState(rows.length ? rows : [{ key: "", value: "", enabled: true }]);

  function commit(next) {
    setLocalRows(next);
    onChange(next.filter((r) => r.key.trim() !== ""));
  }

  function updateRow(index, field, value) {
    const next = localRows.map((r, i) => (i === index ? { ...r, [field]: value } : r));
    if (index === localRows.length - 1 && value.trim() !== "" && field === "key") {
      next.push({ key: "", value: "", enabled: true });
    }
    commit(next);
  }

  function removeRow(index) {
    const next = localRows.filter((_, i) => i !== index);
    commit(next.length ? next : [{ key: "", value: "", enabled: true }]);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {localRows.map((row, i) => (
        <div key={i} className="flex items-center gap-2 group">
          <input
            type="checkbox"
            checked={row.enabled}
            onChange={(e) => updateRow(i, "enabled", e.target.checked)}
            className="w-3.5 h-3.5 rounded accent-accent shrink-0"
          />
          <input
            value={row.key}
            onChange={(e) => updateRow(i, "key", e.target.value)}
            placeholder={keyPlaceholder}
            className="flex-1 min-w-0 bg-surface-alt border border-border rounded px-2.5 py-1.5 text-sm font-mono text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
          />
          <input
            value={row.value}
            onChange={(e) => updateRow(i, "value", e.target.value)}
            placeholder={valuePlaceholder}
            className="flex-1 min-w-0 bg-surface-alt border border-border rounded px-2.5 py-1.5 text-sm font-mono text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
          />
          <button
            onClick={() => removeRow(i)}
            className="w-6 h-6 shrink-0 flex items-center justify-center rounded text-text-tertiary hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove row"
            type="button"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
