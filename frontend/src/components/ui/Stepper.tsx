import { Check } from "lucide-react";

interface Props { steps: string[]; current: number; reachable: number; onGo: (i: number) => void }

export function Stepper({ steps, current, reachable, onGo }: Props) {
  return (
    <nav aria-label="Progreso">
      <ol className="flex items-center gap-2 sm:gap-4">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const can = i <= reachable && !active;
          return (
            <li key={s} className="flex flex-1 items-center gap-3">
              <button type="button" disabled={!can} onClick={() => onGo(i)} aria-current={active ? "step" : undefined}
                className={`flex items-center gap-3 text-left ${can ? "cursor-pointer" : "cursor-default"}`}>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-1 transition ${
                  active ? "bg-ink-900 text-white ring-ink-900" : done ? "bg-gold-500 text-ink-950 ring-gold-500" : "bg-white text-ink-500 ring-line"}`}>
                  {done ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
                </span>
                <span className={`hidden text-sm font-medium sm:block ${active ? "text-ink-900" : "text-ink-500"}`}>{s}</span>
              </button>
              {i < steps.length - 1 && <span aria-hidden className={`h-px flex-1 ${done ? "bg-gold-500" : "bg-line"}`} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
