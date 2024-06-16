export default function Label({ title, data, forLabel }) {
  return (
    <>
      <div className="mb-3">
        <label htmlFor={forLabel} className="form-label fw-bold">
          {title}
        </label>
        <br />
        <span style={{ whiteSpace: "pre-wrap" }}>{data}</span>
      </div>
    </>
  );
}
