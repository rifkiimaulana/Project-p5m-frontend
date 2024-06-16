import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Cookies from "js-cookie";
import { decryptId } from "./component/util/Encryptor";
import { ROOT_LINK } from "./component/util/Constants";
import CreateMenu from "./component/util/CreateMenu";
import CreateRoute from "./component/util/CreateRoute.jsx";

import Container from "./component/backbone/Container";
import Header from "./component/backbone/Header";
import SideBar from "./component/backbone/SideBar";

import Login from "./component/page/login/Index";
import Logout from "./component/page/logout/Index";
import NotFound from "./component/page/not-found/Index";

export default function App() {
  const [listMenu, setListMenu] = useState([]);
  const [listRoute, setListRoute] = useState([]);
  const isLoginPage = window.location.pathname === "/login";
  const isLogoutPage = window.location.pathname === "/logout";
  const cookie = Cookies.get("activeUser");

  if (isLoginPage) return <Login />;
  else if (isLogoutPage) return <Logout />;
  else if (!cookie) window.location.href = "/login";
  else {
    const userInfo = JSON.parse(decryptId(cookie));

    useEffect(() => {
      const getMenu = async () => {
        const menu = await CreateMenu(userInfo.role);
        const route = CreateRoute.filter((routeItem) => {
          const pathExistsInMenu = menu.some((menuItem) => {
            if (menuItem.link.replace(ROOT_LINK, "") === routeItem.path) {
              return true;
            }
            if (menuItem.sub && menuItem.sub.length > 0) {
              return menuItem.sub.some(
                (subItem) =>
                  subItem.link.replace(ROOT_LINK, "") === routeItem.path
              );
            }
            return false;
          });

          return pathExistsInMenu;
        });

        route.push({
          path: "/*",
          element: <NotFound />,
        });

        setListMenu(menu);
        setListRoute(route);
      };

      getMenu();
    }, []);

    return (
      <>
        {listRoute.length > 0 && (
          <>
            <Header displayName={userInfo.nama} roleName={userInfo.peran} />
            <div style={{ marginTop: "70px" }}></div>
            <div className="d-flex flex-row">
              <SideBar listMenu={listMenu} />
              <Container>
                <RouterProvider router={createBrowserRouter(listRoute)} />
              </Container>
            </div>
          </>
        )}
      </>
    );
  }
}
