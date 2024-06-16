import { useEffect, useRef, useState } from "react";
import { API_LINK } from "../../util/Constants";
import { formatDate, separator } from "../../util/Formatting";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Table from "../../part/Table";

const inisialisasiData = [
  {
    Key: null,
    "Riwayat Harga (Rp.)": null,
    "Tanggal Berlaku": null,
    Count: 0,
  },
];

export default function MasterKelasDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);

  const formDataRef = useRef({
    namaProses: "",
    harga: "",
    tanggalBerlaku: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data1 = await UseFetch(
          API_LINK + "MasterKursProses/DetailKursProses",
          { id: withID }
        );

        if (data1 === "ERROR" || data1.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data kurs proses."
          );
        } else {
          formDataRef.current = { ...formDataRef.current, ...data1[0] };
        }

        const data2 = await UseFetch(
          API_LINK + "MasterKursProses/GetRiwayatKursProses",
          { id: withID }
        );

        if (data2 === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data riwayat kurs proses."
          );
        } else if (data2.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data2.map((value) => ({
            ...value,
            "Tanggal Berlaku": formatDate(value["Tanggal Berlaku"]),
            "Riwayat Harga (Rp.)": separator(value["Riwayat Harga (Rp.)"]),
            Alignment: ["center", "center"],
          }));
          setCurrentData(formattedData);
        }
      } catch (error) {
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <div className="card">
        <div className="card-header bg-primary fw-medium text-white">
          Detail Data Kurs Proses
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-4">
              <Label
                forLabel="namaProses"
                title="Nama Proses"
                data={formDataRef.current.namaProses}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="harga"
                title="Harga Saat Ini (Rp.)"
                data={separator(formDataRef.current.harga)}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="tanggalBerlaku"
                title="Tanggal Mulai Berlaku"
                data={formatDate(formDataRef.current.tanggalBerlaku)}
              />
            </div>
            <div className="col-lg-12 pt-3">
              <Table data={currentData} />
              <small className="mb-3 fst-italic">
                * Harga di atas merupakan harga proses per jam.
              </small>
            </div>
          </div>
        </div>
      </div>
      <div className="float-end my-4 mx-1">
        <Button
          classType="secondary px-4 py-2"
          label="KEMBALI"
          onClick={() => onChangePage("index")}
        />
      </div>
    </>
  );
}
