import { useEffect, useId, useRef, useState } from "react";

export default function Select({ label, labelHidden = false, value, onChange, options }) {
  const id = useId();
  const root = useRef(null);
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function close(event) {
      if (!root.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  function onKeyDown(event) {
    const current = Math.max(0, options.findIndex((option) => option.value === value));
    if (event.key === "Escape") return setOpen(false);
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const next = (current + direction + options.length) % options.length;
    onChange(options[next].value);
    setOpen(true);
  }

  return (
    <div className="select-field" data-label-hidden={labelHidden || undefined} ref={root}>
      <span id={`${id}-label`}>{label}</span>
      <button className="select-trigger mono-focus" type="button" aria-haspopup="listbox" aria-expanded={open} aria-labelledby={`${id}-label`} onClick={() => setOpen(!open)} onKeyDown={onKeyDown}>
        <span className="select-value">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h10M4 12h7M4 17h4M17 5v14m0 0-3-3m3 3 3-3" /></svg>
          <span>{selected?.label}</span>
        </span>
        <svg className="select-chevron" data-open={open || undefined} aria-hidden="true" viewBox="0 0 24 24">
          <path d="m7 9 5 5 5-5" />
        </svg>
      </button>
      {open && <ul className="select-list mono-scrollbar" role="listbox" aria-labelledby={`${id}-label`}>
        {options.map((option) => <li key={option.value} role="option" aria-selected={option.value === value}>
          <button type="button" onClick={() => { onChange(option.value); setOpen(false); }}>{option.label}{option.value === value && <b>✓</b>}</button>
        </li>)}
      </ul>}
    </div>
  );
}
