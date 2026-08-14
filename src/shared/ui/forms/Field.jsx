import { forwardRef, useId } from "react";
import { XIcon } from "../../../components/Icons";

const Field = forwardRef(function Field({ label, labelHidden = false, icon, id, onClear, ...inputProps }, ref) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  return (
    <div className="field" data-label-hidden={labelHidden || undefined}>
      <label htmlFor={fieldId}>{label}</label>
      {icon ? <span className="field-icon">{icon}</span> : null}
      <input id={fieldId} ref={ref} placeholder=" " {...inputProps} />
      {onClear && inputProps.value ? <button type="button" className="field-clear" aria-label="Очистить" onClick={onClear}><XIcon /></button> : null}
    </div>
  );
});

export default Field;
