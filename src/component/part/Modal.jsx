import { forwardRef, useImperativeHandle, useRef } from "react";
import Button from "./Button";

const Modal = forwardRef(function Modal(
  { title, children, size, Button1 = null, Button2 = null },
  ref
) {
  const dialog = useRef();
  let maxSize;

  switch (size) {
    case "small":
      maxSize = "480px";
      break;
    case "medium":
      maxSize = "720px";
      break;
    case "large":
      maxSize = "1024px";
      break;
    case "full":
      maxSize = "100%";
      break;
  }

  useImperativeHandle(ref, () => {
    return {
      open() {
        dialog.current.showModal();
      },
    };
  });

  return (
    <dialog ref={dialog} style={{ maxWidth: maxSize }}>
      <div className="modal-header lead fw-medium p-3">{title}</div>
      <hr className="m-0" />
      <div className="modal-body p-3">{children}</div>
      <hr className="m-0" />
      <div className="modal-footer p-3">
        <form method="dialog">
          {Button1}
          {Button2}
          <Button
            classType="secondary"
            label="Tutup"
            onClick={() => {
              dialog.current.close();
            }}
          />
        </form>
      </div>
    </dialog>
  );
});

export default Modal;
