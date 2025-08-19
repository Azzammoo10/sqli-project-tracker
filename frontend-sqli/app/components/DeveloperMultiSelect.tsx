import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, X, Search, ChevronDown, Users as UsersIcon } from "lucide-react";

export interface DeveloperOption { id: number; label: string; }

interface Props {
  options: DeveloperOption[];
  value: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
}

export default function DeveloperMultiSelect({
  options,
  value,
  onChange,
  placeholder = "Sélectionner des développeurs…",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(() => new Set(value), [value]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter(o => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const toggle = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    onChange(Array.from(next));
  };
  const remove = (id: number) => onChange(value.filter(v => v !== id));
  const selectAll = () => onChange(options.map(o => o.id));
  const clearAll = () => onChange([]);

  // --- Positionnement via portal
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const computePosition = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    setMenuStyle({
      position: "fixed",
      top: r.bottom + 8,
      left: r.left,
      width: r.width,
      zIndex: 50,
    });
  };
  useLayoutEffect(() => { if (open) computePosition(); }, [open, options.length, value.length]);
  useEffect(() => {
    if (!open) return;
    const onScroll = () => computePosition();
    const onResize = () => computePosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  // Fermer au clic dehors
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const btn = btnRef.current;
      const menu = menuRef.current;
      if (!btn || !menu) return;
      if (!btn.contains(e.target as Node) && !menu.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        ref={btnRef}
        onClick={() => setOpen(o => !o)}
        className="w-full min-h-[46px] rounded-xl border border-gray-200 bg-white text-left px-3 py-2
                   focus:outline-none focus:ring-2 focus:ring-[#7E56D9] flex items-center gap-2 hover:bg-gray-50 transition"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <UsersIcon className="h-4 w-4 text-gray-500" />
        <div className="flex-1">
          {value.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {value
                .map(id => options.find(o => o.id === id)?.label)
                .filter(Boolean)
                .map((label, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full border border-gray-200"
                  >
                    {label}
                    <button
                      type="button"
                      className="rounded-full hover:bg-gray-200 p-0.5 leading-none"
                      onClick={(e) => { e.stopPropagation(); remove(value[i]); }}
                      aria-label="Retirer"
                      title="Retirer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
            </div>
          )}
        </div>
        <span className="text-xs text-gray-500 mr-1">{value.length || 0}</span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && createPortal(
        <div
          ref={menuRef}
          style={menuStyle}
          className="rounded-2xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.07)] overflow-hidden"
          role="listbox"
        >
          {/* Header / Toolbar (sticky) */}
          <div className="sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2 p-3 border-b border-gray-100">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Rechercher un développeur…"
                  className="w-full rounded-lg border border-gray-300 bg-white px-8 py-2 text-sm text-gray-800
                             focus:outline-none focus:ring-2 focus:ring-[#7E56D9]"
                />
              </div>
              <button
                type="button"
                onClick={selectAll}
                className="text-xs font-medium px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                title="Tout sélectionner"
              >
                Tout sél.
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-medium px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                title="Tout désélectionner"
              >
                Tout désél.
              </button>
            </div>
          </div>

          {/* Liste */}
          <ul className="max-h-72 overflow-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-4 text-sm text-gray-500">Aucun résultat.</li>
            )}
            {filtered.map(opt => {
              const checked = selected.has(opt.id);
              return (
                <li
                  key={opt.id}
                  className="px-3 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-gray-800"
                  onClick={() => toggle(opt.id)}
                  role="option"
                  aria-selected={checked}
                >
                  <span
                    className={`h-4.5 w-4.5 rounded-md border grid place-items-center
                                ${checked ? "bg-[#4B2A7B] border-[#4B2A7B] text-white" : "border-gray-300 bg-white"}`}
                  >
                    {checked && <Check className="h-3 w-3" />}
                  </span>
                  <span className="text-sm flex-1">{opt.label}</span>
                </li>
              );
            })}
          </ul>

          {/* Footer (sticky) */}
          <div className="sticky bottom-0 bg-white">
            <div className="flex items-center justify-between gap-2 p-3 border-t border-gray-100">
              <div className="text-xs text-gray-600">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">
                  {value.length} sélectionné{value.length > 1 ? "s" : ""}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm font-medium px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
