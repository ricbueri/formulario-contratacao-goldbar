import { useState } from "react";
import { A_DEFINIR, OPEN_BAR_CATEGORIES } from "../../shared/cardapioDrinks.js";
import { DrinkPickerModal } from "./DrinkPickerModal.jsx";

export const MAX_OPEN_BAR_DRINKS = 6;

export function OpenBarDrinkList({ drinks, onChange }) {
  const [pickerIndex, setPickerIndex] = useState(null);

  function updateAt(index, value) {
    const next = [...drinks];
    next[index] = value;
    onChange(next);
  }

  function addSlot() {
    if (drinks.length >= MAX_OPEN_BAR_DRINKS) return;
    onChange([...drinks, ""]);
  }

  function removeAt(index) {
    if (drinks.length <= 1) return;
    onChange(drinks.filter((_, i) => i !== index));
  }

  const atMax = drinks.length >= MAX_OPEN_BAR_DRINKS;

  return (
    <>
      <div className="space-y-2">
        {drinks.map((drink, index) => (
          <div
            key={index}
            className="flex min-h-12 items-stretch gap-1 rounded-xl border border-gold/15 bg-black/30 p-1"
          >
            <button
              type="button"
              onClick={() => setPickerIndex(index)}
              className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-gold/10 active:bg-gold/15"
            >
              <span className="w-14 shrink-0 text-[10px] font-medium uppercase tracking-wide text-gold/70">
                Drink {index + 1}
              </span>
              <span
                className={`min-w-0 flex-1 truncate text-sm ${
                  drink ? "text-white/95" : "text-white/50"
                }`}
              >
                {drink || "Toque para escolher"}
              </span>
              <span className="shrink-0 text-gold/50" aria-hidden>›</span>
            </button>
            {drinks.length > 1 && (
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="flex w-11 shrink-0 items-center justify-center rounded-lg text-white/45 hover:bg-white/10"
                aria-label={`Remover drink ${index + 1}`}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {!atMax && (
        <button
          type="button"
          onClick={addSlot}
          className="mt-3 rounded-full border border-gold/35 px-4 py-2 text-xs text-gold hover:bg-gold/10"
        >
          + Adicionar drink
        </button>
      )}

      <p className="mt-2 text-xs text-white/45">
        Até {MAX_OPEN_BAR_DRINKS} drinks no pacote. Use «{A_DEFINIR}» se ainda não fechou a lista.
      </p>

      <DrinkPickerModal
        open={pickerIndex !== null}
        title={`Escolher drink ${pickerIndex !== null ? pickerIndex + 1 : ""}`}
        categories={OPEN_BAR_CATEGORIES}
        onClose={() => setPickerIndex(null)}
        onSelect={(name) => {
          if (pickerIndex === null) return;
          updateAt(pickerIndex, name);
          setPickerIndex(null);
        }}
      />
    </>
  );
}
