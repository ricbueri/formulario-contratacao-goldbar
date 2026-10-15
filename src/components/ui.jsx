export const inputClass =
  "w-full rounded-lg border border-gold/20 bg-black/40 px-3 py-2.5 text-sm text-white outline-none transition focus:border-gold";

export function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  className = "",
  type = "text",
  inputMode,
  autoComplete,
}) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-xs uppercase tracking-wide text-gold/80">{label}</span>
      {hint && <p className="text-xs leading-relaxed text-white/45">{hint}</p>}
      <input
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );
}

export function SelectField({ label, value, onChange, options, placeholder, hint, className = "" }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-xs uppercase tracking-wide text-gold/80">{label}</span>
      {hint && <p className="text-xs leading-relaxed text-white/45">{hint}</p>}
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} appearance-none bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat pr-9`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23d4af37' viewBox='0 0 20 20'%3E%3Cpath d='M5.5 7.5L10 12l4.5-4.5'/%3E%3C/svg%3E\")",
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-panel text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function MultiChoiceButtons({ label, hint, options, selected, onChange }) {
  const set = new Set(selected || []);
  function toggle(opt) {
    const next = new Set(set);
    if (next.has(opt)) next.delete(opt);
    else next.add(opt);
    onChange([...next]);
  }
  return (
    <div className="space-y-1.5">
      <span className="text-xs uppercase tracking-wide text-gold/80">{label}</span>
      {hint && <p className="text-xs text-white/45">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = set.has(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                active
                  ? "border-gold bg-gold text-black"
                  : "border-gold/30 text-gold/80 hover:bg-gold/10"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ChoiceButtons({ label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs uppercase tracking-wide text-gold/80">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                active
                  ? "border-gold bg-gold text-black"
                  : "border-gold/30 text-gold/80 hover:bg-gold/10"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Section({ title, subtitle, children, defaultOpen = true }) {
  return (
    <details
      open={defaultOpen}
      className="group mt-6 rounded-2xl border border-gold/20 bg-panel shadow-[0_0_40px_rgba(212,175,55,0.06)]"
    >
      <summary className="cursor-pointer list-none px-6 py-5 md:px-8 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-gold">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
          </div>
          <span
            className="mt-1 text-gold/50 transition group-open:rotate-180"
            aria-hidden
          >
            ▾
          </span>
        </div>
      </summary>
      <div className="border-t border-gold/10 px-6 pb-6 pt-2 md:px-8 md:pb-8">{children}</div>
    </details>
  );
}
