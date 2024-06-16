import { useState } from "react";
import TrP5mIndex from "./Index";

export default function TrP5m() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <TrP5mIndex onChangePage={handleSetPageMode} withID={dataID} />;
      case "add":
        return <TrP5mAdd onChangePage={handleSetPageMode} withID={dataID} />;
      default:
        return null;
    }
  }

  function handleSetPageMode(mode) {
    setPageMode(mode);
  }

  function handleSetPageMode(mode, withID) {
    setDataID(withID);
    setPageMode(mode);
  }

  return <div>{getPageMode()}</div>;
}