import { getDrinkMeta } from "../../shared/drinkCatalog.js";

export function DrinkPillWithTip({ name, onPick, pillClass, onShowComposition, onHideComposition, onPinComposition }) {
  const { composition } = getDrinkMeta(name);
  const hasTip = Boolean(composition);

  return (
    <span className="inline-flex max-w-full items-center gap-0.5 align-top">
      <button
        type="button"
        onClick={() => onPick(name)}
        onMouseEnter={() => onShowComposition?.(name)}
        onMouseLeave={() => onHideComposition?.()}
        className={pillClass}
      >
        {name}
      </button>
      {hasTip && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPinComposition?.(name);
          }}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/25 text-[10px] text-gold/80 hover:bg-gold/10"
          aria-label={`Composição: ${name}`}
        >
          i
        </button>
      )}
    </span>
  );
}

/** Faixa fixa no topo do modal — não cobre os botões. */
export function DrinkCompositionPreviewBar({ name }) {
  if (!name) return null;
  const { composition } = getDrinkMeta(name);
  if (!composition) return null;
  return (
    <div className="mt-2 rounded-lg border border-gold/30 bg-black/50 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-gold/75">{name}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-white/80">{composition}</p>
    </div>
  );
}

/** Só ao clicar em «i» — card sobreposto com fechar. */
export function DrinkCompositionPinnedOverlay({ name, onClose }) {
  if (!name) return null;
  const { composition } = getDrinkMeta(name);
  if (!composition) return null;

  return (
    <>
      <div
        className="absolute inset-0 z-30 rounded-t-2xl bg-black/60 sm:rounded-2xl"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="absolute left-1/2 top-1/2 z-40 w-[min(calc(100%-2rem),18rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gold/35 bg-panel px-4 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.65)]"
        role="dialog"
        aria-label={`Composição de ${name}`}
      >
        <p className="pr-6 text-xs font-medium leading-snug text-gold-soft">{name}</p>
        <p className="mt-2 text-sm leading-relaxed text-white/85">{composition}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-full border border-gold/40 py-1.5 text-xs text-gold hover:bg-gold/10"
        >
          Fechar
        </button>
      </div>
    </>
  );
}
