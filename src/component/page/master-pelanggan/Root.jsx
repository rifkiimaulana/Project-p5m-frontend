import { useState } from "react";
import MasterPelangganIndex from "./Index";
import MasterPelangganAdd from "./Add";
import MasterPelangganDetail from "./Detail";
import MasterPelangganEdit from "./Edit";

export default function MasterPelanggan() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterPelangganIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterPelangganAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <MasterPelangganDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "edit":
        return (
          <MasterPelangganEdit
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
