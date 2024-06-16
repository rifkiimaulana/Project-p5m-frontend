import { useState } from "react";
import MasterKelasIndex from "./Index";
import MasterKelasAdd from "./Add";
import MasterKelasDetail from "./Detail";
import MasterKelasIndex from "../master-kelas/Index";

export default function MasterKelas() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterKelasIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterKelasAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <MasterKelasDetail
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
