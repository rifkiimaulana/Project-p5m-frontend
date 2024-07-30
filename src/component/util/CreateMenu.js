import { ROOT_LINK, API_LINK, APPLICATION_ID } from "./Constants";
import axios from 'axios';

const CreateMenu = (role) => {
  try {
    return axios.post(API_LINK + "Utilities/GetListMenu", {
      username: "",
      role: role,
      application: APPLICATION_ID,
    })
      .then((response) => {
        const data = response.data;

        let lastHeadkey = "";
        const transformedMenu = [
          {
            head: "Logout",
            headkey: "logout",
            link: ROOT_LINK + "/logout",
            sub: [],
          },
          {
            head: "Beranda",
            headkey: "beranda",
            link: ROOT_LINK + "/",
            sub: [],
          },
        ];

        data.forEach((item) => {
          if (item.parent === null || item.link === "#") {
            lastHeadkey = item.nama.toLowerCase().replace(/\s/g, "_");
            transformedMenu.push({
              head: item.nama,
              headkey: lastHeadkey,
              link: item.link === "#" ? item.link : ROOT_LINK + "/" + item.link,
              sub: [],
            });
          } else {
            const parent = transformedMenu.find(
              (menu) => menu.headkey === lastHeadkey
            );
            if (parent) {
              parent.sub.push({
                title: item.nama,
                link: ROOT_LINK + "/" + item.link,
              });
            }
          }
        });

        return transformedMenu;
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        return [];
      });
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
};

export default CreateMenu;