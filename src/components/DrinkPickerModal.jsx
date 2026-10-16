import { useEffect, useMemo, useRef, useState } from "react";
import {
  DrinkCompositionPinnedOverlay,
  DrinkCompositionPreviewBar,
  DrinkPillWithTip,
} from "./DrinkCompositionTip.jsx";

function normalizeSearch(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function DrinkPickerModal({
  open,
  title,
  categories,
  flatOptions,
  multi = false,
  selected = [],
  onClose,
  onSelect,
}) {
  const [query, setQuery] = useState("");
  const [openCat, setOpenCat] = useState(null);
  const [hoverName, setHoverName] = useState(null);
  const [pinnedName, setPinnedName] = useState(null);
  const hideTimer = useRef(null);

  function showComposition(name) {
    if (pinnedName) return;
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setHoverName(name);
  }

  function hideCompositionSoon() {
    if (pinnedName) return;
    hideTimer.current = setTimeout(() => {
      setHoverName(null);
      hideTimer.current = null;
    }, 80);
  }

  function pinComposition(name) {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setHoverName(null);
    setPinnedName(name);
  }

  function closePinned() {
    setPinnedName(null);
  }

  useEffect(() => {
    if (!open) {
      setQuery("");
      setOpenCat(null);
      setHoverName(null);
      setPinnedName(null);
      return;
    }
    if (categories?.length) setOpenCat(categories[0].id);
  }, [open, categories]);

  const filteredCategories = useMemo(() => {
    const q = normalizeSearch(query);
    if (!categories) return null;
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => !q || normalizeSearch(item).includes(q)),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, query]);

  const filteredFlat = useMemo(() => {
    if (!flatOptions) return [];
    const q = normalizeSearch(query);
    return flatOptions.filter((item) => !q || normalizeSearch(item).includes(q));
  }, [flatOptions, query]);

  if (!open) return null;

  function handlePick(name) {
    closePinned();
    if (multi) {
      const next = selected.includes(name)
        ? selected.filter((x) => x !== name)
        : [...selected, name];
      onSelect(next);
      return;
    }
    onSelect(name);
    onClose();
  }

  function pillClass(active) {
    return `rounded-full border px-2.5 py-1 text-[11px] leading-snug transition ${
      active
        ? "border-gold bg-gold text-black"
        : "border-gold/25 text-white/85 hover:border-gold/50"
    }`;
  }

  const listClass =
    "max-h-[min(52vh,420px)] overflow-y-auto overflow-x-hidden rounded-xl border border-gold/15 bg-black/30 p-2";

  const pillProps = {
    onShowComposition: showComposition,
    onHideComposition: hideCompositionSoon,
    onPinComposition: pinComposition,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drink-picker-title"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl border border-gold/25 bg-panel sm:rounded-2xl">
        {pinnedName && <DrinkCompositionPinnedOverlay name={pinnedName} onClose={closePinned} />}

        <div className="border-b border-gold/15 px-4 py-4 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <h3 id="drink-picker-title" className="font-serif text-lg text-gold">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-2 py-1 text-sm text-white/60 hover:bg-white/10"
            >
              Fechar
            </button>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar drink..."
            className="mt-3 w-full rounded-lg border border-gold/20 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-gold"
            autoFocus
          />
          <DrinkCompositionPreviewBar name={hoverName} />
        </div>

        <div className="flex-1 overflow-hidden px-4 py-3 sm:px-5">
          {filteredCategories && (
            <div className={listClass}>
              {filteredCategories.map((cat) => {
                const expanded = openCat === cat.id || Boolean(query);
                return (
                  <div key={cat.id} className="mb-2 last:mb-0">
                    <button
                      type="button"
                      onClick={() => setOpenCat(expanded && openCat === cat.id ? null : cat.id)}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs uppercase tracking-wide text-gold/90 hover:bg-gold/5"
                    >
                      <span>{cat.label}</span>
                      <span className="text-white/40">{cat.items.length}</span>
                    </button>
                    {expanded && (
                      <div className="flex flex-wrap gap-1.5 pb-2 pl-1 pt-1">
                        {cat.items.map((item) => {
                          const active = multi && selected.includes(item);
                          return (
                            <DrinkPillWithTip
                              key={item}
                              name={item}
                              onPick={handlePick}
                              pillClass={pillClass(active)}
                              {...pillProps}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {flatOptions && (
            <div className={listClass}>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {filteredFlat.map((item) => {
                  const active = multi && selected.includes(item);
                  return (
                    <DrinkPillWithTip
                      key={item}
                      name={item}
                      onPick={handlePick}
                      pillClass={pillClass(active)}
                      {...pillProps}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {multi && (
          <div className="border-t border-gold/15 px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full bg-gold py-2.5 text-sm font-semibold text-black"
            >
              Concluir ({selected.length} selecionado{selected.length === 1 ? "" : "s"})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
