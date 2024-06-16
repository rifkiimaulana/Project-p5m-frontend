import logo from "../../assets/IMG_Logo.png";
import Icon from "../part/Icon";

export default function Header({ displayName, roleName }) {
  return (
    <div className="d-flex justify-content-between fixed-top border-bottom bg-white">
      <img
        src={logo}
        alt="Logo AstraTech"
        className="p-3"
        style={{ height: "70px" }}
      />
      <div className="pe-4 my-auto">
        <div className="d-flex justify-content-end">
          <div className="text-end">
            <p className="fw-bold mx-0 my-0">
              {displayName} ({roleName})
            </p>
            <small className="text-body-secondary" style={{ fontSize: ".7em" }}>
              Login terakhir: 6 Maret 2024, 10:38 WIB
            </small>
          </div>
          <div className="my-auto ms-4 mt-2">
            <p className="h2 p-0 m-0">
              <Icon name="envelope" />
              <span
                className="badge rounded-pill bg-danger position-absolute top-0 end-0"
                style={{
                  fontSize: ".3em",
                  marginTop: "15px",
                  marginRight: "15px",
                }}
              >
                0
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
