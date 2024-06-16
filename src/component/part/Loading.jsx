import { PropagateLoader } from "react-spinners";

export default function Loading() {
  return (
    <div style={{ textAlign: "-webkit-center" }} className="mt-5">
      <PropagateLoader color="#0d6efd" loading={true} />
    </div>
  );
}
