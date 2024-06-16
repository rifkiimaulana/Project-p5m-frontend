import { lazy } from "react";

const Beranda = lazy(() => import("../page/beranda/Root"));
const MasterPic = lazy(() => import("../page/master-pic/Root"));
const MasterKelas = lazy(() => import("../page/master-kelas/Root"));
const TrP5m = lazy(() => import("../page/trP5m/Root"));
const DetailP5m = lazy(() => import("../page/TrdetailP5m/Root"));
const CetakP5M = lazy(() => import("../page/CetakP5m/Root"));

const routeList = [
  {
    path: "/",
    element: <Beranda />,
  },
  {
    path: "/master_pic",
    element: <MasterPic />,
  },
  {
    path: "/master_kelas",
    element: <MasterKelas />,
  },
  {
    path: "/trp5m",
    element: <TrP5m/>,
  },
  {
    path: "/TrdetailP5m",
    element: <DetailP5m/>,
  },
  {
    path: "/cetakP5m",
    element: <CetakP5M/>,
  },
];

export default routeList;
