import Cookies from "js-cookie";

export default function Logout() {
  Cookies.remove("activeUser");
  window.location.href = "/login";
  return;
}
