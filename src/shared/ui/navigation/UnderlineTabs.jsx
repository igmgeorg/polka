import { useRef } from "react";

export default function UnderlineTabs({ tabs, current, onSelect, ariaLabel, baseline = true, reservedBrackets = false }) {
  const refs = useRef([]);

  function onKeyDown(event, index) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = (index + direction + tabs.length) % tabs.length;
    onSelect(tabs[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div className="underline-tabs" data-baseline={baseline || undefined} role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab, index) => {
        const active = tab.id === current;
        return (
          <button
            className="mono-focus"
            key={tab.id}
            ref={(element) => { refs.current[index] = element; }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            data-active={active || undefined}
            onClick={() => onSelect(tab.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {reservedBrackets && <span className="tab-bracket" aria-hidden="true">[ </span>}
            {tab.label}
            {reservedBrackets && <span className="tab-bracket" aria-hidden="true"> ]</span>}
          </button>
        );
      })}
    </div>
  );
}
