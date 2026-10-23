// Minimal JSON syntax highlighter. Pulling in a whole highlighting library
// for "color keys, strings, numbers, booleans differently" would be a lot
// of dependency weight for four rules, so this does it with one regex pass.
function highlight(jsonString) {
  const escaped = jsonString
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?([eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-cyan"; // number
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "text-info" : "text-success";
      } else if (/true|false/.test(match)) {
        cls = "text-accent";
      } else if (/null/.test(match)) {
        cls = "text-text-tertiary";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

export default function JsonViewer({ data, raw }) {
  let text = raw;
  let isValidJson = false;

  if (data !== undefined) {
    try {
      text = JSON.stringify(data, null, 2);
      isValidJson = true;
    } catch {
      text = String(data);
    }
  } else if (raw !== undefined) {
    try {
      text = JSON.stringify(JSON.parse(raw), null, 2);
      isValidJson = true;
    } catch {
      text = raw;
    }
  }

  if (!text) {
    return <div className="text-text-tertiary text-sm font-mono italic">No body</div>;
  }

  if (!isValidJson) {
    return <pre className="text-sm font-mono text-text-primary whitespace-pre-wrap break-all">{text}</pre>;
  }

  return (
    <pre
      className="text-sm font-mono whitespace-pre-wrap break-all leading-relaxed"
      dangerouslySetInnerHTML={{ __html: highlight(text) }}
    />
  );
}
