export default function ContentBody({ children }) {
  return (
    <div className="mt-3 overflow-y-auto" style={{ minHeight: "50vh" }}>
      {children}
    </div>
  );
}
