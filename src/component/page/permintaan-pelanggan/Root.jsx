import { useState } from "react";
import PermintaanPelangganIndex from "./Index";
import PermintaanPelangganAdd from "./Add";
import PermintaanPelangganDetail from "./Detail";
import PermintaanPelangganEdit from "./Edit";

export default function PermintaanPelanggan() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <PermintaanPelangganIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <PermintaanPelangganAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <PermintaanPelangganDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "edit":
        return (
          <PermintaanPelangganEdit
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
