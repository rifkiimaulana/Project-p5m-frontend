import { useState } from "react";
import MasterProdukIndex from "./Index";
import MasterProdukAdd from "./Add";
import MasterProdukDetail from "./Detail";
import MasterProdukEdit from "./Edit";

export default function MasterProduk() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterProdukIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterProdukAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <MasterProdukDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "edit":
        return (
          <MasterProdukEdit onChangePage={handleSetPageMode} withID={dataID} />
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
