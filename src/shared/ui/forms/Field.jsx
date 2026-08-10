import { forwardRef, useId } from "react";

const Field = forwardRef(function Field({ label, labelHidden = false, icon, id, ...inputProps }, ref) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  return (
    <div className="field" data-label-hidden={labelHidden || undefined}>
      <label htmlFor={fieldId}>{label}</label>
      {icon ? <span className="field-icon">{icon}</span> : null}
      <input id={fieldId} ref={ref} placeholder=" " {...inputProps} />
    </div>
  );
});

export default Field;
