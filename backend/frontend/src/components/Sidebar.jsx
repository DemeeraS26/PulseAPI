<button
  type="button"
  onClick={onToggleTheme}
  className="
    w-full flex items-center justify-between
    px-3 py-2.5 rounded-lg
    bg-surface-alt
    border border-border
    text-text-secondary
    hover:bg-surface-hover
    hover:text-text-primary
  "
  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
>
  <span className="flex items-center gap-2">
    <span className="text-base">
      {theme === "dark" ? "☀️" : "🌙"}
    </span>

    <span>
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </span>
  </span>

  <span className="text-xs text-text-tertiary">
    {theme === "dark" ? "OFF" : "ON"}
  </span>
</button>