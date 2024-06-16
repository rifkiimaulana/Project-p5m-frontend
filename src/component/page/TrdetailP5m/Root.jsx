import { useState } from "react";
import TrdetailP5mIndex from "./Index";

export default function DetailP5m() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <TrdetailP5mIndex onChangePage={handleSetPageMode} withID={dataID} />;
      case "add":
        return <TrdetailP5mAdd onChangePage={handleSetPageMode} withID={dataID} />;
      default:
        return null;
    }
  }

  function handleSetPageMode(mode, withID) {
    setDataID(withID);
    setPageMode(mode);
  }

  return <div>{getPageMode()}</div>;
}