const NAV_ITEMS = [
  { id: "tester", label: "Tester", icon: "⌁" },
  { id: "dashboard", label: "Dashboard", icon: "▤" },
  { id: "reports", label: "Reports", icon: "▦" },
  { id: "saved", label: "Saved", icon: "☰" },
];

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="w-56 shrink-0 h-full bg-surface border-r border-border flex flex-col">
      <div className="px-4 py-4 flex items-center gap-2 border-b border-border">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
        </span>
        <span className="font-mono font-semibold text-sm tracking-wide text-text-primary">
          PULSE API
        </span>
      </div>

      <nav className="flex-1 p-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium transition-colors text-left ${
              active === item.id
                ? "bg-accent/10 text-accent border border-accent/30"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-alt border border-transparent"
            }`}
          >
            <span className="text-base leading-none w-4 text-center">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
