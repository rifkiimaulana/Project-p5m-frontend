import { useState } from "react";
import MasterOperatorIndex from "./Index";
import MasterOperatorAdd from "./Add";

export default function MasterOperator() {
  const [pageMode, setPageMode] = useState("index");

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterOperatorIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterOperatorAdd onChangePage={handleSetPageMode} />;
    }
  }

  function handleSetPageMode(mode) {
    setPageMode(mode);
  }

  return <div>{getPageMode()}</div>;
}
