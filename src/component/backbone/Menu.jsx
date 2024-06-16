import { useEffect } from "react";
import Icon from "../part/Icon";

let active_menu;
let active_collapse;

const activeURL = location.protocol + "//" + location.host + location.pathname;

function checkIcon(menu) {
  let menuIcon = "angle-down";

  switch (menu) {
    case "Logout":
      menuIcon = "sign-out-alt";
      break;
    case "Beranda":
      menuIcon = "home";
      break;
  }

  return menuIcon;
}

function setActiveMenu(menu) {
  active_menu = menu;
}

function setActiveCollapse(id) {
  active_collapse = id;
}

export default function Menu({ listMenu }) {
  useEffect(() => {
    if (document.getElementById("spanMenu")) {
      document.getElementById("spanMenu").innerHTML = active_menu;
      if (active_collapse)
        document.getElementById(active_collapse).classList.add("show");
    }
  }, [listMenu]);

  return (
    <nav>
      {listMenu.map((menu) => {
        if (activeURL === menu["link"]) setActiveMenu(menu["head"]);
        return (
          <div key={"#menucollapse" + menu["headkey"]}>
            <a
              className="text-decoration-none text-black fw-bold"
              data-bs-toggle={menu["link"] === "#" ? "collapse" : ""}
              href={
                menu["link"] === "#"
                  ? "#menucollapse" + menu["headkey"]
                  : menu["link"]
              }
            >
              <div
                className={
                  "w-100 px-3 py-2 d-flex" +
                  (activeURL === menu["link"] ? " bg-primary text-white" : "")
                }
              >
                <Icon
                  type="Bold"
                  name={checkIcon(menu["head"])}
                  cssClass="me-2"
                  style={{ marginTop: "2px" }}
                />
                <span>{menu["head"]}</span>
              </div>
            </a>
            <div className="collapse" id={"menucollapse" + menu["headkey"]}>
              {menu["sub"].map((sub) => {
                if (activeURL === sub["link"]) {
                  setActiveMenu(menu["head"] + " - " + sub["title"]);
                  setActiveCollapse("menucollapse" + menu["headkey"]);
                }
                return (
                  <a
                    className="text-decoration-none text-black"
                    href={sub["link"]}
                    key={"#menucollapse" + menu["headkey"] + sub["link"]}
                  >
                    <div
                      className={
                        "w-100 ps-4 pe-3 py-1 d-flex fw-medium" +
                        (activeURL === sub["link"]
                          ? " bg-primary text-white"
                          : "")
                      }
                    >
                      <Icon name="minus-small" cssClass="me-2 mt-1" />
                      <span>{sub["title"]}</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
