import { forwardRef } from "react";

const DropDown = forwardRef(function DropDown(
  {
    arrData,
    type = "pilih",
    label = "",
    forInput,
    isRequired = false,
    isDisabled = false,
    errorMessage,
    showLabel = true,
    ...props
  },
  ref
) {
  let placeholder = "";

  switch (type) {
    case "pilih":
      placeholder = <option value="">{"-- Pilih " + label + " --"}</option>;
      break;
    case "semua":
      placeholder = <option value="">-- Semua --</option>;
      break;
    default:
      break;
  }

  return (
    <>
      <div className="mb-3">
        {showLabel && (
          <label htmlFor={forInput} className="form-label fw-bold">
            {label}
            {isRequired ? <span className="text-danger"> *</span> : ""}
            {errorMessage ? (
              <span className="fw-normal text-danger"> {errorMessage}</span>
            ) : (
              ""
            )}
          </label>
        )}
        <select
          className="form-select"
          id={forInput}
          name={forInput}
          ref={ref}
          disabled={isDisabled}
          {...props}
        >
          {placeholder}
          {arrData &&
            arrData.length > 0 &&
            arrData.map((data) => {
              return (
                <option key={data.Value} value={data.Value}>
                  {data.Text}
                </option>
              );
            })}
        </select>
      </div>
    </>
  );
});

export default DropDown;
