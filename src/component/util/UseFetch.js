import Cookies from "js-cookie";
import { decryptId } from "./Encryptor";

const fetchData = async (url, param = {}) => {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  try {
    let paramToSent = {
      ...param,
      activeUser: activeUser === "" ? undefined : activeUser,
    };
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(paramToSent),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    if (response.ok) {
      return result;
    } else {
      return "ERROR";
    }
  } catch (err) {
    return "ERROR";
  }
};

export default fetchData;
