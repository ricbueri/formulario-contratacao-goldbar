import { useState } from "react";
import { DrinkPickerModal } from "./DrinkPickerModal.jsx";

export function OptionalMultiPick({ label, hint, options, selected, onChange }) {
  const [open, setOpen] = useState(false);

  function removeOne(item) {
    onChange(selected.filter((x) => x !== item));
  }

  return (
    <div className="rounded-xl border border-gold/10 bg-black/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-gold-soft">{label}</p>
          {hint && <p className="mt-0.5 text-xs text-white/45">{hint}</p>}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-gold/35 px-3 py-1.5 text-xs text-gold hover:bg-gold/10"
        >
          {selected.length ? "Editar" : "Adicionar"}
        </button>
      </div>

      {selected.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <li key={item}>
              <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-gold/25 bg-black/40 px-2 py-1 text-[11px] text-white/85">
                <span className="truncate">{item}</span>
                <button
                  type="button"
                  onClick={() => removeOne(item)}
                  className="text-white/40 hover:text-white"
                  aria-label={`Remover ${item}`}
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <DrinkPickerModal
        open={open}
        title={label}
        flatOptions={options}
        multi
        selected={selected}
        onClose={() => setOpen(false)}
        onSelect={onChange}
      />
    </div>
  );
}
