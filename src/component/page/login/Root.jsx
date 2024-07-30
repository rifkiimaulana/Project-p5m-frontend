// import { useState } from "react";
// import LoginIndex from "./Index";

// export default function Login() {
//   const [pageMode, setPageMode] = useState("index");
//   const [dataID, setDataID] = useState();

//   function getPageMode() {  
//     switch (pageMode) {
//       case "index":
//         return <LoginIndex onChangePage={handleSetPageMode} withID={dataID} />;
//       case "login":
//         return <LoginIndex onChangePage={handleSetPageMode} withID={dataID} />;
//       default:
//         return null;
//     }
//   }

//   function handleSetPageMode(mode, withID) {
//     setDataID(withID);
//     setPageMode(mode);
//   }

//   return <div>{getPageMode()}</div>;
// }