import { useState } from "react";
import CetakP5mIndex from "./Index";

export default function CetakP5M() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <CetakP5mIndex onChangePage={handleSetPageMode} withID={dataID} />;
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