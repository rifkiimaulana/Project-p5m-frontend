import { useState } from "react";
import MasterPicIndex from "./Index";
import MasterPicAdd from "./Add";
import MasterPicDetail from "./Detail";
import MasterPicEdit from "./Edit";

export default function MasterPic() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterPicIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterPicAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <MasterPicDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "edit":
        return (
          <MasterPicEdit onChangePage={handleSetPageMode} withID={dataID} />
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
