import { APPLICATION_NAME } from "../util/Constants";

export default function ContentTitle() {
  return (
    <>
      <div className="border-bottom pb-2">
        <span className="fw-bold text-primary">{APPLICATION_NAME}</span>
        &nbsp;&nbsp;/&nbsp;&nbsp;<span id="spanMenu"></span>
      </div>
    </>
  );
}
