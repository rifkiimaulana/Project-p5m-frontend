import { useState } from "react";
import MasterAlatMesinIndex from "./Index";
import MasterAlatMesinAdd from "./Add";
import MasterAlatMesinDetail from "./Detail";
import MasterAlatMesinEdit from "./Edit";

export default function MasterAlatMesin() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterAlatMesinIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterAlatMesinAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <MasterAlatMesinDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "edit":
        return (
          <MasterAlatMesinEdit
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
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
