import Cookies from "js-cookie";
import { decryptId } from "./Encryptor";
import axios from 'axios';

const fetchData = (url, param = {}) => {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  try {
    let paramToSent = {
      ...param,
      activeUser: activeUser === "" ? undefined : activeUser,
    };

    return axios.post(url, paramToSent, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(response => {
        if (response.status === 200) {
          return response.data;
        } else {
          return Promise.reject("ERROR");
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        return "ERROR";
      });
  } catch (err) {
    console.error('Fetch error:', err);
    return "ERROR";
  }
};

export default fetchData;